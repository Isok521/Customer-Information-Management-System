import { Empty, ViewLink } from "@/components/common";
export default function NotFound(){return <Empty title="这个页面不存在" detail="请从客户档案或服务记录重新进入。" action={<ViewLink href="/">返回工作台</ViewLink>}/>;}
