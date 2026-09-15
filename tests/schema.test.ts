import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
test("PostgreSQL Schema：约束、完成扣次回滚与员工RLS",async()=>{
  const db=new PGlite();
  try {
    // Supabase Auth stand-in. PGlite has core gen_random_uuid but not pgcrypto packaging.
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
      grant usage on schema public,auth to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;`);
    const migration=readFileSync("supabase/migrations/202609130001_initial_schema.sql","utf8").replace("create extension if not exists pgcrypto;", "");
    await db.exec(migration);
    await db.exec(readFileSync("supabase/migrations/202609140001_questionnaire_and_sources.sql","utf8"));
    const staff="00000000-0000-4000-8000-000000000001",customer="00000000-0000-4000-8000-000000000002",pkg="00000000-0000-4000-8000-000000000003",session="00000000-0000-4000-8000-000000000004",user="00000000-0000-4000-8000-000000000005";
    await db.query("insert into auth.users values ($1)",[user]);
    await db.query("insert into staff(id,auth_user_id,name,role) values($1,$2,'演示技师','therapist')",[staff,user]);
    await db.query("insert into customers(id,name,phone,first_visit_date,receptionist_id) values($1,'演示客户','13800002001','2026-09-13',$2)",[customer,staff]);
    await assert.rejects(db.query("insert into customers(name,phone,first_visit_date,receptionist_id) values('重复手机号','13800002001','2026-09-13',$1)",[staff]),/unique/);
    await db.query("insert into packages(id,customer_id,name,purchased_at,amount,included_items,total_sessions,valid_until,created_by) values($1,$2,'体验卡','2026-09-01',99,array['肩颈舒缓'],1,'2026-10-01',$3)",[pkg,customer,staff]);
    await db.query("insert into service_sessions(id,customer_id,service_date,staff_id,service_type,package_id,complaint,created_by) values($1,$2,'2026-09-13 09:00+08',$3,'肩颈舒缓',$4,'肩颈疲劳',$3)",[session,customer,staff,pkg]);
    assert.equal((await db.query<{remaining_sessions:number}>("select remaining_sessions from package_balances")).rows[0].remaining_sessions,1);
    await assert.rejects(db.query("update service_sessions set status='completed',completed_at='2026-09-13 10:00+08' where id=$1",[session]),/check constraint/);
    await db.query("update service_sessions set status='completed',completed_at='2026-09-13 10:00+08',result='完成',subjective_feedback='有所缓解',therapist_summary='下次确认状态' where id=$1",[session]);
    assert.equal((await db.query<{remaining_sessions:number}>("select remaining_sessions from package_balances")).rows[0].remaining_sessions,0);
    assert.equal((await db.query("select * from package_usages")).rows.length,1);
    await assert.rejects(db.query("update service_sessions set result='重复完成' where id=$1",[session]),/immutable/);
    await assert.rejects(db.query("insert into service_sessions(customer_id,service_date,staff_id,service_type,package_id,complaint,created_by,status,completed_at,result,subjective_feedback,therapist_summary) values($1,'2026-09-14 09:00+08',$2,'肩颈舒缓',$3,'肩颈疲劳',$2,'completed','2026-09-14 10:00+08','完成','舒服些','继续观察')",[customer,staff,pkg]),/Insufficient/);
    assert.equal((await db.query("select * from service_sessions")).rows.length,1,"扣次失败必须回滚服务插入");
    await db.exec("set role anon");
    await assert.rejects(db.query("select * from customers"),/permission denied/);
    await db.exec("reset role; set role authenticated");
    assert.equal((await db.query("select * from customers")).rows.length,0,"未登记员工无数据");
    await db.query("select set_config('test.uid',$1,false)",[user]);
    assert.equal((await db.query("select * from customers")).rows.length,1,"有效员工可读取");
    assert.equal((await db.query("select * from package_balances")).rows.length,1,"余额视图沿用RLS");
    await assert.rejects(db.query("update staff set role='admin'"),/permission denied/);
    await db.exec("reset role; update staff set active=false; set role authenticated");
    assert.equal((await db.query("select * from customers")).rows.length,0,"停用员工无数据");
  } finally { await db.close(); }
});
