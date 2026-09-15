import type { Metadata } from "next";
import "./globals.css";
import { RelayProvider } from "@/components/relay-provider";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata = {title: "德汇康 · 客户服务接力档案", description: "门店内部客户健康档案与服务接力工作台", icons: {icon: "/favicon.svg"}};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {return <html lang="zh-CN"><body><RelayProvider><AppShell>{children}</AppShell></RelayProvider></body></html>;}
