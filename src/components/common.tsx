import Link from "next/link";
import { ArrowUpRight, Plus, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import type { ReactNode } from "react";
export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) { return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>; }
export function Badge({children, tone="neutral"}: {children:ReactNode; tone?:string}) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Panel({ title, meta, action, children, className="" }: { title: string; meta?:string; action?:ReactNode; children:ReactNode; className?:string }) { return <section className={`panel ${className}`}><div className="panel-head"><h2>{title}{meta && <span className="panel-meta">{meta}</span>}</h2>{action}</div>{children}</section>; }
export function ViewLink({href, children="查看全部"}: {href:string; children?:ReactNode}) {return <Link className="text-link" href={href}>{children}<ChevronRight size={14}/></Link>;}
export function NewServiceButton({customerId}: {customerId?:string}) { return <Button asChild><Link href={customerId ? `/customers/${customerId}/services/new` : "/services/new"}><Plus size={16}/>新建服务</Link></Button>; }
export function Empty({title, detail, action}: {title:string; detail?:string; action?:ReactNode}) {return <div className="empty"><h3>{title}</h3>{detail&&<p>{detail}</p>}{action}</div>;}
export function CustomerLink({id,name,sub}: {id:string;name:string;sub?:string}) {return <Link className="customer-link" href={`/customers/${id}`}><span className="avatar">{name[0]}</span><span><strong>{name}</strong>{sub&&<small>{sub}</small>}</span></Link>;}
export function DetailValue({label,children}: {label:string;children:ReactNode}) {return <div className="detail-value"><dt>{label}</dt><dd>{children || "暂未记录"}</dd></div>;}
export { ArrowUpRight };
