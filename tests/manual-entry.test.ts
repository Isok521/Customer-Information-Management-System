import { test } from "node:test";
import assert from "node:assert/strict";
import { mockStore } from "../src/lib/data/mock";
import { createEmptyStore, migrateLegacyStore } from "../src/lib/data/empty-store";
import { repositoryFor, STORAGE_KEY } from "../src/lib/data/local-repository";
import { addSourceTerm, removeSourceTerm, saveCustomer, type CustomerInput } from "../src/lib/data/customer-commands";
import { savePackage } from "../src/lib/data/package-commands";
import { emptyQuestionnaire } from "../src/lib/domain/questionnaire";
import { packageBalance } from "../src/lib/domain/selectors";
const input:CustomerInput={name:"录入测试",phone:"13800008888",gender:"未说明",age:"",firstVisit:"2026-09-14",receptionistName:"接待测试",chronicConditions:"自述补充",remarks:"备注",questionnaire:{...emptyQuestionnaire(),filledAt:"2026-09-14",experienceItem:"门店自定义项目",ageRange:"50岁以上",symptoms:["颈椎痛","失眠"],otherSymptoms:"其他照录",systolic:125,diastolic:81,heartRate:75,wellnessPreferences:["功法养形：形体功法、舒展塑形"],spendingView:"偶尔体验，按需选择",receiveUpdates:"no",annualCheckup:"yes",abnormalIndicators:"照录指标",urgentSymptoms:"yes",urgentSymptomsDetail:"纸质主诉",weeklyExercise:"no",personalNeeds:"补充诉求",sourceChannels:["朋友介绍"],sourceOther:"纸质其他",contraindicationChecks:{implants:"no",acute:"yes"},contraindicationNotes:"需再次确认",noticeRead:"yes",paperSigned:"yes",signerName:"录入测试",signedAt:"2026-09-14",signatureNotes:"纸质档案柜"}};
test("初始数据为空；清理演示关系但保留手动录入客户及权益",()=>{
  assert.equal(createEmptyStore().customers.length,0);assert.equal(createEmptyStore().packages.length,0);
  const withUser=saveCustomer(mockStore,input,"user-customer","user-staff");
  const withPackage=savePackage(withUser,{id:"user-package",customerId:"user-customer",name:"实际套餐",purchasedAt:"2026-09-14",amount:600,items:["自定项目"],total:8,openingUsed:2,validUntil:"2027-09-14",status:"active"});
  const result=migrateLegacyStore(withPackage);
  assert.deepEqual(result.customers.map(c=>c.id),["user-customer"]);assert.equal(result.packages[0].id,"user-package");
  assert.equal(result.sessions.length,0);assert.equal(result.notes.length,0);assert.equal(result.usages.length,0);assert.equal(result.followUps.length,0);
});
test("来源增加、重复校验、移除与历史答案保留",()=>{
  let store=addSourceTerm(createEmptyStore()," 社区活动 ");assert.ok(store.sourceTerms.includes("社区活动"));
  assert.throws(()=>addSourceTerm(store,"社区活动"),/已存在/);
  store=saveCustomer(store,{...input,questionnaire:{...input.questionnaire,sourceChannels:["社区活动"]}},"c","staff");
  store=removeSourceTerm(store,"社区活动");assert.ok(!store.sourceTerms.includes("社区活动"));assert.ok(store.customers[0].source.includes("社区活动"));
  assert.doesNotThrow(()=>saveCustomer(store,{...input,questionnaire:store.healthProfiles[0].questionnaire!},"c","staff2"));
});
test("问卷每个字段往返保存；编辑更新原档案；未知不能变成否",()=>{
  const store=saveCustomer(createEmptyStore(),input,"c","staff");assert.deepEqual(store.healthProfiles[0].questionnaire,input.questionnaire);
  assert.equal(store.healthProfiles[0].questionnaire!.contraindicationChecks.bleeding,undefined);
  const edited=saveCustomer(store,{...input,name:"更新姓名",questionnaire:{...input.questionnaire,receiveUpdates:""}},"c","staff2");
  assert.equal(edited.customers.length,1);assert.equal(edited.healthProfiles.length,1);assert.equal(edited.healthProfiles[0].questionnaire?.receiveUpdates,"");
  assert.throws(()=>saveCustomer(store,{...input,questionnaire:{...input.questionnaire,systolic:NaN}},"c","staff"),/整数/);
  assert.throws(()=>saveCustomer(store,input,"duplicate","staff"),/已有客户/);
});
test("自定义套餐余额与编辑校验，不伪造历史服务",()=>{
  const store=saveCustomer(createEmptyStore(),input,"c","staff");
  const pkg={id:"p",customerId:"c",name:"实际卡",purchasedAt:"2026-09-14",amount:299.9,items:["项目一","项目二","项目一"],total:10,openingUsed:3,validUntil:"2027-09-14",status:"active" as const};
  const result=savePackage(store,pkg);assert.deepEqual(packageBalance(result,result.packages[0]),{used:3,remaining:7});assert.equal(result.sessions.length,0);assert.equal(result.usages.length,0);
  assert.equal(result.packages[0].items.length,2);
  assert.equal(savePackage(result,{...pkg,name:"修正名称"}).packages.length,1);
  assert.throws(()=>savePackage(store,{...pkg,total:2}),/不能少于/);
  assert.throws(()=>savePackage(store,{...pkg,validUntil:"2026-01-01"}),/日期/);
  assert.throws(()=>savePackage(store,{...pkg,amount:0.001}),/小数/);
});
test("本地迁移可重复读取；保存失败不删除旧数据；问卷持久化",()=>{
  const values=new Map<string,string>();const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};
  values.set("dehuikang-relay-demo-v1",JSON.stringify({version:1,data:saveCustomer(mockStore,input,"user","staff-user")}));
  const repo=repositoryFor(storage);const initial=repo.load();assert.equal(initial.customers.length,1);assert.ok(!values.has("dehuikang-relay-demo-v1"));assert.ok(values.has(STORAGE_KEY));
  repo.save(initial);assert.deepEqual(repo.load().healthProfiles[0].questionnaire,input.questionnaire);
  values.delete(STORAGE_KEY);values.set("dehuikang-relay-demo-v1",JSON.stringify({version:1,data:mockStore}));
  assert.throws(()=>repositoryFor({...storage,setItem:()=>{throw new Error("quota");}}).load(),/quota/);assert.ok(values.has("dehuikang-relay-demo-v1"));
});
