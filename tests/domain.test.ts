import { test } from "node:test";
import assert from "node:assert/strict";
import { mockStore } from "../src/lib/data/mock";
import { packageBalance, recentSessions, searchCustomers } from "../src/lib/domain/selectors";
import { createSession } from "../src/lib/data/repository";
test("跨技师接力：最近已完成服务不是当前进行中服务，套餐仍剩1次",()=>{
  assert.equal(recentSessions(mockStore,"c-1")[0].id,"s-2");
  assert.deepEqual(packageBalance(mockStore,mockStore.packages[0]),{used:2,remaining:1});
  assert.deepEqual(new Set(recentSessions(mockStore,"c-1").map(s=>s.staffId)),new Set(["staff-1","staff-2"]));
});
test("姓名与手机号搜索，包括空白处理和无结果",()=>{
  assert.equal(searchCustomers(mockStore," 陈玉兰 ")[0].id,"c-1");
  assert.equal(searchCustomers(mockStore,"138 0000 1001")[0].id,"c-1");
  assert.equal(searchCustomers(mockStore,"不存在").length,0);
});
const input={customerId:"c-6",serviceDate:"2026-09-13T14:00:00+08:00",staffId:"staff-1",serviceType:"腰背养护",packageId:"p-3",complaint:"今日腰部疲劳",physicalState:"状态平稳",attention:"先确认力度"};
test("建立服务不扣次，保存后阻止重复进行中服务",()=>{
  const next=createSession(mockStore,input,"test-session");
  assert.equal(next.sessions.length,mockStore.sessions.length+1);
  assert.deepEqual(next.usages,mockStore.usages);
  assert.throws(()=>createSession(next,input,"repeat"),/已有进行中/);
});
test("禁止跨客户、错项目、过期、无余额权益",()=>{
  assert.throws(()=>createSession(mockStore,{...input,packageId:"p-1"},"x"),/不可用/);
  assert.throws(()=>createSession(mockStore,{...input,serviceType:"肩颈舒缓"},"x"),/不在/);
  assert.throws(()=>createSession(mockStore,{...input,serviceDate:"2027-09-13T14:00:00+08:00"},"x"),/不可用/);
  const exhausted={...mockStore,packages:mockStore.packages.map(p=>p.id==="p-3"?{...p,total:1}:p)};
  assert.throws(()=>createSession(exhausted,input,"x"),/不可用/);
});
test("无套餐也能服务；缺失主诉或无效员工必须拒绝",()=>{
  assert.equal(createSession(mockStore,{...input,packageId:null},"x").sessions.at(-1)?.packageId,null);
  assert.throws(()=>createSession(mockStore,{...input,complaint:" "},"x"),/补全/);
  assert.throws(()=>createSession(mockStore,{...input,staffId:"missing"},"x"),/服务人员/);
});
