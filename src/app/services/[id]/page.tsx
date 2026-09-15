import { ServiceDetail } from "@/components/service-detail";
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{created?:string}>}) {const {id}=await params;const {created}=await searchParams;return <ServiceDetail id={id} created={created==="1"}/>;}
