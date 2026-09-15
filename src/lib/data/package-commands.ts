import type { Package, Store } from "../domain/types";
import { isDate } from "./customer-commands";
export function savePackage(store:Store,input:Package):Store {
  const existing=store.packages.find(p=>p.id===input.id);
  const items=[...new Set(input.items.map(i=>i.trim()).filter(Boolean))];
  if(!store.customers.some(c=>c.id===input.customerId))throw new Error("请选择有效客户。");
  if(existing&&existing.customerId!==input.customerId)throw new Error("已保存的权益不能更换所属客户。");
  if(!input.name.trim()||!items.length)throw new Error("请填写套餐名称和至少一个包含项目。");
  if(!Number.isFinite(input.amount)||input.amount<0||input.amount>9999999999.99||Math.abs(input.amount*100-Math.round(input.amount*100))>0.0001)throw new Error("金额必须为非负数，最多两位小数。");
  const opening=input.openingUsed??0;
  if(!Number.isSafeInteger(input.total)||input.total<=0||!Number.isSafeInteger(opening)||opening<0)throw new Error("总次数应为正整数，录入前已用次数应为非负整数。");
  if(!isDate(input.purchasedAt)||!isDate(input.validUntil)||input.validUntil<input.purchasedAt)throw new Error("有效期不能早于购买日期，请检查日期。");
  const uses=store.usages.filter(u=>u.packageId===input.id);
  if(opening+uses.reduce((sum,u)=>sum+u.quantity,0)>input.total)throw new Error("总次数不能少于已经使用的次数。");
  if(uses.length&&opening!==(existing?.openingUsed??0))throw new Error("已有系统使用流水，不能改动录入前已用次数。");
  const linked=store.sessions.filter(s=>s.packageId===input.id&&s.status!=="cancelled");
  if(linked.some(s=>!items.includes(s.serviceType)||s.serviceDate.slice(0,10)<input.purchasedAt||s.serviceDate.slice(0,10)>input.validUntil))throw new Error("修改后的项目或有效期不包含关联服务，请保留历史服务对应的权益范围。");
  const pkg={...input,name:input.name.trim(),items,openingUsed:opening};
  return {...store,packages:existing?store.packages.map(p=>p.id===input.id?pkg:p):[...store.packages,pkg],customers:store.customers.map(c=>c.id===input.customerId?{...c,updatedAt:new Date().toISOString()}:c)};
}
