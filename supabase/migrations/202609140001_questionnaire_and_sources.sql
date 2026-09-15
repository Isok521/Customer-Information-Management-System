begin;
-- Source dictionary is separate from answer snapshots: archiving a term keeps customer history.
create table public.customer_source_terms (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(trim(label)) between 1 and 40),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index active_source_label_idx on public.customer_source_terms(lower(trim(label))) where archived_at is null;
create table public.health_questionnaires (
  customer_id uuid primary key references public.customers(id) on delete restrict,
  version integer not null default 1 check (version = 1),
  filled_at date,
  experience_item text not null default '',
  age_range text not null default '',
  symptoms text[] not null default '{}',
  other_symptoms text not null default '',
  systolic smallint check (systolic between 1 and 999),
  diastolic smallint check (diastolic between 1 and 999),
  heart_rate smallint check (heart_rate between 1 and 999),
  wellness_preferences text[] not null default '{}',
  spending_view text not null default '',
  receive_updates boolean,
  annual_checkup boolean,
  abnormal_indicators text not null default '',
  urgent_symptoms boolean,
  urgent_symptoms_detail text not null default '',
  weekly_exercise boolean,
  personal_needs text not null default '',
  source_channels text[] not null default '{}',
  source_other text not null default '',
  contraindication_implants boolean,
  contraindication_bleeding boolean,
  contraindication_infection boolean,
  contraindication_acute boolean,
  contraindication_tumor boolean,
  contraindication_special boolean,
  contraindication_under_five boolean,
  contraindication_notes text not null default '',
  notice_read boolean,
  paper_signed boolean,
  signer_name text not null default '',
  signed_at date,
  signature_notes text not null default '',
  updated_by uuid references public.staff(id) on delete restrict,
  updated_at timestamptz not null default now(),
  check (paper_signed is distinct from false or (length(trim(signer_name)) = 0 and signed_at is null))
);
comment on table public.health_questionnaires is 'Paper questionnaire transcription. NULL boolean = not filled / not verified, not false. Signature name is a transcription, not an electronic signature.';
create trigger questionnaire_updated before update on public.health_questionnaires for each row execute function public.touch_updated_at();
alter table public.customer_source_terms enable row level security;
alter table public.health_questionnaires enable row level security;
revoke all on public.customer_source_terms,public.health_questionnaires from anon,authenticated;
grant select on public.customer_source_terms,public.health_questionnaires to authenticated;
create policy staff_read on public.customer_source_terms for select to authenticated using ((select public.is_active_staff()));
create policy staff_read on public.health_questionnaires for select to authenticated using ((select public.is_active_staff()));

alter table public.packages add column opening_used integer not null default 0 check (opening_used >= 0 and opening_used <= total_sessions);
comment on column public.packages.opening_used is 'Opening used count from pre-system paper records; not a fabricated service or usage event.';
drop view public.package_balances;
create view public.package_balances with (security_invoker = true) as
select p.*, (p.opening_used + coalesce(u.used_sessions,0))::integer as used_sessions,
  (p.total_sessions - p.opening_used - coalesce(u.used_sessions,0))::integer as remaining_sessions,
  case when p.status <> 'active' then p.status::text
    when p.valid_until < (now() at time zone 'Asia/Shanghai')::date then 'expired'
    when p.opening_used + coalesce(u.used_sessions,0) >= p.total_sessions then 'exhausted'
    else 'active' end as effective_status
from public.packages p left join
  (select package_id,sum(quantity) as used_sessions from public.package_usages group by package_id) u on u.package_id=p.id;
revoke all on public.package_balances from anon,authenticated;
grant select on public.package_balances to authenticated;

create or replace function public.consume_package_on_completion() returns trigger language plpgsql security definer set search_path = public as $$
declare p public.packages; used_count integer; service_day date;
begin
  if new.status <> 'completed' or new.package_id is null then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'completed' then return new; end if;
  select * into p from public.packages where id = new.package_id and customer_id = new.customer_id for update;
  if not found then raise exception 'Package does not belong to customer'; end if;
  service_day := (new.service_date at time zone 'Asia/Shanghai')::date;
  if p.status <> 'active' or service_day < p.purchased_at or service_day > p.valid_until then raise exception 'Package is unavailable for the service date'; end if;
  if not (new.service_type = any(p.included_items)) then raise exception 'Service not included in package'; end if;
  select p.opening_used + coalesce(sum(quantity),0) into used_count from public.package_usages where package_id = p.id;
  if used_count >= p.total_sessions then raise exception 'Insufficient package balance'; end if;
  insert into public.package_usages(package_id,session_id,customer_id,staff_id,used_at) values(new.package_id,new.id,new.customer_id,new.staff_id,new.completed_at);
  return new;
end $$;
commit;
