/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CaseType {
  CIVIL = "مدني",
  CRIMINAL = "جنائي",
  COMMERCIAL = "تجاري",
  PERSONAL = "أحوال شخصية",
  LABOR = "عمالي",
  ADMINISTRATIVE = "إداري"
}

export enum CaseStatus {
  ACTIVE = "نشطة (قيد النظر)",
  HELD = "محكومة",
  APPEALED = "مستأنفة",
  SETTLED = "صلح ودي",
  CLOSED = "مؤرشفة"
}

export enum SessionStatus {
  SCHEDULED = "مجدولة",
  ATTENDED = "تم حضورها",
  POSTPONED = "مؤجلة",
  DECISIVE = "جلسة النطق بالحكم",
  CANCELED = "ملغاة"
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  base64Data?: string; // Storing base64 for real file previews / AI text extraction if possible
  url?: string; // URL for server-to-client downloadable files
  uploadDate: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  docType: string; // "عقد", "عريضة دعوى", "مذكرة دفاع", "توكيل", "بصيرة"
  caseId?: string; // Optional links to a case
  lastModified: string;
  attachments: Attachment[];
  isArchived?: boolean;
  archivedAt?: string;
}

export interface LegalSession {
  id: string;
  caseId: string;
  caseTitle: string;
  sessionDateGregorian: string; // YYYY-MM-DD
  sessionDateHijri: string; // Arabic Hijri text
  time: string; // HH:MM
  courtName: string; // Court and Chamber Name (e.g. محكمة غرب الأمانة - الدائرة المدنية الأولى)
  judgeName: string;
  status: SessionStatus;
  requirements: string[]; // Legal requests to prepare
  notes: string; // Outcomes or notes of the session
  decisions?: string; // القرارات أو الأوامر الصادرة
  nextSteps?: string; // الخطوات التالية
  attendingLawyerType?: "original" | "deputy" | "absent";
  deputyName?: string;
}

export interface LegalCase {
  id: string;
  caseNumber: string; // System custom case number, e.g. (112/تجاري/2026)
  title: string;
  type: CaseType;
  court: string;
  progressStage: "ابتدائية" | "استئناف" | "محكمة عليا" | "تنفيذ";
  clientName: string;
  clientRole: "مدعي" | "مدعى عليه" | "طرف ثالث" | "مستأنف" | "مستأنف ضده";
  opponentName: string;
  opponentLawyer: string;
  judgeName: string;
  status: CaseStatus;
  feesTotal: number;
  feesPaid: number;
  description: string;
  startDate: string;
  attachments: Attachment[];
  criminalSubType?: "جسيمة" | "غير جسيمة";
}

export interface YemeniLawDigest {
  id: string;
  title: string;
  category: string;
  description: string;
  articlesCount: number;
  highlights: {
    title: string;
    content: string;
    articles: string;
  }[];
}

export interface RecycleBinItem {
  id: string;
  type: "case" | "session" | "document";
  deletedAt: string;
  itemData: any; // LegalCase | LegalSession | Document
  associatedSessions?: any[]; // LegalSession[]
}

