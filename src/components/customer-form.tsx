"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRelay } from "./relay-provider";
import { Empty, PageHeading, ViewLink } from "./common";
import { Button } from "./ui/button";
import { SourceTerms } from "./source-terms";
import { AGE_RANGES, CONTRAINDICATIONS, NOTICES, PAPER_CONFIRMATION, SPENDING, SYMPTOMS, WELLNESS, emptyQuestionnaire } from "@/lib/domain/questionnaire";
import { businessToday } from "@/lib/domain/selectors";
import { saveCustomer } from "@/lib/data/customer-commands";
import type { Answer, HealthQuestionnaire } from "@/lib/domain/types";

function Choices({label,options,value,onChange}:{label:string;options:string[];value:string[];onChange:(v:string[])=>void}) {
  return <fieldset className="form-field full"><legend>{label}</legend><div className="choice-grid">{options.map(o=><label className="choice" key={o}><input type="checkbox" checked={value.includes(o)} onChange={e=>onChange(e.target.checked?[...value,o]:value.filter(v=>v!==o))}/><span>{o}</span></label>)}</div></fieldset>;
}
export function AnswerSelect({label,value,onChange,yes="是",no="否",empty="未填写"}:{label:string;value:Answer;onChange:(v:Answer)=>void;yes?:string;no?:string;empty?:string}) {
  return <label className="form-field">{label}<select value={value} aria-label={label} onChange={e=>onChange(e.target.value as Answer)}><option value="">{empty}</option><option value="yes">{yes}</option><option value="no">{no}</option></select></label>;
}
export function CustomerForm({customerId}:{customerId?:string}) {
  const {store,ready}=useRelay();
  if(!ready)return <Empty title="正在读取本机档案…"/>;
  if(customerId&&!store.customers.some(c=>c.id===customerId))return <Empty title="未找到客户" action={<ViewLink href="/customers">返回列表</ViewLink>}/>;
  return <CustomerFormBody key={customerId??"new"} customerId={customerId}/>;
}
function CustomerFormBody({customerId}:{customerId?:string}) {
  const {store,update}=useRelay();const router=useRouter();const existing=store.customers.find(c=>c.id===customerId);const health=store.healthProfiles.find(h=>h.customerId===customerId);
  const [q,setQ]=useState<HealthQuestionnaire>(()=>health?.questionnaire??{...emptyQuestionnaire(),filledAt:existing?"":businessToday(),otherSymptoms:health?.symptoms??"",personalNeeds:health?.goal??"",sourceChannels:existing?.source?[existing.source]:[],contraindicationNotes:health?.contraindications??""});
  const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  function set<K extends keyof HealthQuestionnaire>(key:K,value:HealthQuestionnaire[K]){setQ(current=>({...current,[key]:value}));}
  function numeric(key:"systolic"|"diastolic"|"heartRate",value:string){set(key,value===""?null:Number(value));}
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;setError("");const data=new FormData(e.currentTarget);const read=(key:string)=>String(data.get(key)??"").trim();const id=customerId??crypto.randomUUID();try{setBusy(true);update(current=>saveCustomer(current,{name:read("name"),phone:read("phone"),gender:read("gender"),age:read("age"),firstVisit:read("firstVisit"),receptionistName:read("receptionist"),questionnaire:q,chronicConditions:read("chronic"),remarks:read("remarks")},id,crypto.randomUUID()));router.push(`/customers/${id}?tab=health`);}catch(e){setError((e as Error).message);setBusy(false);}}
  return <><PageHeading title={existing?`编辑${existing.name}的客户资料`:"新建客户档案"} description="按纸质问卷逐项照录；没有填写的项目可以留空。"/><form onSubmit={submit} className="questionnaire-form"><div className="section-stack">
    <section className="panel"><h2 className="form-title">基本信息 <small>* 为建档必填项</small></h2><div className="form-grid">
      <label className="form-field">姓名 *<input name="name" defaultValue={existing?.name??""} required maxLength={50}/></label>
      <label className="form-field">性别<select name="gender" defaultValue={existing?.gender??"未说明"}><option>未说明</option><option>女</option><option>男</option></select></label>
      <label className="form-field">电话 / 手机号 *<input name="phone" type="tel" defaultValue={existing?.phone??""} required maxLength={20}/></label>
      <label className="form-field">首次到店日期 *<input name="firstVisit" type="date" required defaultValue={existing?.firstVisit??businessToday()}/></label>
      <label className="form-field">接待人员 *<input name="receptionist" list="receptionists" required maxLength={50} placeholder="输入接待人员姓名" defaultValue={store.staff.find(s=>s.id===existing?.receptionistId)?.name??""}/><datalist id="receptionists">{store.staff.filter(s=>s.active).map(s=><option value={s.name} key={s.id}/>)}</datalist></label>
      <label className="form-field">体验项目<input value={q.experienceItem} onChange={e=>set("experienceItem",e.target.value)} maxLength={100} placeholder="按纸质问卷填写，可自定义"/></label>
      <label className="form-field">填表日期<input type="date" value={q.filledAt} onChange={e=>set("filledAt",e.target.value)}/></label>
      <label className="form-field">1. 您的年龄区间<select value={q.ageRange} onChange={e=>set("ageRange",e.target.value)}><option value="">未填写</option>{AGE_RANGES.map(v=><option key={v}>{v}</option>)}</select></label>
      <label className="form-field full">年龄补充（选填）<input name="age" defaultValue={existing?.age==="未记录"||existing?.age===health?.questionnaire?.ageRange?"":existing?.age??""} maxLength={30} placeholder="实际年龄不在纸质问卷区间内时，可在此照录"/></label>
    </div></section>
    <section className="panel"><h2 className="form-title">2. 症状与当日测量</h2><div className="form-grid">
      <Choices label="您是否有以下症状（可多选）" options={SYMPTOMS} value={q.symptoms} onChange={v=>set("symptoms",v)}/>
      <div className="form-field full measurement-grid">
        <label className="form-field">收缩压（mmHg）<input aria-label="收缩压（mmHg）" type="number" min={1} max={999} step={1} value={q.systolic??""} onChange={e=>numeric("systolic",e.target.value)} placeholder="未测量留空"/></label>
        <label className="form-field">舒张压（mmHg）<input type="number" min={1} max={999} step={1} value={q.diastolic??""} onChange={e=>numeric("diastolic",e.target.value)} placeholder="未测量留空"/></label>
        <label className="form-field">心率（次/分）<input type="number" min={1} max={999} step={1} value={q.heartRate??""} onChange={e=>numeric("heartRate",e.target.value)} placeholder="未测量留空"/></label>
      </div>
      <label className="form-field full">其他症状<input value={q.otherSymptoms} onChange={e=>set("otherSymptoms",e.target.value)} maxLength={2000}/></label>
      <label className="form-field full">慢病情况补充（选填）<textarea name="chronic" defaultValue={health?.chronicConditions??""} maxLength={2000} placeholder="照录客户已说明的情况"/></label>
    </div></section>
    <section className="panel"><h2 className="form-title">3–5. 养生偏好与资讯意愿</h2><div className="form-grid">
      <Choices label="3. 平时更喜欢哪种养生方式（可多选）" options={WELLNESS} value={q.wellnessPreferences} onChange={v=>set("wellnessPreferences",v)}/>
      <label className="form-field full">4. 日常健康养护消费观念<select value={q.spendingView} onChange={e=>set("spendingView",e.target.value)}><option value="">未填写</option>{SPENDING.map(v=><option key={v}>{v}</option>)}</select></label>
      <AnswerSelect label="5. 是否愿意接收门店养生资讯、沙龙活动通知" value={q.receiveUpdates} onChange={v=>set("receiveUpdates",v)} yes="愿意" no="暂不需要"/>
    </div></section>
    <section className="panel"><h2 className="form-title">6. 个人专属养护诉求 <small>选填</small></h2><div className="form-grid">
      <AnswerSelect label="是否每年体检" value={q.annualCheckup} onChange={v=>set("annualCheckup",v)}/>
      <label className="form-field">哪些指标异常<input value={q.abnormalIndicators} onChange={e=>set("abnormalIndicators",e.target.value)} maxLength={2000}/></label>
      <AnswerSelect label="是否有急于解决的症状" value={q.urgentSymptoms} onChange={v=>set("urgentSymptoms",v)}/>
      <label className="form-field">急于解决的症状说明<input value={q.urgentSymptomsDetail} onChange={e=>set("urgentSymptomsDetail",e.target.value)} maxLength={2000}/></label>
      <AnswerSelect label="是否每周有5次快走或慢跑达到150分钟" value={q.weeklyExercise} onChange={v=>set("weeklyExercise",v)}/>
      <label className="form-field full">个人养护诉求补充<textarea value={q.personalNeeds} onChange={e=>set("personalNeeds",e.target.value)} maxLength={2000}/></label>
    </div></section>
    <section className="panel"><h2 className="form-title">7. 通过哪些渠道知晓德汇康健康管理中心？</h2><div className="form-grid">
      <SourceTerms selected={q.sourceChannels} onChange={v=>set("sourceChannels",v)}/>
      <label className="form-field full">其他渠道<input value={q.sourceOther} onChange={e=>set("sourceOther",e.target.value)} maxLength={200} placeholder="按纸质问卷“其他”栏照录"/></label>
    </div></section>
    <section className="panel"><h2 className="form-title">玉玄宫理疗设备禁忌症 <small>按纸质问卷原文</small></h2><p className="form-intro">逐项记录核实情况。纸质问卷没有填写或尚未询问时，请保持“未核实”。</p><div className="contraindication-list">{CONTRAINDICATIONS.map((c,i)=><AnswerSelect key={c.id} label={`${i+1}. ${c.text}`} value={q.contraindicationChecks[c.id]??""} onChange={v=>set("contraindicationChecks",{...q.contraindicationChecks,[c.id]:v})} empty="未核实" yes="有此情况" no="已核实无此情况"/>)}</div><div className="form-grid"><label className="form-field full">禁忌 / 特别关注补充<textarea value={q.contraindicationNotes} onChange={e=>set("contraindicationNotes",e.target.value)} maxLength={2000}/></label></div></section>
    <section className="panel"><h2 className="form-title">注意事项与纸质确认</h2><div className="paper-copy"><h3>注意事项（纸质原文）</h3><ol>{NOTICES.map(n=><li key={n}>{n}</li>)}</ol><h3>客户确认（纸质原文）</h3><p>{PAPER_CONFIRMATION}</p></div><div className="form-grid">
      <AnswerSelect label="客户是否已阅读并确认纸质告知内容" value={q.noticeRead} onChange={v=>set("noticeRead",v)} empty="未记录" yes="已确认" no="尚未确认"/>
      <AnswerSelect label="纸质问卷是否已有客户签名" value={q.paperSigned} onChange={v=>set("paperSigned",v)} empty="未核实" yes="已签署" no="未签署"/>
      <label className="form-field">客户签名姓名（照录）<input value={q.signerName} onChange={e=>set("signerName",e.target.value)} maxLength={50}/><small>照录纸质签名姓名，不生成电子签名。</small></label>
      <label className="form-field">签署日期<input type="date" value={q.signedAt} onChange={e=>set("signedAt",e.target.value)}/></label>
      <label className="form-field full">纸质问卷留存 / 签名备注<input value={q.signatureNotes} onChange={e=>set("signatureNotes",e.target.value)} maxLength={1000} placeholder="例如：纸质问卷存放位置、待补签情况"/></label>
      <label className="form-field full">其他档案备注<textarea name="remarks" defaultValue={health?.remarks??""} maxLength={2000}/></label>
    </div></section>
  </div>{error&&<div role="alert" className="error-banner">{error}</div>}<div className="form-actions sticky-actions"><span className="muted">问卷空白项按未填写保存</span><Button asChild variant="outline"><Link href={existing?`/customers/${existing.id}`:"/customers"}>取消</Link></Button><Button disabled={busy} type="submit">{busy?"正在保存…":existing?"保存客户资料":"保存客户与问卷"}</Button></div></form></>;
}
