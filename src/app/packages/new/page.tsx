import { PackageForm } from "@/components/package-form";
export default async function Page({searchParams}:{searchParams:Promise<{customerId?:string}>}) {const {customerId}=await searchParams;return <PackageForm customerId={customerId}/>;}
