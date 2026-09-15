import { CustomerList } from "@/components/customer-list";
export default async function Page({searchParams}:{searchParams:Promise<{filter?:string}>}) { const {filter}=await searchParams;return <CustomerList initialFilter={filter}/>; }
