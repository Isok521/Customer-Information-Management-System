# 德汇康 · 客户服务接力档案

Next.js + TypeScript + Tailwind CSS + Radix / shadcn/ui组件结构，Supabase PostgreSQL为目标数据库。

## 当前版本（2026-09-14）

- 默认空客户、空服务、空套餐和空跟进，不再展示演示客户。
- 按门店纸质问卷逐项录入；客户详情可回看完整答案，也可编辑原档案。
- 客户来源可多选，词条可增加、移除；历史客户来源不受词条删除影响。
- 手动新增和编辑已购套餐：自定义名称、项目、金额、次数、有效期和状态。
- 支持迁入旧卡的录入前已用次数，剩余次数自动计算，不伪造历史服务。
- 新建服务允许自由填写实际项目和员工姓名；开始服务不扣次。
- 页面日期使用Asia/Shanghai当前日期。

旧版本本机数据会一次性迁移：清除预置客户c-1至c-6及关联记录，保留后来手工创建的新ID客户和权益。新数据迁移成功后才移除旧存储键。

## 启动

需要Node.js 20.9+。使用pnpm及随项目提供的锁文件：

```powershell
corepack pnpm install
corepack pnpm dev
```

也可使用npm：

```powershell
npm install
npm run dev
```

访问 http://127.0.0.1:3000。无需Supabase环境变量即可本地测试。

```powershell
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

## 本地保存与后续接入

数据仅保存在当前浏览器站点的localStorage中。来源词条、客户问卷及套餐都会刷新保留，不在不同浏览器、域名或设备之间同步。不要清除站点存储，否则会丢失手工录入内容。

还未实现员工登录、真实数据库Repository、服务结束和自动扣次界面、即时记录写入、回访结果编辑与审计。不要把本地测试作为多人共享正式档案库。

Supabase客户端与.env.example已预留；填写变量不会自动上传本地数据。两个SQL迁移包含核心表、问卷逐项字段、来源词条、期初已用次数、完成扣次触发器和员工只读RLS；未运行远端迁移。

## 文件结构

- src/app：页面、路由和全局样式。
- src/components：客户问卷、来源管理、套餐表单及其他业务组件。
- src/lib/domain：领域类型、问卷原选项与统计逻辑。
- src/lib/data：空数据初始化、一次性迁移、客户/权益校验与本地Repository。
- supabase/migrations：PostgreSQL结构和权限约束。
- tests：独立业务与数据库测试；Mock仅用于测试，不打入运行页面。
- docs：产品设计和变更说明。

本轮详细对应关系见 [纸质问卷电子化说明](docs/纸质问卷电子化说明.md)。[第一阶段产品设计](docs/产品结构与页面框架.md)和[第一阶段数据库设计](docs/数据库设计.md)作为阶段记录保留，最新功能边界以本说明为准。
