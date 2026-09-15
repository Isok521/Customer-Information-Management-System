"use client";
import { useState } from "react";
import { useRelay } from "@/components/relay-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Empty, PageHeading } from "@/components/common";
import { PackageCard } from "@/components/package-card";
import { packageState } from "@/lib/domain/selectors";
export default function Page(){const {store}=useRelay();const [query,setQuery]=useState("");const [state,setState]=useState("全部状态");const packages=store.packages.filter(p=>(state==="全部状态"||packageState(store,p)===state)&&store.customers.some(c=>c.id===p.customerId&&(c.name.includes(query.trim())||c.phone.includes(query.trim()))));return <><PageHeading title="套餐 / 权益" description="按实际购买情况建立客户权益，查看剩余次数。" action={<Button asChild><Link href="/packages/new">新增套餐 / 权益</Link></Button>}/><div className="panel" style={{marginBottom:22}}><div className="filter-bar"><input placeholder="搜索客户姓名 / 手机号" aria-label="搜索权益所属客户" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="筛选权益状态" value={state} onChange={e=>setState(e.target.value)}>{["全部状态","使用中","已用完","已过期","已冻结","已取消"].map(s=><option key={s}>{s}</option>)}</select><span className="filter-count">{packages.length} 张权益</span></div><p className="inline-alert">套餐名称、包含项目、实付金额及次数均由门店手动录入。</p></div><div className="package-grid">{packages.map(p=><PackageCard key={p.id} pkg={p} showCustomer/>)}</div>{!packages.length&&<Empty title={store.packages.length?"暂无匹配的权益":"尚未录入套餐权益"} detail="先建立客户档案，再为客户添加实际购买的套餐。"/>}</>;}
