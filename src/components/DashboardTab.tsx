/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LocalDatabaseService } from "../services/localDb";
import { Case, Client, Hearing, Task, FinanceTransaction } from "../types";
import { 
  Users, Scale, Calendar, CheckSquare, DollarSign, 
  TrendingUp, TrendingDown, Clock, Brain, ArrowLeftRight
} from "lucide-react";

interface DashboardTabProps {
  onNavigateTab: (tabId: any) => void;
}

export default function DashboardTab({ onNavigateTab }: DashboardTabProps) {
  const [cases] = useState<Case[]>(() => LocalDatabaseService.getCases());
  const [clients] = useState<Client[]>(() => LocalDatabaseService.getClients());
  const [hearings] = useState<Hearing[]>(() => LocalDatabaseService.getHearings());
  const [tasks] = useState<Task[]>(() => LocalDatabaseService.getTasks());
  const [finances] = useState<FinanceTransaction[]>(() => LocalDatabaseService.getFinances());

  // Statistics calculations
  const activeCasesCount = cases.filter(c => c.status === "ACTIVE").length;
  const pendingTasksCount = tasks.filter(t => t.status !== "COMPLETED").length;
  const upcomingHearingsCount = hearings.length; // all registered hearings in sandboxed data

  const totalInflows = finances
    .filter(f => f.type === "INFLOW")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalOutflows = finances
    .filter(f => f.type === "OUTFLOW")
    .reduce((sum, current) => sum + current.amount, 0);

  const netProfit = totalInflows - totalOutflows;

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-tab">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1a3636] to-[#2c4c4c] text-white p-6 rounded-2xl border border-[#1a3636]/20 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">مرحباً بك مجدداً في نظام ميزان القضائي ⚖️</h1>
          <p className="text-xs text-gray-300 font-medium">لوحة التحكم الذكية لإدارة القضايا والخطوات والمذكرات القانونية في اليمن.</p>
        </div>
        <button 
          onClick={() => onNavigateTab("AI")}
          className="bg-[#c2b280] hover:bg-[#b0a070] text-[#1a3636] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs shrink-0"
        >
          <Brain className="w-4 h-4" />
          استشر المساعد الذكي
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 block">إجمالي العملاء</span>
            <span className="text-2xl font-extrabold text-gray-800">{clients.length}</span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 block">قضايا قيد المرافعة</span>
            <span className="text-2xl font-extrabold text-[#1a3636]">{activeCasesCount}</span>
          </div>
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 block">الجلسات المجدولة</span>
            <span className="text-2xl font-extrabold text-blue-700">{upcomingHearingsCount}</span>
          </div>
          <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 block">مهام قيد الإنجاز</span>
            <span className="text-2xl font-extrabold text-red-700">{pendingTasksCount}</span>
          </div>
          <div className="bg-red-50 text-red-700 p-3 rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Finances Overview Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
        <h3 className="text-xs font-bold text-[#1a3636] flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
          <DollarSign className="w-4 h-4 text-[#c2b280]" />
          الملخص والتدفق المالي للمكتب (ريال يمني)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 block font-bold">المقبوضات الإجمالية</span>
              <span className="text-base font-extrabold text-emerald-800">{totalInflows.toLocaleString('ar-YE')} ريال</span>
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-red-100 text-red-800 p-2.5 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-red-600 block font-bold">المصروفات والنثريات</span>
              <span className="text-base font-extrabold text-red-800">{totalOutflows.toLocaleString('ar-YE')} ريال</span>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-amber-100 text-amber-800 p-2.5 rounded-lg">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-600 block font-bold">الربح الصافي الفعلي</span>
              <span className="text-base font-extrabold text-amber-800">{netProfit.toLocaleString('ar-YE')} ريال</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hearings and Next Actions */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              الجلسات القضائية القادمة العاجلة
            </h3>
            <button 
              onClick={() => onNavigateTab("HEARINGS")}
              className="text-[10px] font-bold text-[#1a3636] hover:underline"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-3">
            {hearings.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">لا توجد جلسات مجدولة حالياً.</p>
            ) : (
              hearings.slice(0, 3).map((hearing, idx) => {
                const associatedCase = cases.find(c => c.caseId === hearing.caseId);
                return (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3 hover:border-gray-200 transition-colors">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#1a3636] block">{associatedCase?.title || "قضية مجهولة"}</span>
                      <span className="text-[10px] text-gray-400 block font-medium">المحكمة: {hearing.courtName} | القاضي: {hearing.judgeName || "غير محدد"}</span>
                      {hearing.notes && <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{hearing.notes}</p>}
                    </div>
                    <div className="flex sm:flex-col justify-between sm:justify-center items-end text-right border-t sm:border-t-0 border-gray-100 pt-2 sm:pt-0">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">{hearing.date}</span>
                      <span className="text-[10px] text-gray-400 font-mono mt-1">{hearing.time} صباحاً</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Shortcuts Panel */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
          <h3 className="text-xs font-bold text-[#1a3636] border-b border-gray-50 pb-3">روابط وإجراءات سريعة</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onNavigateTab("CLIENTS")}
              className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-right space-y-2 transition-all hover:scale-[1.01]"
            >
              <Users className="w-5 h-5 text-[#1a3636]" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-800 block">الموكلين</span>
                <span className="text-[10px] text-gray-400 block">إضافة وإدارة بيانات الخصوم والموكلين</span>
              </div>
            </button>

            <button 
              onClick={() => onNavigateTab("CASES")}
              className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-right space-y-2 transition-all hover:scale-[1.01]"
            >
              <Scale className="w-5 h-5 text-[#1a3636]" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-800 block">دفتر القضايا</span>
                <span className="text-[10px] text-gray-400 block">متابعة ملفات المنازعات والدعاوى</span>
              </div>
            </button>

            <button 
              onClick={() => onNavigateTab("PROCEDURES")}
              className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-right space-y-2 transition-all hover:scale-[1.01]"
            >
              <Clock className="w-5 h-5 text-[#1a3636]" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-800 block">سجل الإجراءات</span>
                <span className="text-[10px] text-gray-400 block">توثيق العرائض الجوابية خطوة بخطوة</span>
              </div>
            </button>

            <button 
              onClick={() => onNavigateTab("TASKS")}
              className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-right space-y-2 transition-all hover:scale-[1.01]"
            >
              <CheckSquare className="w-5 h-5 text-[#1a3636]" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-800 block">إسناد المهام</span>
                <span className="text-[10px] text-gray-400 block">إرسال واستكمال الواجبات القانونية</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
