import type { NewSessionInput, Store } from "@/lib/domain/types";
import { packageBalance, packageState } from "../domain/selectors";
export interface RelayRepository {
  load(): Store;
  save(store: Store): void;
}
export function createSessionForStaff(store:Store,input:Omit<NewSessionInput,"staffId">,staffName:string,id:string,newStaffId:string): Store {
  const name=staffName.trim(); if(!name||name.length>50)throw new Error("请填写服务人员姓名（最多50字）。");
  const found=store.staff.find(s=>s.name===name&&s.active);
  const staffId=found?.id??newStaffId;
  return createSession(found?store:{...store,staff:[...store.staff,{id:staffId,name,role:"therapist",active:true}]},{...input,staffId},id);
}
export function createSession(store: Store, input: NewSessionInput, id: string): Store {
  if (!store.customers.some(c => c.id === input.customerId)) throw new Error("客户不存在，请返回客户列表重新选择。");
  if (!store.staff.some(s => s.id === input.staffId && s.active)) throw new Error("请选择有效的服务人员。");
  if (!input.complaint.trim() || !input.serviceType.trim() || !input.serviceDate) throw new Error("请补全服务时间、项目和本次主诉。");
  if (store.sessions.some(s => s.customerId === input.customerId && s.status === "in_progress")) throw new Error("该客户已有进行中的服务，请先查看现有服务。");
  if (input.packageId) {
    const pkg = store.packages.find(p => p.id === input.packageId && p.customerId === input.customerId);
    if (!pkg || packageState(store, pkg, input.serviceDate.slice(0,10)) !== "使用中" || packageBalance(store, pkg).remaining <= 0) throw new Error("所选权益不可用。");
    if (!pkg.items.includes(input.serviceType)) throw new Error("本项目不在该套餐包含的项目中。");
    if (pkg.purchasedAt > input.serviceDate.slice(0,10)) throw new Error("服务日期不能早于套餐购买日期。");
  }
  return { ...store, customers: store.customers.map(c => c.id === input.customerId ? { ...c, updatedAt: input.serviceDate } : c), sessions: [...store.sessions, { ...input, id, status: "in_progress", result: "", feedback: "", summary: "", change: "", rating: "", salesDiscussed: false, completedAt: null }] };
}
