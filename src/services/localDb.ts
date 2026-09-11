/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Case, Client, Hearing, Procedure, Task, FinanceTransaction } from "../types";

// Key definitions
const KEYS = {
  CASES: "mizan_cases",
  CLIENTS: "mizan_clients",
  HEARINGS: "mizan_hearings",
  PROCEDURES: "mizan_procedures",
  TASKS: "mizan_tasks",
  FINANCES: "mizan_finances"
};

// Initial seeded datasets for fully localized Yemeni legal system demo
const SEEDED_CLIENTS: Client[] = [
  {
    clientId: "cl-1",
    fullName: "الشيخ فؤاد محمد الكبسي",
    phone: "777123456",
    email: "alkebsi.f@gmail.com",
    identityNumber: "01010023451",
    type: "INDIVIDUAL",
    createdAt: "2026-01-10T10:00:00Z"
  },
  {
    clientId: "cl-2",
    fullName: "شركة سبأفون للاتصالات - الإدارة القانونية",
    phone: "01444555",
    email: "legal@sabafon.com.ye",
    identityNumber: "220451",
    type: "ORGANIZATION",
    createdAt: "2026-02-15T09:30:00Z"
  },
  {
    clientId: "cl-3",
    fullName: "المهندس عادل ناصر الصنعاني",
    phone: "733456789",
    email: "adel.nasser@yahoo.com",
    identityNumber: "01020087654",
    type: "INDIVIDUAL",
    createdAt: "2026-03-01T14:15:00Z"
  }
];

const SEEDED_CASES: Case[] = [
  {
    caseId: "cs-1",
    title: "نزاع حول عقار تجاري بشارع حدة",
    caseNumber: "١٢/ق/٢٠٢٦",
    caseType: "مدني - عقارات",
    courtName: "محكمة غرب الأمانة الابتدائية - صنعاء",
    description: "دعوى إثبات ملكية عقار تجاري وبطلان مستندات البيع المقدمة من المدعى عليه استناداً لشهادة حجة الوقف المؤرخة سنة ١٣٨٥ هـ.",
    clientIds: ["cl-1"],
    status: "ACTIVE",
    createdAt: "2026-01-12T11:00:00Z"
  },
  {
    caseId: "cs-2",
    title: "دعوى المطالبة بمستحقات توريد قطع غيار شبكات",
    caseNumber: "٢٤٤/ت/٢٠٢٦",
    caseType: "تجاري - عقود وتوريد",
    courtName: "المحكمة التجارية الابتدائية بالأمانة",
    description: "المطالبة بوفاء قيمة الشحنة الرابعة الموردة لمستودعات الشركة بموجب الفواتير المعتمدة والمحاضر الموقعة.",
    clientIds: ["cl-2"],
    status: "ACTIVE",
    createdAt: "2026-02-18T10:00:00Z"
  },
  {
    caseId: "cs-3",
    title: "فسخ عقد مقاولة إنشائية - عمارة الأصبحي",
    caseNumber: "٨٩/م/٢٠٢٦",
    caseType: "مدني - مقاولات",
    courtName: "محكمة جنوب شرق الأمانة الابتدائية",
    description: "طلب فسخ عقد المقاولة بسبب التأخر الطويل في التنفيذ وعدم الالتزام بالمواصفات الهندسية لأساسات الخرسانة المسلحة.",
    clientIds: ["cl-3"],
    status: "ACTIVE",
    createdAt: "2026-03-03T15:00:00Z"
  }
];

const SEEDED_HEARINGS: Hearing[] = [
  {
    hearingId: "hr-1",
    caseId: "cs-1",
    courtName: "محكمة غرب الأمانة - القاعة رقم ٣",
    date: "2026-08-25",
    time: "09:30",
    judgeName: "القاضي عبدالملك العزير",
    notes: "جلسة مخصصة لتقديم مستند حجة الوقف الأصلية من قبلنا وسماع شهود الإثبات الأربعة."
  },
  {
    hearingId: "hr-2",
    caseId: "cs-2",
    courtName: "المحكمة التجارية بالأمانة - القاعة رقم ١",
    date: "2026-08-30",
    time: "10:00",
    judgeName: "القاضي يحيى الخولاني",
    notes: "جلسة للرد على دفع المدعى عليه بشأن عدم استلام الفواتير وتعيين خبير محاسبي معتمد."
  }
];

const SEEDED_PROCEDURES: Procedure[] = [
  {
    procedureId: "pr-1",
    caseId: "cs-1",
    title: "إيداع طلب استدعاء شهود عيان",
    date: "2026-08-10",
    notes: "تم إيداع العريضة في قلم كتاب المحكمة وسداد الرسوم وإعلان الخصوم قانونياً."
  },
  {
    procedureId: "pr-2",
    caseId: "cs-2",
    title: "تقديم كشف الحساب البنكي وصور التحويلات",
    date: "2026-08-14",
    notes: "تم تجهيز المستندات مع ترجمة قانونية للتقرير الأجنبي وإلحاقها بملف الخصومة."
  }
];

const SEEDED_TASKS: Task[] = [
  {
    taskId: "tk-1",
    caseId: "cs-1",
    title: "تجهيز أصول مستندات التمليك وحجة الوقف والترجمات",
    description: "مطابقة حجج الوقف ومراجعة التسلسل الزمني للملكية وعمل نسخ ملونة لتقديمها للقاضي.",
    dueDate: "2026-08-24",
    priority: "HIGH",
    status: "IN_PROGRESS"
  },
  {
    taskId: "tk-2",
    caseId: "cs-3",
    title: "عمل معاينة فنية ميدانية من خبير نقابة المهندسين",
    description: "التنسيق مع مكتب المهندس لزيارة عمارة الأصبحي وتصوير عيوب الصب الخرساني وكتابة محضر معاينة هندسي.",
    dueDate: "2026-08-28",
    priority: "MEDIUM",
    status: "PENDING"
  }
];

const SEEDED_FINANCES: FinanceTransaction[] = [
  {
    id: "fn-1",
    caseId: "cs-1",
    type: "INFLOW",
    amount: 1500000,
    date: "2026-08-01",
    description: "دفعة مقدم أتعاب المرافعات وكتابة اللائحة الابتدائية"
  },
  {
    id: "fn-2",
    caseId: "cs-1",
    type: "OUTFLOW",
    amount: 50000,
    date: "2026-08-05",
    description: "رسوم إعلان عريضة الدعوى وإيداع حجة الوقف في قلم الكتاب"
  },
  {
    id: "fn-3",
    caseId: "cs-2",
    type: "INFLOW",
    amount: 2500000,
    date: "2026-08-12",
    description: "القسط الأول من الأتعاب السنوية لإدارة الدائرة القانونية والنيابية للشركة"
  }
];

export const LocalDatabaseService = {
  initialize() {
    if (!localStorage.getItem(KEYS.CLIENTS)) {
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(SEEDED_CLIENTS));
    }
    if (!localStorage.getItem(KEYS.CASES)) {
      localStorage.setItem(KEYS.CASES, JSON.stringify(SEEDED_CASES));
    }
    if (!localStorage.getItem(KEYS.HEARINGS)) {
      localStorage.setItem(KEYS.HEARINGS, JSON.stringify(SEEDED_HEARINGS));
    }
    if (!localStorage.getItem(KEYS.PROCEDURES)) {
      localStorage.setItem(KEYS.PROCEDURES, JSON.stringify(SEEDED_PROCEDURES));
    }
    if (!localStorage.getItem(KEYS.TASKS)) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(SEEDED_TASKS));
    }
    if (!localStorage.getItem(KEYS.FINANCES)) {
      localStorage.setItem(KEYS.FINANCES, JSON.stringify(SEEDED_FINANCES));
    }
  },

  resetAndSeedAll() {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(SEEDED_CLIENTS));
    localStorage.setItem(KEYS.CASES, JSON.stringify(SEEDED_CASES));
    localStorage.setItem(KEYS.HEARINGS, JSON.stringify(SEEDED_HEARINGS));
    localStorage.setItem(KEYS.PROCEDURES, JSON.stringify(SEEDED_PROCEDURES));
    localStorage.setItem(KEYS.TASKS, JSON.stringify(SEEDED_TASKS));
    localStorage.setItem(KEYS.FINANCES, JSON.stringify(SEEDED_FINANCES));
  },

  // Clients
  getClients(): Client[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(KEYS.CLIENTS) || "[]");
  },
  saveClients(clients: Client[]) {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },
  addClient(client: Client) {
    const clients = this.getClients();
    clients.push(client);
    this.saveClients(clients);
  },

  // Cases
  getCases(): Case[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(KEYS.CASES) || "[]");
  },
  saveCases(cases: Case[]) {
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
  },
  addCase(c: Case) {
    const cases = this.getCases();
    cases.push(c);
    this.saveCases(cases);
  },

  // Hearings
  getHearings(): Hearing[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(KEYS.HEARINGS) || "[]");
  },
  saveHearings(hearings: Hearing[]) {
    localStorage.setItem(KEYS.HEARINGS, JSON.stringify(hearings));
  },
  addHearing(h: Hearing) {
    const hearings = this.getHearings();
    hearings.push(h);
    this.saveHearings(hearings);
  },

  // Procedures
  getProcedures(): Procedure[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(KEYS.PROCEDURES) || "[]");
  },
  saveProcedures(procedures: Procedure[]) {
    localStorage.setItem(KEYS.PROCEDURES, JSON.stringify(procedures));
  },
  addProcedure(p: Procedure) {
    const procedures = this.getProcedures();
    procedures.push(p);
    this.saveProcedures(procedures);
  },

  // Tasks
  getTasks(): Task[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(KEYS.TASKS) || "[]");
  },
  saveTasks(tasks: Task[]) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },
  addTask(t: Task) {
    const tasks = this.getTasks();
    tasks.push(t);
    this.saveTasks(tasks);
  },

  // Finances
  getFinances(): FinanceTransaction[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(KEYS.FINANCES) || "[]");
  },
  saveFinances(finances: FinanceTransaction[]) {
    localStorage.setItem(KEYS.FINANCES, JSON.stringify(finances));
  },
  addFinance(f: FinanceTransaction) {
    const finances = this.getFinances();
    finances.push(f);
    this.saveFinances(finances);
  }
};
