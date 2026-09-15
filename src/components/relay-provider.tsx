"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Store } from "@/lib/domain/types";
import { createEmptyStore } from "@/lib/data/empty-store";
import { localRepository } from "@/lib/data/local-repository";
type RelayContext = { store: Store; ready: boolean; error: string; update: (fn: (current: Store) => Store) => void };
const Context = createContext<RelayContext | null>(null);
export function RelayProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(createEmptyStore);
  const currentStore = useRef(store);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { try { const data=localRepository.load(); currentStore.current=data; setStore(data); setReady(true); } catch { setError("无法读取本机数据，暂时不能保存。请检查浏览器存储设置，原有数据未被覆盖。"); } }, []);
  function update(fn: (current: Store) => Store) {
    if (!ready) throw new Error("本机存储尚未就绪，暂时无法保存。");
    const next = fn(currentStore.current);
    try { localRepository.save(next); } catch { throw new Error("保存失败，浏览器存储不可用。请保留当前页面内容后重试。"); }
    currentStore.current=next; setStore(next);
  }
  return <Context.Provider value={{ store, ready, error, update }}>{children}</Context.Provider>;
}
export function useRelay() { const context = useContext(Context); if (!context) throw new Error("Missing RelayProvider"); return context; }
