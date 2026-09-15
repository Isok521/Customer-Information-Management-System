export type Role = "admin" | "reception" | "therapist";
export type Stage = "初次到店" | "体验中" | "持续服务" | "待跟进";
export interface Staff { id: string; name: string; role: Role; active: boolean }
export interface Customer {
  id: string; name: string; phone: string; gender: string; age: string;
  firstVisit: string; source: string; receptionistId: string;
  stage: Stage; tags: string[]; updatedAt: string;
}
export interface HealthProfile {
  customerId: string; symptoms: string; chronicConditions: string; bloodPressure: string;
  heartRate: number | null; goal: string; preferences: string; spendingView: string;
  contraindications: string; remarks: string;
  questionnaire?: HealthQuestionnaire;
}
export type Answer = "" | "yes" | "no";
export interface HealthQuestionnaire {
  version: 1; filledAt: string; experienceItem: string; ageRange: string;
  symptoms: string[]; otherSymptoms: string; systolic: number | null; diastolic: number | null;
  heartRate: number | null; wellnessPreferences: string[]; spendingView: string;
  receiveUpdates: Answer; annualCheckup: Answer; abnormalIndicators: string;
  urgentSymptoms: Answer; urgentSymptomsDetail: string; weeklyExercise: Answer;
  personalNeeds: string; sourceChannels: string[]; sourceOther: string;
  contraindicationChecks: Record<string, Answer>; contraindicationNotes: string;
  noticeRead: Answer; paperSigned: Answer; signerName: string; signedAt: string; signatureNotes: string;
}
export interface ServiceNote { id: string; sessionId: string; at: string; feedback: string; observation: string; remark: string }
export interface ServiceSession {
  id: string; customerId: string; serviceDate: string; staffId: string; serviceType: string;
  packageId: string | null; status: "scheduled" | "in_progress" | "completed" | "cancelled";
  complaint: string; physicalState: string; attention: string;
  result: string; feedback: string; summary: string; change: string; rating: string;
  salesDiscussed: boolean; completedAt: string | null;
}
// Package is the purchased entitlement, not a reusable catalogue template.
export interface Package {
  id: string; customerId: string; name: string; purchasedAt: string; amount: number;
  items: string[]; total: number; validUntil: string; status: "active" | "frozen" | "cancelled";
  openingUsed?: number;
}
export interface PackageUsage { id: string; packageId: string; sessionId: string; customerId: string; staffId: string; usedAt: string; quantity: number }
export interface SalesFollowUp {
  id: string; customerId: string; sessionId: string | null; staffId: string;
  recommendedItem: string; recommendedPackage: string;
  reaction: "接受" | "高意向" | "犹豫" | "拒绝" | "未讨论";
  concerns: string[]; quote: string; strategy: string; dueAt: string | null;
  status: "pending" | "done"; createdAt: string;
}
export interface Store {
  customers: Customer[]; healthProfiles: HealthProfile[]; sessions: ServiceSession[];
  notes: ServiceNote[]; packages: Package[]; usages: PackageUsage[];
  followUps: SalesFollowUp[]; staff: Staff[];
  sourceTerms: string[];
}
export interface NewSessionInput {
  customerId: string; serviceDate: string; staffId: string; serviceType: string; packageId: string | null;
  complaint: string; physicalState: string; attention: string;
}
