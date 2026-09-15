import { CustomerDetail } from "@/components/customer-detail";
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{tab?:string}>}) {const {id}=await params;const {tab}=await searchParams;return <CustomerDetail id={id} initialTab={tab}/>;}
