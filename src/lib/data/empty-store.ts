import type { Store } from "../domain/types";
import { DEFAULT_SOURCES } from "../domain/questionnaire";
export function createEmptyStore(): Store {
  return { customers:[],healthProfiles:[],sessions:[],notes:[],packages:[],usages:[],followUps:[],staff:[],sourceTerms:[...DEFAULT_SOURCES] };
}
export function migrateLegacyStore(old: Omit<Store,"sourceTerms"> & {sourceTerms?:string[]}): Store {
  const demoIds = new Set(["c-1","c-2","c-3","c-4","c-5","c-6"]);
  const customers=old.customers.filter(c=>!demoIds.has(c.id));
  const customerIds=new Set(customers.map(c=>c.id));
  const packages=old.packages.filter(p=>customerIds.has(p.customerId));
  const packageIds=new Set(packages.map(p=>p.id));
  const sessions=old.sessions.filter(s=>customerIds.has(s.customerId));
  const sessionIds=new Set(sessions.map(s=>s.id));
  const followUps=old.followUps.filter(f=>customerIds.has(f.customerId)&&(!f.sessionId||sessionIds.has(f.sessionId)));
  const healthProfiles=old.healthProfiles.filter(h=>customerIds.has(h.customerId));
  const notes=old.notes.filter(n=>sessionIds.has(n.sessionId));
  const usages=old.usages.filter(u=>customerIds.has(u.customerId)&&packageIds.has(u.packageId)&&sessionIds.has(u.sessionId));
  const referencedStaff=new Set([...customers.map(c=>c.receptionistId),...sessions.map(s=>s.staffId),...followUps.map(f=>f.staffId)]);
  return {customers,healthProfiles,sessions,notes,packages,usages,followUps,staff:old.staff.filter(s=>referencedStaff.has(s.id)||!/^staff-[1-4]$/.test(s.id)),sourceTerms:old.sourceTerms??[...DEFAULT_SOURCES]};
}
