import { PackageForm } from "@/components/package-form";
export default async function Page({params}:{params:Promise<{id:string}>}) {const {id}=await params;return <PackageForm packageId={id}/>;}
