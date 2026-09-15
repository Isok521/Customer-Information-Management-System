"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, UsersRound, ClipboardList, CreditCard, ListTodo, Search, ChevronRight, ShieldCheck } from "lucide-react";
import { useRelay } from "./relay-provider";
import { searchCustomers } from "@/lib/domain/selectors";
const nav = [
  { href: "/", label: "工作台", icon: LayoutDashboard },
  { href: "/customers", label: "客户档案", icon: UsersRound },
  { href: "/services", label: "服务记录", icon: ClipboardList },
  { href: "/packages", label: "套餐 / 权益", icon: CreditCard },
  { href: "/follow-ups", label: "跟进事项", icon: ListTodo }
];
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname(); const { store, error } = useRelay();
  const [query, setQuery] = useState(""); const [open, setOpen] = useState(false);
  const current = nav.find(n => n.href === "/" ? path === "/" : path.startsWith(n.href));
  const results = query.trim() ? searchCustomers(store, query) : [];
  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="德汇康工作台"><img src="/favicon.svg" alt="" width="37" height="37"/><span>德汇康<small>客户服务接力档案</small></span></Link>
      <div className="store-label"><span className="online-dot"/> 门店工作空间 <span className="store-type">内部</span></div>
      <div className="nav-label">日常工作</div>
      <nav aria-label="主导航">{nav.map(({href,label,icon:Icon}) => <Link key={href} href={href} aria-label={label} title={label} className={`nav-item ${current?.href === href ? "active" : ""}`} aria-current={current?.href === href ? "page" : undefined}><Icon size={19}/><span>{label}</span>{href === "/follow-ups" && <span className="nav-count">{store.followUps.filter(f=>f.status === "pending").length}</span>}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="workspace-note"><ShieldCheck size={18}/><span>每一次服务，都有迹可循<small>共同记录 · 连续服务</small></span></div><div className="profile"><span className="avatar teal">店</span><span>本机工作空间<small>员工姓名按实际录入</small></span></div></div>
    </aside>
    <div className="main-wrap"><header className="topbar"><div className="breadcrumb">门店工作台 <ChevronRight size={14}/><strong>{current?.label ?? "服务详情"}</strong></div><div className="global-search" onBlur={e => {if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);}}><Search size={17}/><input aria-label="全局搜索姓名或手机号" placeholder="搜索客户姓名 / 手机号" value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} onKeyDown={e=>{if(e.key==="Escape") setOpen(false);}}/>{open && query.trim() && <div className="search-results">{results.length ? results.map(c=><Link href={`/customers/${c.id}`} key={c.id} onClick={()=>{setOpen(false);setQuery("");}}><span className="avatar small">{c.name[0]}</span><span>{c.name}<small>{c.phone}</small></span><ChevronRight size={16}/></Link>) : <p>没有找到匹配客户</p>}</div>}</div><span className="demo-badge">本地测试</span></header>
    <main className="main-content">{error && <div role="alert" className="error-banner">{error}</div>}{children}<footer>本地测试 · 数据保存在当前浏览器 · 尚未接入多人共享数据库</footer></main></div>
  </div>;
}
