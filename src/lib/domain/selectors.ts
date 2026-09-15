import type { Package, Store } from "./types";
export function businessToday() {return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());}
export function personName(store: Store, id: string) { return store.staff.find(s => s.id === id)?.name ?? "未分配"; }
export function customerName(store: Store, id: string) { return store.customers.find(c => c.id === id)?.name ?? "未知客户"; }
export function packageBalance(store: Store, pkg: Package) {
  const used = (pkg.openingUsed ?? 0) + store.usages.filter(u => u.packageId === pkg.id).reduce((sum, u) => sum + u.quantity, 0);
  return { used, remaining: pkg.total - used };
}
export function packageState(store: Store, pkg: Package, today = businessToday()) {
  if (pkg.status === "cancelled") return "已取消";
  if (pkg.status === "frozen") return "已冻结";
  if (pkg.validUntil < today) return "已过期";
  return packageBalance(store, pkg).remaining <= 0 ? "已用完" : "使用中";
}
export function recentSessions(store: Store, customerId: string) {
  return store.sessions.filter(s => s.customerId === customerId && s.status === "completed").sort((a,b) => b.serviceDate.localeCompare(a.serviceDate));
}
export function pendingFollowUps(store: Store, customerId?: string) {
  return store.followUps.filter(f => f.status === "pending" && (!customerId || f.customerId === customerId)).sort((a,b) => (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999"));
}
export function searchCustomers(store: Store, query: string) {
  const q = query.trim().replace(/\s/g, "");
  return store.customers.filter(c => c.name.includes(q) || c.phone.includes(q));
}
export function dateLabel(value: string) { return value.slice(5, 10).replace("-", "月") + "日"; }
