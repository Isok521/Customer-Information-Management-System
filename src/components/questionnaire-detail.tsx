import type { HealthQuestionnaire } from "@/lib/domain/types";
import { CONTRAINDICATIONS, NOTICES, PAPER_CONFIRMATION, answerLabel } from "@/lib/domain/questionnaire";
import { DetailValue, Panel } from "./common";
export function QuestionnaireDetail({q}:{q:HealthQuestionnaire}) {
  return <div className="section-stack"><Panel title="纸质问卷 · 逐项电子记录"><dl className="health-grid">
    <DetailValue label="体验项目">{q.experienceItem}</DetailValue><DetailValue label="填表日期">{q.filledAt}</DetailValue>
    <DetailValue label="1. 年龄区间">{q.ageRange}</DetailValue><DetailValue label="2. 症状勾选">{q.symptoms.join("、")||"未勾选 / 未填写"}</DetailValue>
    <DetailValue label="收缩压 / 舒张压">{q.systolic??"未测"} / {q.diastolic??"未测"} mmHg</DetailValue><DetailValue label="心率">{q.heartRate===null?"未测":`${q.heartRate} 次/分`}</DetailValue>
    <DetailValue label="其他症状">{q.otherSymptoms}</DetailValue><DetailValue label="3. 平时更喜欢的养生方式">{q.wellnessPreferences.join("；")}</DetailValue>
    <DetailValue label="4. 日常健康养护消费观念">{q.spendingView}</DetailValue><DetailValue label="5. 资讯 / 沙龙通知接收意愿">{q.receiveUpdates==="yes"?"愿意":q.receiveUpdates==="no"?"暂不需要":"未填写"}</DetailValue>
    <DetailValue label="6. 是否每年体检">{answerLabel(q.annualCheckup)}</DetailValue><DetailValue label="哪些指标异常">{q.abnormalIndicators}</DetailValue>
    <DetailValue label="是否有急于解决的症状">{answerLabel(q.urgentSymptoms)}</DetailValue><DetailValue label="急于解决的症状说明">{q.urgentSymptomsDetail}</DetailValue>
    <DetailValue label="是否每周有5次快走或慢跑达到150分钟">{answerLabel(q.weeklyExercise)}</DetailValue><DetailValue label="个人养护诉求补充">{q.personalNeeds}</DetailValue>
    <DetailValue label="7. 获知渠道 / 客户来源">{q.sourceChannels.join("、")}</DetailValue><DetailValue label="其他渠道">{q.sourceOther}</DetailValue>
  </dl></Panel><Panel title="设备禁忌逐项核实"><dl className="health-grid">{CONTRAINDICATIONS.map((c,i)=><DetailValue label={`${i+1}. ${c.text}`} key={c.id}>{q.contraindicationChecks[c.id]==="yes"?"有此情况":q.contraindicationChecks[c.id]==="no"?"已核实无此情况":"未核实"}</DetailValue>)}<DetailValue label="禁忌 / 特别关注补充">{q.contraindicationNotes}</DetailValue></dl></Panel><Panel title="纸质告知与签名留存"><dl className="health-grid">
    <DetailValue label="已阅读并确认纸质告知内容">{answerLabel(q.noticeRead)}</DetailValue><DetailValue label="纸质问卷已有客户签名">{answerLabel(q.paperSigned)}</DetailValue>
    <DetailValue label="签名姓名（照录）">{q.signerName}</DetailValue><DetailValue label="签署日期">{q.signedAt}</DetailValue><DetailValue label="纸质问卷留存 / 签名备注">{q.signatureNotes}</DetailValue>
  </dl><details className="paper-copy"><summary>查看注意事项及客户确认原文</summary><ol>{NOTICES.map(n=><li key={n}>{n}</li>)}</ol><p>{PAPER_CONFIRMATION}</p></details></Panel></div>;
}
