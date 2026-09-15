"use client";
import type { Package } from "@/lib/domain/types";
import { useRelay } from "./relay-provider";
import { Badge, ViewLink } from "./common";
import { customerName, packageBalance, packageState, personName } from "@/lib/domain/selectors";
export function PackageCard({pkg,showCustomer=false}:{pkg:Package;showCustomer?:boolean}) {
  const {store}=useRelay();const {used,remaining}=packageBalance(store,pkg);const status=packageState(store,pkg);
  return <article className="package-card"><div className="row-between"><h3>{pkg.name}</h3><Badge tone={status==="使用中"?"green":"neutral"}>{status}</Badge></div>{showCustomer&&<p><ViewLink href={`/customers/${pkg.customerId}?tab=packages`}>{customerName(store,pkg.customerId)}的权益</ViewLink></p>}<p>¥{pkg.amount.toLocaleString()} · {pkg.items.join(" / ")}</p><div className="package-number"><strong>{remaining}</strong><span> / {pkg.total} 次剩余</span></div><div className="progress-track" role="meter" aria-label="剩余权益次数" aria-valuemin={0} aria-valuemax={pkg.total} aria-valuenow={remaining}><div style={{width:`${remaining/pkg.total*100}%`}}/></div><div className="row-between muted"><span>已使用 {used} 次</span><span>{pkg.validUntil} 到期</span></div><div className="usage-list">{!!pkg.openingUsed&&<div><span>录入前已使用（迁入余额）</span><span>{pkg.openingUsed} 次</span></div>}<div><span>使用记录</span><span>完成服务后扣次</span></div>{store.usages.filter(u=>u.packageId===pkg.id).sort((a,b)=>b.usedAt.localeCompare(a.usedAt)).map(u=><div key={u.id}><span>{u.usedAt.slice(5,10)} · {personName(store,u.staffId)}</span><ViewLink href={`/services/${u.sessionId}`}>{u.quantity} 次</ViewLink></div>)}{used===0&&<p>尚未使用</p>}</div><div style={{marginTop:14}}><ViewLink href={`/packages/${pkg.id}/edit`}>编辑权益</ViewLink></div></article>;
}
