"use client";
import { useState } from "react";
import { useRelay } from "./relay-provider";
import { Button } from "./ui/button";
import { addSourceTerm, removeSourceTerm } from "@/lib/data/customer-commands";
export function SourceTerms({selected,onChange}:{selected:string[];onChange:(value:string[])=>void}) {
  const {store,update,ready}=useRelay();const [term,setTerm]=useState("");const [error,setError]=useState("");const [message,setMessage]=useState("");
  function add(){try{update(s=>addSourceTerm(s,term));setTerm("");setError("");setMessage("来源词条已添加。");}catch(e){setError((e as Error).message);}}
  function remove(value:string){try{update(s=>removeSourceTerm(s,value));setError("");setMessage(`已移除“${value}”，历史客户的来源不受影响。`);}catch(e){setError((e as Error).message);}}
  const options=[...new Set([...store.sourceTerms,...selected])];
  return <div className="form-field full"><span>客户来源（问卷第7题，可多选）</span><div className="choice-grid">{options.map(t=><label className="choice" key={t}><input type="checkbox" checked={selected.includes(t)} onChange={e=>onChange(e.target.checked?[...selected,t]:selected.filter(s=>s!==t))}/><span>{t}{!store.sourceTerms.includes(t)&&<small>（已移除词条，保留原记录）</small>}</span></label>)}</div>{!options.length&&<p className="muted">暂无来源词条，请先添加或填写下方“其他渠道”。</p>}<details className="dictionary"><summary>管理来源词条</summary><p>词条全店表单共用。移除后不影响已保存客户的来源记录。</p><div className="inline-input"><input aria-label="新增来源词条" value={term} maxLength={40} placeholder="输入新的来源词条" onChange={e=>setTerm(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();add();}}}/><Button type="button" variant="outline" onClick={add} disabled={!ready}>添加词条</Button></div><div className="term-list">{store.sourceTerms.map(t=><span key={t}>{t}<button type="button" aria-label={`移除来源词条：${t}`} onClick={()=>remove(t)} disabled={!ready}>×</button></span>)}</div>{message&&<p role="status">{message}</p>}{error&&<p className="error-banner" role="alert">{error}</p>}</details></div>;
}
