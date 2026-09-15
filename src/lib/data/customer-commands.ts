import type { Customer, HealthProfile, HealthQuestionnaire, Store } from "../domain/types";
import { AGE_RANGES, CONTRAINDICATIONS, SPENDING, SYMPTOMS, WELLNESS } from "../domain/questionnaire";
export interface CustomerInput {
  name: string; phone: string; gender: string; age: string; firstVisit: string;
  receptionistName: string; questionnaire: HealthQuestionnaire; chronicConditions: string; remarks: string;
}
export function addSourceTerm(store: Store, text: string): Store {
  const term=text.trim();
  if(!term||term.length>40)throw new Error("来源词条请填写1–40个字符。");
  if(store.sourceTerms.some(s=>s.toLocaleLowerCase()===term.toLocaleLowerCase()))throw new Error("这个来源词条已存在。");
  return {...store,sourceTerms:[...store.sourceTerms,term]};
}
export function removeSourceTerm(store: Store, term: string): Store {return {...store,sourceTerms:store.sourceTerms.filter(t=>t!==term)};}
export function isDate(value: string) {return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export function saveCustomer(store: Store, input: CustomerInput, id:string, staffId:string): Store {
  const name=input.name.trim(),phone=input.phone.replace(/[\s-]/g,""),receptionistName=input.receptionistName.trim();
  if(!name||name.length>50)throw new Error("请填写客户姓名（最多50字）。");
  if(!/^1[3-9]\d{9}$/.test(phone))throw new Error("请填写11位大陆手机号。");
  if(store.customers.some(c=>c.phone===phone&&c.id!==id))throw new Error("该手机号已有客户档案，请搜索后打开，避免重复建档。");
  if(!receptionistName||receptionistName.length>50)throw new Error("请填写接待人员姓名（最多50字）。");
  if(!isDate(input.firstVisit))throw new Error("请填写有效的首次到店日期。");
  const q=structuredClone(input.questionnaire);
  for(const date of [q.filledAt,q.signedAt])if(date&&!isDate(date))throw new Error("请检查问卷或签署日期。");
  for(const value of [q.systolic,q.diastolic,q.heartRate])if(value!==null&&(!Number.isInteger(value)||value<=0||value>999))throw new Error("血压和心率请填写1–999的整数，未测量请留空。");
  if(q.ageRange&&!AGE_RANGES.includes(q.ageRange))throw new Error("请选择纸质问卷中的年龄区间。");
  if(q.spendingView&&!SPENDING.includes(q.spendingView))throw new Error("请选择有效的消费观念。");
  if(q.symptoms.some(x=>!SYMPTOMS.includes(x))||q.wellnessPreferences.some(x=>!WELLNESS.includes(x)))throw new Error("问卷选项无效。");
  for(const value of [q.receiveUpdates,q.annualCheckup,q.urgentSymptoms,q.weeklyExercise,q.noticeRead,q.paperSigned,...Object.values(q.contraindicationChecks)])if(!["","yes","no"].includes(value))throw new Error("问卷答案无效。");
  if(q.paperSigned==="no"&&(q.signerName.trim()||q.signedAt))throw new Error("标记未签署时，请清空签名姓名和签署日期。");
  q.sourceChannels=[...new Set(q.sourceChannels.map(s=>s.trim()).filter(Boolean))];
  const old=store.customers.find(c=>c.id===id);
  const oldHealth=store.healthProfiles.find(h=>h.customerId===id);
  const allowedSources=new Set([...store.sourceTerms,...(oldHealth?.questionnaire?.sourceChannels??[]),...(old?.source?[old.source]:[])]);
  if(q.sourceChannels.some(s=>!allowedSources.has(s)))throw new Error("来源词条已更新，请检查已选来源。");
  const existingStaff=store.staff.find(s=>s.name===receptionistName&&s.active);
  const receptionistId=existingStaff?.id??staffId;
  const staff=existingStaff?store.staff:[...store.staff,{id:staffId,name:receptionistName,role:"reception" as const,active:true}];
  const customer:Customer={...old,id,name,phone,gender:input.gender,age:input.age.trim()||q.ageRange||"未记录",firstVisit:input.firstVisit,source:[...q.sourceChannels,q.sourceOther.trim()].filter(Boolean).join("、"),receptionistId,stage:old?.stage??"初次到店",tags:old?.tags??[],updatedAt:new Date().toISOString()};
  const found=CONTRAINDICATIONS.filter(c=>q.contraindicationChecks[c.id]==="yes").map(c=>c.text);
  const unchecked=CONTRAINDICATIONS.filter(c=>!q.contraindicationChecks[c.id]).length;
  const health:HealthProfile={...oldHealth,customerId:id,questionnaire:q,
    symptoms:[...q.symptoms,q.otherSymptoms.trim()].filter(Boolean).join("、")||"未填写",
    chronicConditions:input.chronicConditions.trim()||"未补充",
    bloodPressure:q.systolic!==null||q.diastolic!==null?`${q.systolic??"未测"}/${q.diastolic??"未测"} mmHg${q.filledAt?`（${q.filledAt} 纸质问卷照录）`:""}`:"未记录",
    heartRate:q.heartRate,goal:[q.personalNeeds.trim(),q.urgentSymptomsDetail.trim()].filter(Boolean).join("；")||"待了解",
    preferences:q.wellnessPreferences.join("；")||"未填写",spendingView:q.spendingView||"未填写",
    contraindications:[...found,q.contraindicationNotes.trim(),unchecked?`${unchecked}项禁忌情况尚未核实`:found.length?"":"纸质问卷各项已核实无此情况"].filter(Boolean).join("；"),remarks:input.remarks.trim()};
  return {...store,staff,customers:old?store.customers.map(c=>c.id===id?customer:c):[...store.customers,customer],healthProfiles:oldHealth?store.healthProfiles.map(h=>h.customerId===id?health:h):[...store.healthProfiles,health]};
}
