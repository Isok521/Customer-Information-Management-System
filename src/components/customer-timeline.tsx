"use client";
import { useRelay } from "./relay-provider";
import { Badge, ViewLink } from "./common";
import { personName } from "@/lib/domain/selectors";
export function CustomerTimeline({customerId}:{customerId:string}) {
  const {store}=useRelay(); const c=store.customers.find(c=>c.id===customerId);if(!c)return null;
  const events=[
    ...store.sessions.filter(s=>s.customerId===customerId&&s.status!=="scheduled"&&s.status!=="cancelled").map(s=>({id:s.id,date:s.serviceDate,type:"service" as const,session:s})),
    ...store.packages.filter(p=>p.customerId===customerId).map(p=>({id:p.id,date:p.purchasedAt+"T12:00:00+08:00",type:"package" as const,package:p})),
    {id:"arrival",date:c.firstVisit+"T09:00:00+08:00",type:"arrival" as const}
  ].sort((a,b)=>b.date.localeCompare(a.date));
  return <div className="timeline">{events.map(e=><article className="timeline-item" key={e.id}><span className="timeline-dot"/><div className="timeline-date">{e.date.slice(5,10)}{e.type==="service"&&<span>{e.date.slice(11,16)} · {personName(store,e.session.staffId)}</span>}</div>{e.type==="service"? <><div className="timeline-title"><h3>{e.session.serviceType}</h3><Badge tone={e.session.status==="in_progress"?"green":"neutral"}>{e.session.status==="in_progress"?"服务中":"已完成"}</Badge></div><div className="timeline-content">{e.session.status==="completed"?<p><b>客户反馈：</b>{e.session.feedback||"未记录"}</p>:<p><b>本次主诉：</b>{e.session.complaint}</p>}{store.notes.filter(n=>n.sessionId===e.session.id).slice(-1).map(n=><p key={n.id}><b>即时记录：</b>{n.at.slice(11,16)} · {n.feedback}</p>)}{store.followUps.filter(f=>f.sessionId===e.session.id).map(f=><div key={f.id}><p><b>套餐沟通：</b>{f.recommendedPackage} · {f.reaction}</p><p><b>顾虑：</b>{f.concerns.join("、")||"未记录"}</p><p><b>下一步：</b>{f.strategy}</p></div>)}<ViewLink href={`/services/${e.session.id}`}>查看完整记录</ViewLink></div></>:e.type==="package"?<><div className="timeline-title"><h3>购买{e.package.name}</h3></div><div className="timeline-content">¥{e.package.amount} · 共{e.package.total}次 · 有效期至 {e.package.validUntil}</div></>:<><div className="timeline-title"><h3>首次到店 · 建立档案</h3></div><p className="muted">{personName(store,c.receptionistId)}接待 · {c.source}</p></>}</article>)}</div>;
}
