-- Customer service relay, phase 1. Single company / store, Asia/Shanghai business dates.
-- Run against a NEW Supabase project using migrations. No production seed data.
begin;
create extension if not exists pgcrypto;
create type public.staff_role as enum ('admin', 'reception', 'therapist');
create type public.customer_stage as enum ('new', 'trial', 'ongoing', 'follow_up');
create type public.session_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
create type public.package_status as enum ('active', 'frozen', 'cancelled');
create type public.sales_reaction as enum ('accepted', 'high_intent', 'hesitant', 'rejected', 'not_discussed');

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  role public.staff_role not null default 'therapist',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  phone text not null unique check (phone ~ '^1[3-9][0-9]{9}$'),
  gender text not null default 'unspecified' check (gender in ('female','male','unspecified')),
  age_years smallint check (age_years between 0 and 130),
  age_range text,
  first_visit_date date not null,
  source text not null default '',
  receptionist_id uuid not null references public.staff(id) on delete restrict,
  stage public.customer_stage not null default 'new',
  tags text[] not null default '{}',
  remarks text not null default '',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.health_profiles (
  customer_id uuid primary key references public.customers(id) on delete restrict,
  symptoms text not null default '',
  chronic_conditions text not null default '',
  systolic_bp smallint check (systolic_bp > 0),
  diastolic_bp smallint check (diastolic_bp > 0),
  heart_rate smallint check (heart_rate > 0),
  measured_at timestamptz,
  measurement_source text not null default '',
  primary_goal text not null default '',
  preferences text not null default '',
  spending_view text not null default '',
  contraindications text not null default '',
  remarks text not null default '',
  updated_by uuid references public.staff(id) on delete restrict,
  updated_at timestamptz not null default now()
);
-- A purchased entitlement. Catalogue templates may be introduced later.
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  purchased_at date not null,
  amount numeric(12,2) not null check (amount >= 0),
  included_items text[] not null check (cardinality(included_items) > 0),
  total_sessions integer not null check (total_sessions > 0),
  valid_until date not null,
  status public.package_status not null default 'active',
  created_by uuid not null references public.staff(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (id, customer_id),
  check (valid_until >= purchased_at)
);
create table public.service_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  service_date timestamptz not null,
  staff_id uuid not null references public.staff(id) on delete restrict,
  service_type text not null check (length(trim(service_type)) > 0),
  package_id uuid,
  status public.session_status not null default 'in_progress',
  complaint text not null check (length(trim(complaint)) > 0),
  physical_state text not null default '',
  attention text not null default '',
  result text not null default '',
  subjective_feedback text not null default '',
  therapist_summary text not null default '',
  physical_change text not null default '',
  effect_rating text not null default '',
  sales_discussed boolean not null default false,
  completed_at timestamptz,
  created_by uuid not null references public.staff(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, customer_id),
  unique (id, customer_id, package_id, staff_id),
  foreign key (package_id, customer_id) references public.packages(id, customer_id) on delete restrict,
  check ((status = 'completed') = (completed_at is not null)),
  check (completed_at is null or completed_at >= service_date),
  check (status <> 'completed' or (length(trim(result)) > 0 and length(trim(subjective_feedback)) > 0 and length(trim(therapist_summary)) > 0))
);
create unique index one_active_service_per_customer on public.service_sessions(customer_id) where status = 'in_progress';
create table public.service_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.service_sessions(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  customer_feedback text not null default '',
  therapist_observation text not null default '',
  remarks text not null default '',
  created_by uuid not null references public.staff(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (length(trim(customer_feedback || therapist_observation || remarks)) > 0)
);
-- Usage is the source of truth: do not store redundant editable used/remaining counters.
create table public.package_usages (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null,
  session_id uuid not null unique,
  customer_id uuid not null,
  staff_id uuid not null,
  quantity integer not null default 1 check (quantity = 1),
  used_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (package_id, customer_id) references public.packages(id, customer_id) on delete restrict,
  foreign key (session_id, customer_id, package_id, staff_id)
    references public.service_sessions(id, customer_id, package_id, staff_id) on delete restrict
);
create table public.sales_follow_ups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  session_id uuid,
  staff_id uuid not null references public.staff(id) on delete restrict,
  recommended_item text not null default '',
  recommended_package text not null default '',
  reaction public.sales_reaction not null default 'not_discussed',
  concerns text[] not null default '{}' check (concerns <@ array['price','effect','time','family','insurance','other']::text[]),
  customer_quote text not null default '',
  next_strategy text not null check (length(trim(next_strategy)) > 0),
  due_at timestamptz,
  status text not null default 'pending' check (status in ('pending','done')),
  outcome text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (session_id, customer_id) references public.service_sessions(id, customer_id) on delete restrict,
  check ((status = 'done') = (completed_at is not null)),
  check (status <> 'done' or length(trim(outcome)) > 0)
);
create index customers_name_idx on public.customers(name);
create index customers_tags_idx on public.customers using gin(tags);
create index customers_updated_idx on public.customers(updated_at desc);
create index sessions_customer_date_idx on public.service_sessions(customer_id, service_date desc);
create index sessions_date_idx on public.service_sessions(service_date, status);
create index notes_session_time_idx on public.service_notes(session_id, recorded_at);
create index packages_customer_idx on public.packages(customer_id);
create index usages_package_idx on public.package_usages(package_id);
create index followups_pending_idx on public.sales_follow_ups(due_at, staff_id) where status = 'pending';
create index followups_customer_idx on public.sales_follow_ups(customer_id, created_at desc);

create view public.package_balances with (security_invoker = true) as
select p.*, coalesce(u.used_sessions, 0)::integer as used_sessions,
  (p.total_sessions - coalesce(u.used_sessions, 0))::integer as remaining_sessions,
  case when p.status <> 'active' then p.status::text
    when p.valid_until < (now() at time zone 'Asia/Shanghai')::date then 'expired'
    when coalesce(u.used_sessions, 0) >= p.total_sessions then 'exhausted'
    else 'active' end as effective_status
from public.packages p
left join (select package_id, sum(quantity) as used_sessions from public.package_usages group by package_id) u on u.package_id = p.id;

create function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
create trigger customers_updated before update on public.customers for each row execute function public.touch_updated_at();
create trigger health_updated before update on public.health_profiles for each row execute function public.touch_updated_at();
create trigger sessions_updated before update on public.service_sessions for each row execute function public.touch_updated_at();

-- Serialize package consumption on a package row and make completed sessions immutable.
-- Phase 2 will wrap session completion, follow-up insertion and usage in one RPC transaction.
create function public.guard_session_change() returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Service records must be retained; cancel before completion instead';
  end if;
  if old.status = 'completed' then
    raise exception 'Completed services are immutable; use a future audited correction workflow';
  end if;
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'Cancelled services cannot be restarted';
  end if;
  if new.customer_id <> old.customer_id then raise exception 'Service customer cannot be changed'; end if;
  return new;
end $$;
create trigger guard_service before update or delete on public.service_sessions for each row execute function public.guard_session_change();

create function public.consume_package_on_completion() returns trigger language plpgsql security definer set search_path = public as $$
declare p public.packages; used_count integer; service_day date;
begin
  if new.status <> 'completed' or new.package_id is null then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'completed' then return new; end if;
  select * into p from public.packages where id = new.package_id and customer_id = new.customer_id for update;
  if not found then raise exception 'Package does not belong to customer'; end if;
  service_day := (new.service_date at time zone 'Asia/Shanghai')::date;
  if p.status <> 'active' or service_day < p.purchased_at or service_day > p.valid_until then
    raise exception 'Package is unavailable for the service date';
  end if;
  if not (new.service_type = any(p.included_items)) then raise exception 'Service not included in package'; end if;
  select coalesce(sum(quantity),0) into used_count from public.package_usages where package_id = p.id;
  if used_count >= p.total_sessions then raise exception 'Insufficient package balance'; end if;
  insert into public.package_usages(package_id, session_id, customer_id, staff_id, used_at)
    values(new.package_id, new.id, new.customer_id, new.staff_id, new.completed_at);
  return new;
end $$;
create trigger consume_package after insert or update on public.service_sessions for each row execute function public.consume_package_on_completion();

-- No anonymous access. Role is kept on trusted staff rows, not editable user metadata.
-- Phase 1 exposes only authenticated staff reads. Application writes remain deliberately closed
-- until authenticated transactional RPCs, audit logging and role checks are implemented.
create function public.is_active_staff() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.staff where auth_user_id = auth.uid() and active);
$$;
revoke all on function public.is_active_staff() from public;
grant execute on function public.is_active_staff() to authenticated;
revoke all on function public.consume_package_on_completion() from public, anon, authenticated;
revoke all on function public.guard_session_change() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
do $$ declare table_name text; begin
  foreach table_name in array array['staff','customers','health_profiles','packages','service_sessions','service_notes','package_usages','sales_follow_ups'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
    execute format('create policy staff_read on public.%I for select to authenticated using ((select public.is_active_staff()))', table_name);
  end loop;
end $$;
revoke all on public.package_balances from anon, authenticated;
grant select on public.package_balances to authenticated;
comment on table public.customers is 'One company-owned customer archive; phone is unique in phase 1.';
comment on table public.health_profiles is 'Customer self-report and store observations; not a diagnosis.';
comment on table public.package_usages is 'Append-only consumption ledger. Written only by service completion trigger.';
commit;
