import type { HealthQuestionnaire } from "./types";
export const AGE_RANGES = ["25-30岁", "31-40岁", "41-50岁", "50岁以上"];
export const SYMPTOMS = ["失眠", "颈椎痛", "腰椎痛", "便秘", "高血压", "高血脂", "糖尿病", "痛经", "风湿性关节炎", "腰肌劳损", "肩周炎", "前列腺炎", "盆腔炎", "乳腺增生"];
export const WELLNESS = ["情志养心：静心解压、情绪调养", "功法养形：形体功法、舒展塑形", "外调通络：古法外调、仪器通络", "内服培元：食补内养、滋补调理"];
export const SPENDING = ["偶尔体验，按需选择", "每月定期做基础养护", "愿意长期系统性调理保养"];
export const DEFAULT_SOURCES = ["抖音", "朋友介绍", "官方网站", "公众号"];
export const CONTRAINDICATIONS = [
  { id: "implants", text: "装有心脏起搏器、金属支架、电子仪器等体内置入物者" },
  { id: "bleeding", text: "出血性疾病、血液病者" },
  { id: "infection", text: "传染病、皮肤病、性病" },
  { id: "acute", text: "急性病发病期间的顾客" },
  { id: "tumor", text: "恶性肿瘤" },
  { id: "special", text: "严重心脏病、严重高血压、孕妇、月经期、意识不清及精神障碍者" },
  { id: "underFive", text: "五岁以下孩童" }
];
export const NOTICES = [
  "调理治疗时隔衣服或毛巾，不要直接对着皮肤；",
  "治疗头使用时间长发热时，停机休息，等治疗头凉了再使用；",
  "仪器属于高精密仪器，要防水防潮；",
  "治疗仪开机时，远离电磁炉、铁制品、手表、电脑、电视机；",
  "不要用力牵拉治疗头的电线，以防电线损伤引起短路；",
  "开机状态下，不能拔出或插入治疗仪，以防电击火花损伤仪器；",
  "为确保安全,在未插入治疗头之前，请不要打开电源开关；",
  "放在儿童不易拿到的地方；",
  "治疗仪开机时，两个治疗头不能太近，以免治疗头发生强烈碰撞造成治疗头外观损坏。"
];
export const PAPER_CONFIRMATION = "本人已清楚明确阅读上述各项的告知内容，如未告知造成严重后果的责任客户自行承担，与德汇康健康管理中心本公司无关。";
export function emptyQuestionnaire(): HealthQuestionnaire {
  return {version:1,filledAt:"",experienceItem:"",ageRange:"",symptoms:[],otherSymptoms:"",systolic:null,diastolic:null,heartRate:null,wellnessPreferences:[],spendingView:"",receiveUpdates:"",annualCheckup:"",abnormalIndicators:"",urgentSymptoms:"",urgentSymptomsDetail:"",weeklyExercise:"",personalNeeds:"",sourceChannels:[],sourceOther:"",contraindicationChecks:{},contraindicationNotes:"",noticeRead:"",paperSigned:"",signerName:"",signedAt:"",signatureNotes:""};
}
export function answerLabel(value: string | undefined) {return value === "yes" ? "是" : value === "no" ? "否" : "未填写";}
