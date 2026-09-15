"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRelay } from "./relay-provider";
import { Button } from "./ui/button";
import { Empty, PageHeading, ViewLink } from "./common";
import { businessToday, packageBalance } from "@/lib/domain/selectors";
import { savePackage } from "@/lib/data/package-commands";
import type { Package } from "@/lib/domain/types";
export function PackageForm({packageId,customerId}:{packageId?:string;customerId?:string}) {
  const {store,ready}=useRelay();if(!ready)return <Empty title="正在读取权益…"/>;
  if(packageId&&!store.packages.some(p=>p.id===packageId))return <Empty title="未找到权益" action={<ViewLink href="/packages">返回套餐权益</ViewLink>}/>;
  if(!store.customers.length)return <Empty title="先建立一位客户的档案" detail="套餐权益归属于具体客户，请先录入客户，再添加已购权益。" action={<Button asChild><Link href="/customers/new">新建客户</Link></Button>}/>;
  return <PackageFormBody key={packageId??customerId??"new"} packageId={packageId} customerId={customerId}/>;
}
function PackageFormBody({packageId,customerId}:{packageId?:string;customerId?:string}) {
  const {store,update}=useRelay();const router=useRouter();const existing=store.packages.find(p=>p.id===packageId);const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  const [total,setTotal]=useState(existing?.total??1);const [opening,setOpening]=useState(existing?.openingUsed??0);
  const systemUsed=existing?packageBalance(store,existing).used-(existing.openingUsed??0):0;
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;const data=new FormData(e.currentTarget);const read=(k:string)=>String(data.get(k)??"");try{setBusy(true);update(s=>savePackage(s,{id:packageId??crypto.randomUUID(),customerId:existing?.customerId??read("customer"),name:read("name"),purchasedAt:read("purchased"),amount:Number(read("amount")),items:read("items").split(/[\n,，、]/),total,openingUsed:opening,validUntil:read("validUntil"),status:read("status") as Package["status"]}));router.push(existing?`/customers/${existing.customerId}?tab=packages`:"/packages");}catch(e){setError((e as Error).message);setBusy(false);}}
  return <><PageHeading title={existing?"编辑套餐 / 权益":"新增套餐 / 权益"} description="按客户实际购买情况录入，名称、项目、金额和次数均可自定义。"/><form onSubmit={submit} className="questionnaire-form"><section className="panel"><h2 className="form-title">客户已购权益</h2><div className="form-grid">
    <label className="form-field">所属客户 *<select name="customer" required disabled={!!existing} defaultValue={existing?.customerId??customerId??""}><option value="">请选择客户</option>{store.customers.map(c=><option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select></label>
    <label className="form-field">套餐 / 体验卡名称 *<input name="name" required maxLength={100} defaultValue={existing?.name??""} placeholder="填写门店实际套餐名称"/></label>
    <label className="form-field">购买日期 *<input name="purchased" type="date" required defaultValue={existing?.purchasedAt??businessToday()}/></label>
    <label className="form-field">实付金额（元） *<input name="amount" type="number" required min={0} max={9999999999.99} step="0.01" defaultValue={existing?.amount??""}/></label>
    <label className="form-field full">包含项目 *<textarea name="items" required defaultValue={existing?.items.join("\n")??""} placeholder="每行填写一个实际项目，也可用逗号分隔" maxLength={2000}/><small>这些项目会自动成为新建服务时的可选项目。</small></label>
    <label className="form-field">总次数 *<input type="number" min={1} step={1} required value={total||""} onChange={e=>setTotal(Number(e.target.value))}/></label>
    <label className="form-field">录入前已使用次数 *<input type="number" min={0} step={1} required disabled={systemUsed>0} value={opening} onChange={e=>setOpening(Number(e.target.value))}/><small>仅用于迁入已有卡；新购卡填0。系统内产生使用流水后不可改动。</small></label>
    <label className="form-field">有效期至 *<input name="validUntil" type="date" required defaultValue={existing?.validUntil??""}/></label>
    <label className="form-field">状态<select name="status" defaultValue={existing?.status??"active"}><option value="active">正常使用</option><option value="frozen">冻结</option><option value="cancelled">取消</option></select></label>
  </div><p className="inline-alert">录入后剩余：{total-opening-systemUsed} 次（总次数 {total} − 录入前已用 {opening} − 系统已用 {systemUsed}）</p></section>{error&&<div role="alert" className="error-banner">{error}</div>}<div className="form-actions"><Button asChild variant="outline"><Link href="/packages">取消</Link></Button><Button type="submit" disabled={busy}>{busy?"正在保存…":"保存权益"}</Button></div></form></>;
}
