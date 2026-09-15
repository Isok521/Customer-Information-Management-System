import type { Store } from "../domain/types";
import type { RelayRepository } from "./repository";
import { createEmptyStore, migrateLegacyStore } from "./empty-store";
export const STORAGE_KEY = "dehuikang-relay-local-v2";
const LEGACY_KEY = "dehuikang-relay-demo-v1";
const COLLECTIONS = ["customers","healthProfiles","sessions","notes","packages","usages","followUps","staff"] as const;
function parse(raw:string,version:number): Store {
  const parsed=JSON.parse(raw);
  if(parsed.version!==version||!parsed.data||COLLECTIONS.some(k=>!Array.isArray(parsed.data[k]))||(version===2&&!Array.isArray(parsed.data.sourceTerms))) throw new Error("本地数据格式不兼容");
  return parsed.data;
}
export function repositoryFor(storage: Pick<Storage,"getItem"|"setItem"|"removeItem">): RelayRepository {
  return {
    load() {
      const current=storage.getItem(STORAGE_KEY);
      if(current)return parse(current,2);
      const legacy=storage.getItem(LEGACY_KEY);
      const next=legacy?migrateLegacyStore(parse(legacy,1)):createEmptyStore();
      storage.setItem(STORAGE_KEY,JSON.stringify({version:2,data:next}));
      if(legacy)storage.removeItem(LEGACY_KEY);
      return next;
    },
    save(data) {storage.setItem(STORAGE_KEY,JSON.stringify({version:2,data}));}
  };
}
export const localRepository: RelayRepository = {
  load:()=>repositoryFor(window.localStorage).load(),
  save:data=>repositoryFor(window.localStorage).save(data)
};
