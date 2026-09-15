import type { Store } from "@/lib/domain/types";
export const mockStore: Store = {
  sourceTerms: ["抖音", "朋友介绍", "官方网站", "公众号"],
  staff: [
    { id: "staff-1", name: "王静", role: "therapist", active: true },
    { id: "staff-2", name: "李敏", role: "therapist", active: true },
    { id: "staff-3", name: "陈晓", role: "reception", active: true },
    { id: "staff-4", name: "林店长", role: "admin", active: true }
  ],
  customers: [
    { id: "c-1", name: "陈玉兰", phone: "13800001001", gender: "女", age: "56岁", firstVisit: "2026-09-05", source: "老客推荐", receptionistId: "staff-3", stage: "体验中", tags: ["肩颈问题", "高意向", "价格敏感"], updatedAt: "2026-09-13T10:20:00+08:00" },
    { id: "c-2", name: "张建国", phone: "13800001002", gender: "男", age: "62岁", firstVisit: "2026-08-22", source: "周边到店", receptionistId: "staff-3", stage: "持续服务", tags: ["腰椎问题", "长期客户"], updatedAt: "2026-09-13T09:50:00+08:00" },
    { id: "c-3", name: "刘芳", phone: "13800001003", gender: "女", age: "45岁", firstVisit: "2026-09-09", source: "朋友介绍", receptionistId: "staff-3", stage: "待跟进", tags: ["肩颈问题", "待跟进"], updatedAt: "2026-09-12T16:40:00+08:00" },
    { id: "c-4", name: "王秀英", phone: "13800001004", gender: "女", age: "68岁", firstVisit: "2026-07-18", source: "老客推荐", receptionistId: "staff-3", stage: "持续服务", tags: ["慢病", "长期理疗"], updatedAt: "2026-09-12T15:10:00+08:00" },
    { id: "c-5", name: "赵丽", phone: "13800001005", gender: "女", age: "39岁", firstVisit: "2026-09-13", source: "周边到店", receptionistId: "staff-3", stage: "初次到店", tags: ["肩颈问题"], updatedAt: "2026-09-13T11:00:00+08:00" },
    { id: "c-6", name: "周志明", phone: "13800001006", gender: "男", age: "51岁", firstVisit: "2026-09-02", source: "朋友介绍", receptionistId: "staff-3", stage: "体验中", tags: ["腰椎问题", "高意向"], updatedAt: "2026-09-11T17:00:00+08:00" }
  ],
  healthProfiles: [
    { customerId: "c-1", symptoms: "肩颈僵硬，右侧更明显；久坐后不适", chronicConditions: "自述有高血压史", bloodPressure: "132/84 mmHg（09-10 自述）", heartRate: 76, goal: "缓解肩颈不适，晚上睡得更踏实", preferences: "偏好轻柔手法，服务前希望先解释流程", spendingView: "认可效果后再考虑长期套餐", contraindications: "避免颈部用力；当天状态有变化先沟通", remarks: "以上为客户自述及服务记录，不作为诊断。" },
    { customerId: "c-2", symptoms: "腰部反复酸胀，久站后明显", chronicConditions: "未自述", bloodPressure: "未记录", heartRate: null, goal: "日常活动更舒适", preferences: "喜欢安静的服务环境", spendingView: "重视连续服务体验", contraindications: "腰部力度需提前确认", remarks: "客户反馈以本人当次描述为准。" },
    { customerId: "c-3", symptoms: "伏案后肩颈紧绷", chronicConditions: "未填写", bloodPressure: "未记录", heartRate: null, goal: "缓解工作后的疲劳", preferences: "偏好工作日傍晚", spendingView: "希望先了解效果", contraindications: "待接待时确认", remarks: "健康问卷待补充。" },
    { customerId: "c-4", symptoms: "背部易疲劳", chronicConditions: "自述慢病，详情待核实", bloodPressure: "未记录", heartRate: null, goal: "保持日常活动舒适", preferences: "固定技师优先", spendingView: "倾向按次服务", contraindications: "每次服务前确认当日状态", remarks: "" },
    { customerId: "c-5", symptoms: "肩颈紧绷", chronicConditions: "待填写", bloodPressure: "未记录", heartRate: null, goal: "了解适合的服务", preferences: "待了解", spendingView: "待了解", contraindications: "问卷尚未完成，服务前确认", remarks: "新客待完善问卷。" },
    { customerId: "c-6", symptoms: "腰部容易疲劳", chronicConditions: "未自述", bloodPressure: "未记录", heartRate: null, goal: "缓解日常疲劳", preferences: "周末上午", spendingView: "愿意长期服务", contraindications: "服务力度先沟通", remarks: "" }
  ],
  packages: [
    { id: "p-1", customerId: "c-1", name: "肩颈舒缓体验卡", purchasedAt: "2026-09-05", amount: 299, items: ["肩颈舒缓"], total: 3, validUntil: "2026-10-05", status: "active" },
    { id: "p-2", customerId: "c-2", name: "腰背养护套餐", purchasedAt: "2026-08-22", amount: 1599, items: ["腰背养护"], total: 12, validUntil: "2027-02-22", status: "active" },
    { id: "p-3", customerId: "c-6", name: "腰背养护体验卡", purchasedAt: "2026-09-02", amount: 299, items: ["腰背养护"], total: 3, validUntil: "2026-10-02", status: "active" }
  ],
  sessions: [
    { id: "s-1", customerId: "c-1", serviceDate: "2026-09-07T09:30:00+08:00", staffId: "staff-1", serviceType: "肩颈舒缓", packageId: "p-1", status: "completed", complaint: "右侧肩颈僵硬", physicalState: "精神尚可", attention: "力度先沟通", result: "完成首次体验服务", feedback: "当下感觉轻松了一些", summary: "从轻力度开始，客户接受良好", change: "自述紧绷感减轻", rating: "明显改善", salesDiscussed: false, completedAt: "2026-09-07T10:20:00+08:00" },
    { id: "s-2", customerId: "c-1", serviceDate: "2026-09-10T10:00:00+08:00", staffId: "staff-2", serviceType: "肩颈舒缓", packageId: "p-1", status: "completed", complaint: "久坐后仍有酸痛", physicalState: "睡眠一般，右侧紧绷", attention: "轻柔手法，确认力度", result: "完成第二次体验服务", feedback: "肩颈比上次松一些，但坐久了还是酸", summary: "客户认可当次感受，希望先用完体验卡再决定", change: "自述紧绷感较首次缓解", rating: "有所改善", salesDiscussed: true, completedAt: "2026-09-10T10:50:00+08:00" },
    { id: "s-3", customerId: "c-1", serviceDate: "2026-09-13T10:00:00+08:00", staffId: "staff-1", serviceType: "肩颈舒缓", packageId: "p-1", status: "in_progress", complaint: "肩颈较前缓解，右肩仍酸", physicalState: "自述状态平稳", attention: "先确认今日状态；体验卡剩余1次", result: "", feedback: "", summary: "", change: "", rating: "", salesDiscussed: false, completedAt: null },
    { id: "s-4", customerId: "c-2", serviceDate: "2026-09-13T09:00:00+08:00", staffId: "staff-2", serviceType: "腰背养护", packageId: "p-2", status: "completed", complaint: "久站后腰酸", physicalState: "状态平稳", attention: "控制力度", result: "完成腰背养护", feedback: "今天做完轻松些", summary: "下次继续询问日常感受", change: "自述酸胀减轻", rating: "有所改善", salesDiscussed: false, completedAt: "2026-09-13T09:50:00+08:00" },
    { id: "s-5", customerId: "c-5", serviceDate: "2026-09-13T14:00:00+08:00", staffId: "staff-1", serviceType: "肩颈舒缓", packageId: null, status: "scheduled", complaint: "肩颈紧绷", physicalState: "待当面确认", attention: "首次到店，补全问卷", result: "", feedback: "", summary: "", change: "", rating: "", salesDiscussed: false, completedAt: null },
    { id: "s-6", customerId: "c-4", serviceDate: "2026-09-13T15:30:00+08:00", staffId: "staff-2", serviceType: "背部舒缓", packageId: null, status: "scheduled", complaint: "背部疲劳", physicalState: "待当面确认", attention: "确认当日状态", result: "", feedback: "", summary: "", change: "", rating: "", salesDiscussed: false, completedAt: null },
    { id: "s-7", customerId: "c-3", serviceDate: "2026-09-12T16:00:00+08:00", staffId: "staff-1", serviceType: "肩颈舒缓", packageId: null, status: "completed", complaint: "肩颈紧绷", physicalState: "久坐疲劳", attention: "轻柔力度", result: "完成服务", feedback: "舒服些了，后续还要看时间", summary: "下次联系确认可到店时段", change: "自述疲劳减轻", rating: "有所改善", salesDiscussed: true, completedAt: "2026-09-12T16:40:00+08:00" },
    { id: "s-8", customerId: "c-6", serviceDate: "2026-09-11T16:00:00+08:00", staffId: "staff-2", serviceType: "腰背养护", packageId: "p-3", status: "completed", complaint: "腰部疲劳", physicalState: "状态平稳", attention: "先确认力度", result: "完成体验服务", feedback: "体验不错，想了解长期方案", summary: "下次介绍套餐使用规则", change: "自述舒适度提高", rating: "有所改善", salesDiscussed: true, completedAt: "2026-09-11T17:00:00+08:00" }
  ],
  notes: [
    { id: "n-1", sessionId: "s-2", at: "2026-09-10T10:15:00+08:00", feedback: "右边还有点酸，这个力度可以", observation: "客户可接受当前力度", remark: "继续轻柔操作" },
    { id: "n-2", sessionId: "s-3", at: "2026-09-13T10:20:00+08:00", feedback: "今天比上次轻松一些", observation: "客户状态平稳", remark: "结束时再确认当次感受" }
  ],
  usages: [
    { id: "u-1", packageId: "p-1", sessionId: "s-1", customerId: "c-1", staffId: "staff-1", usedAt: "2026-09-07T10:20:00+08:00", quantity: 1 },
    { id: "u-2", packageId: "p-1", sessionId: "s-2", customerId: "c-1", staffId: "staff-2", usedAt: "2026-09-10T10:50:00+08:00", quantity: 1 },
    { id: "u-3", packageId: "p-2", sessionId: "s-4", customerId: "c-2", staffId: "staff-2", usedAt: "2026-09-13T09:50:00+08:00", quantity: 1 },
    { id: "u-4", packageId: "p-3", sessionId: "s-8", customerId: "c-6", staffId: "staff-2", usedAt: "2026-09-11T17:00:00+08:00", quantity: 1 }
  ],
  followUps: [
    { id: "f-1", customerId: "c-1", sessionId: "s-2", staffId: "staff-3", recommendedItem: "肩颈舒缓", recommendedPackage: "1599元肩颈养护套餐", reaction: "高意向", concerns: ["价格", "医保"], quote: "效果还可以，想再了解价格和医保能不能用。", strategy: "本次体验后询问感受，核实门店支付政策后再答复", dueAt: "2026-09-13", status: "pending", createdAt: "2026-09-10T10:50:00+08:00" },
    { id: "f-2", customerId: "c-3", sessionId: "s-7", staffId: "staff-1", recommendedItem: "肩颈舒缓", recommendedPackage: "肩颈舒缓体验卡", reaction: "犹豫", concerns: ["时间"], quote: "工作忙，怕买了没时间来。", strategy: "询问下周工作日傍晚是否方便到店", dueAt: "2026-09-12", status: "pending", createdAt: "2026-09-12T16:40:00+08:00" },
    { id: "f-3", customerId: "c-6", sessionId: "s-8", staffId: "staff-2", recommendedItem: "腰背养护", recommendedPackage: "腰背养护套餐", reaction: "高意向", concerns: ["效果"], quote: "这次感觉不错，长期怎么安排？", strategy: "回访体验感受，说明套餐次数和有效期", dueAt: "2026-09-14", status: "pending", createdAt: "2026-09-11T17:00:00+08:00" }
  ]
};
