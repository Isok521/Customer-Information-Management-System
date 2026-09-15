import { NewService } from "@/components/new-service";
export default async function Page({params}:{params:Promise<{id:string}>}) {const {id}=await params;return <NewService customerId={id}/>;}
