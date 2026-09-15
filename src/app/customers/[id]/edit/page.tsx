import { CustomerForm } from "@/components/customer-form";
export default async function Page({params}:{params:Promise<{id:string}>}) {const {id}=await params;return <CustomerForm customerId={id}/>;}
