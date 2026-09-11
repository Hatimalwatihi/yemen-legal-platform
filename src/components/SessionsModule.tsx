/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CalendarCheck, Plus, Check, Clock, MapPin, Scale, User, 
  Tag, ListTodo, FileText, ChevronRight, Edit3, Trash2, HelpCircle 
} from "lucide-react";
import { LegalSession, LegalCase, SessionStatus } from "../types";
import { convertGregorianToHijri } from "../utils/calendarUtils";

interface SessionsModuleProps {
  sessions: LegalSession[];
  cases: LegalCase[];
  onAddSession: (s: LegalSession) => void;
  onUpdateSession: (s: LegalSession) => void;
  onDeleteSession: (id: string) => void;
}

export default function SessionsModule({
  sessions,
  cases,
  onAddSession,
  onUpdateSession,
  onDeleteSession
}: SessionsModuleProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Form states
  const [caseId, setCaseId] = useState("");
  const [sessionDateGregorian, setSessionDateGregorian] = useState("");
  const [sessionDateHijri, setSessionDateHijri] = useState("");
  const [time, setTime] = useState("09:00");
  const [courtName, setCourtName] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.SCHEDULED);
  const [requirementsString, setRequirementsString] = useState("");
  const [notes, setNotes] = useState("");
  const [decisions, setDecisions] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  
  // Custom states for Lawyer Attendance & Substitutions
  const [attendingLawyerType, setAttendingLawyerType] = useState<"original" | "deputy" | "absent">("original");
  const [deputyName, setDeputyName] = useState("");

  const handleDateChange = (gregDate: string) => {
    setSessionDateGregorian(gregDate);
    if (gregDate) {
      const hijri = convertGregorianToHijri(gregDate);
      setSessionDateHijri(hijri);
    } else {
      setSessionDateHijri("");
    }
  };

  const handleEditClick = (s: LegalSession) => {
    setCaseId(s.caseId);
    setSessionDateGregorian(s.sessionDateGregorian);
    setSessionDateHijri(s.sessionDateHijri);
    setTime(s.time);
    setCourtName(s.courtName);
    setJudgeName(s.judgeName);
    setStatus(s.status);
    setRequirementsString(s.requirements.join("\n"));
    setNotes(s.notes);
    setDecisions(s.decisions || "");
    setNextSteps(s.nextSteps || "");
    
    // Set custom attendance states
    setAttendingLawyerType(s.attendingLawyerType || "original");
    setDeputyName(s.deputyName || "");
    
    setEditingSessionId(s.id);
    setIsAddingNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !sessionDateGregorian || !courtName) return;

    const matchedCase = cases.find(c => c.id === caseId);
    const caseTitle = matchedCase ? matchedCase.title : "قضية عامة";

    const requirements = requirementsString
      .split("\n")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (editingSessionId) {
      const updated: LegalSession = {
        id: editingSessionId,
        caseId,
        caseTitle,
        sessionDateGregorian,
        sessionDateHijri: sessionDateHijri || convertGregorianToHijri(sessionDateGregorian),
        time,
        courtName,
        judgeName,
        status,
        requirements,
        notes,
        decisions,
        nextSteps,
        attendingLawyerType,
        deputyName: attendingLawyerType === "deputy" ? deputyName.trim() : ""
      };
      onUpdateSession(updated);
      setEditingSessionId(null);
      setIsAddingNew(false);
    } else {
      const newSession: LegalSession = {
        id: "session_" + Date.now(),
        caseId,
        caseTitle,
        sessionDateGregorian,
        sessionDateHijri: sessionDateHijri || convertGregorianToHijri(sessionDateGregorian),
        time,
        courtName,
        judgeName,
        status,
        requirements,
        notes,
        decisions,
        nextSteps,
        attendingLawyerType,
        deputyName: attendingLawyerType === "deputy" ? deputyName.trim() : ""
      };
      onAddSession(newSession);
      setIsAddingNew(false);
    }

    // Reset Form
    setCaseId("");
    setSessionDateGregorian("");
    setSessionDateHijri("");
    setTime("09:00");
    setCourtName("");
    setJudgeName("");
    setStatus(SessionStatus.SCHEDULED);
    setRequirementsString("");
    setNotes("");
    setDecisions("");
    setNextSteps("");
    setAttendingLawyerType("original");
    setDeputyName("");
  };

  const startNewSessionCreation = () => {
    setCaseId(cases.length > 0 ? cases[0].id : "");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    handleDateChange(tomorrowStr);
    setTime("09:00");
    setCourtName("");
    setJudgeName("");
    setStatus(SessionStatus.SCHEDULED);
    setRequirementsString("");
    setNotes("");
    setDecisions("");
    setNextSteps("");
    setAttendingLawyerType("original");
    setDeputyName("");
    
    setIsAddingNew(true);
    setEditingSessionId(null);
  };

  return (
    <div className="space-y-6" id="sessions-module-root">
      
      {/* Header section with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl border-b border-amber-500 shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-amber-500" />
            <span>إدارة وضبط جلسات المحاكم اليمنية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            جدولة الجلسات القضائية بالتواريخ الميلادية وتلقائياً تحديد التاريخ الهجري المعتمد لسهولة المطابقة والمتابعة.
          </p>
        </div>
        
        <button
          onClick={startNewSessionCreation}
          className="w-full sm:w-auto p-2 px-4 bg-slate-800 border border-amber-500 text-amber-400 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>جدولة جلسة جديدة</span>
        </button>
      </div>

      {/* Render Grid of Scheduled hearings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
              <CalendarCheck className="h-12 w-12 text-stone-300 mx-auto mb-3" />
              <p className="font-extrabold text-sm text-slate-800">لا توجد أي جلسات قضائية مجدولة حتى الآن</p>
              <p className="text-xs text-stone-400 mt-2">انقر على زر "جدولة جلسة جديدة" للحصول على جدول متزامن ومطابق للتقويمين العربي والفرنجي.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const connectedCase = cases.find(c => c.id === session.caseId);
              let statusColorClass = "bg-stone-100 text-stone-800";
              if (session.status === "تم حضورها") statusColorClass = "bg-emerald-100 text-emerald-800 font-semibold";
              if (session.status === "مجدولة") statusColorClass = "bg-blue-100 text-blue-800 font-semibold";
              if (session.status === "مؤجلة") statusColorClass = "bg-orange-100 text-orange-850 font-semibold";
              if (session.status === "جلسة النطق بالحكم") statusColorClass = "bg-red-100 text-red-800 font-bold";

              return (
                <div 
                  key={session.id}
                  className="bg-white border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    
                    {/* Upper Bar: Title, Case info & status */}
                    <div className="flex justify-between items-start gap-2 border-b border-stone-150 pb-2.5">
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-stone-400 font-semibold font-mono">
                          ملف: {connectedCase ? connectedCase.caseNumber : "مرمّز خارجي"}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 mt-0.5 line-clamp-1">{session.caseTitle}</h4>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full shrink-0 ${statusColorClass}`}>
                        {session.status}
                      </span>
                    </div>

                    {/* Schedule detail and calendars dual highlights */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-150 space-y-2">
                      <div className="flex items-center text-xs text-slate-900 gap-2">
                        <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="font-bold">{session.time} صباحاً</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-stone-600 border-t border-stone-200/60 pt-2 font-semibold">
                        <div className="flex justify-between">
                          <span>📅 التاريخ الميلادي:</span>
                          <span className="font-mono text-stone-800">{session.sessionDateGregorian}</span>
                        </div>
                        <div className="flex justify-between text-amber-700">
                          <span>🌙 التاريخ الهجري:</span>
                          <span>{session.sessionDateHijri}</span>
                        </div>
                      </div>
                    </div>

                    {/* Venue coordinates and judges */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
                        <span className="line-clamp-1">{session.courtName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700 pb-2">
                        <User className="h-4 w-4 text-stone-400 shrink-0" />
                        <span>طلب الهيئة القضائية: {session.judgeName || "لم يفرز"}</span>
                      </div>
                    </div>

                    {/* Attendance/Substitution indicator on Card */}
                    <div className="border-t border-b border-stone-100 py-2.5 my-1 text-xs">
                      {session.attendingLawyerType === "deputy" ? (
                        <div className="flex flex-col gap-1.5 p-2 bg-amber-500/[0.04] rounded-xl border border-amber-500/10 text-right">
                          <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider">🤝 حضور بالنيابة عن الأصيل</span>
                          <span className="font-extrabold text-slate-950 text-[11px] flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>النائب الحاضر: <strong className="text-amber-700">{session.deputyName || "غير محددالاسم"}</strong></span>
                          </span>
                        </div>
                      ) : session.attendingLawyerType === "absent" ? (
                        <div className="flex flex-col gap-1 p-2 bg-red-500/[0.04] rounded-xl border border-red-550/10 text-red-700 font-extrabold text-[11px] text-right">
                          <span className="flex items-center gap-1.5 text-red-600">
                            <span className="h-2 w-2 rounded-full bg-red-650 animate-pulse"></span>
                            <span>⚠️ غبت عن الجلسة (حالة غياب بالكامل)</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 p-2 bg-emerald-500/[0.04] rounded-xl border border-emerald-500/10 text-emerald-800 font-bold text-[11px] text-right">
                          <span className="flex items-center gap-1.5 text-emerald-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span>✓ حضور الأصيل (المحامي نفسه)</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Requirements and custom todo highlights */}
                    {session.requirements.length > 0 && (
                      <div className="space-y-1.5 border-t border-stone-100 pt-3">
                        <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 text-amber-500" />
                          <span>تحضيرات الجلسة العاجلة</span>
                        </span>
                        <ul className="space-y-1 text-stone-600 text-[11px] pr-4 list-disc pl-1">
                          {session.requirements.map((req, rid) => (
                            <li key={rid} className="leading-tight">{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Courtroom outcome summary */}
                    {session.notes && (
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-150 text-[11px] leading-relaxed">
                        <span className="font-bold text-slate-950 block mb-1 border-r-2 border-slate-500 pr-1.5">مجريات وسير الجلسة:</span>
                        <p className="whitespace-pre-line text-slate-800">{session.notes}</p>
                      </div>
                    )}

                    {session.decisions && (
                      <div className="p-3 bg-amber-400/5 border border-amber-500/20 rounded-xl text-[11px] leading-relaxed">
                        <span className="font-bold text-amber-600 block mb-1 flex items-center gap-1 border-r-2 border-amber-500 pr-1.5">
                          <Scale className="h-3 w-3 text-amber-500 shrink-0" />
                          <span>القرارات أو الأوامر والطلب الصادر:</span>
                        </span>
                        <p className="whitespace-pre-line font-medium text-slate-800">{session.decisions}</p>
                      </div>
                    )}

                    {session.nextSteps && (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-[11px] leading-relaxed">
                        <span className="font-bold text-emerald-600 block mb-1 flex items-center gap-1 border-r-2 border-emerald-500 pr-1.5">
                          <ListTodo className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span>الخطوات التالية للوكيل:</span>
                        </span>
                        <p className="whitespace-pre-line text-slate-800">{session.nextSteps}</p>
                      </div>
                    )}

                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-2.5 pt-4 border-t border-stone-100 mt-5">
                    <button
                      onClick={() => handleEditClick(session)}
                      className="flex-1 bg-slate-900 border border-slate-950 text-white hover:text-amber-400 text-xs py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("هل تريد بالتأكيد إلغاء جدولة هذه الجلسة من ملفات المكتب؟")) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-650 p-2 rounded-lg transition-colors border border-red-200"
                      title="حذف الجلسة"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      {/* ADD/EDIT SESSION MODAL OVERLAY */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <form 
            onSubmit={handleSave} 
            className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[82vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-scale-up text-right"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 rounded-t-3xl border-b border-amber-500 flex justify-between items-center shrink-0">
              <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-amber-400" />
                <span>{editingSessionId ? "تعديل تفاصيل الجلسة القضائية" : "جدولة وضبط لقاء أو جلسة مرافعة"}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs bg-slate-800 hover:bg-slate-750 text-stone-300 py-1.5 px-3 rounded-xl transition-all cursor-pointer font-bold"
              >
                إلغاء وإغلاق
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-right min-h-0 overscroll-contain touch-pan-y">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">القضية المرتبطة بالجلسة *</label>
                    <select
                      required
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-bold text-slate-900"
                    >
                      <option value="">-- اختر ملف القضية --</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>
                          [{c.caseNumber}] {c.title} ({c.clientName})
                        </option>
                      ))}
                    </select>
                    {cases.length === 0 && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">🔒 تنبيه: يجب إضافة قضية أولاً لتتمكن من ربط جلسة بها!</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">حالة حضور الجلسة</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SessionStatus)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    >
                      {Object.values(SessionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Lawyer Attendance & Deputy Selection */}
                  <div className="space-y-1.5 p-3.5 bg-amber-500/[0.04] rounded-2xl border border-amber-500/10 col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-amber-900">الحضور والتمثيل القانوني بالجلسة</label>
                      <select
                        value={attendingLawyerType}
                        onChange={(e) => setAttendingLawyerType(e.target.value as any)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold text-slate-900"
                      >
                        <option value="original">👤 حضور الأصيل (المحامي نفسه)</option>
                        <option value="deputy">🤝 حضور بالنيابة (تكليف زميل/محامي نائب)</option>
                        <option value="absent">⚠️ غياب تام عن الجلسة (لم يحضر أحد)</option>
                      </select>
                    </div>

                    {attendingLawyerType === "deputy" ? (
                      <div className="space-y-1.5 animate-fade-in">
                        <label className="font-bold text-amber-900">اسم النائب/الزميل المكلف بالحضور *</label>
                        <input
                          type="text"
                          required={attendingLawyerType === "deputy"}
                          placeholder="مثال: المحامي عبدالرحمن الوشلي"
                          value={deputyName}
                          onChange={(e) => setDeputyName(e.target.value)}
                          className="w-full bg-white border border-stone-300 text-slate-950 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-[11px] text-stone-500 pt-5">
                        {attendingLawyerType === "original" ? (
                          <span className="text-emerald-700 font-bold">✓ الأصيل يثبت حضور المرافعة شخصياً أمام هيئة المحكمة.</span>
                        ) : (
                          <span className="text-red-650 font-black">⚠️ غياب كلي عن موعد الجلسة دون توكيل بديل. قد يترتب على مصلحة الموكل شطب القضية!</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Gregorian Date selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700 text-slate-900 flex items-center gap-1">
                      <span>التاريخ الميلادي المعلن *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={sessionDateGregorian}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-left font-semibold"
                    />
                  </div>

                  {/* Automatic Hijri conversion review */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-amber-700 flex items-center gap-1">
                      <span>التاريخ الهجري المقابل (تلقائي لمطابقة تقاويم اليمن)</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={sessionDateHijri}
                      placeholder="لم يتم إدخال تاريخ ميلادي بعد"
                      className="w-full bg-amber-50/50 text-slate-800 border border-amber-300 rounded-xl p-2.5 outline-none font-bold text-right"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">ساعة انعقاد الجلسة بالمحكمة</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-left font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">القاضي ناظر الجلسة</label>
                    <input
                      type="text"
                      placeholder="مثال: فضيلة القاضي السامعي"
                      value={judgeName}
                      onChange={(e) => setJudgeName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">المحكمة ومقر الانعقاد بالتفصيل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محكمة غرب الأمانة - الدور الثاني - قاعة رقم 3"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 text-emerald-700">الطلبات والدفوع المطلوب تحضيرها تقديمها بالجلسة (كل طلب في سطر)</label>
                  <textarea
                    rows={3}
                    placeholder="مثال:&#10;تقديم أصل عقد الإيجار للمطابقة&#10;إيداع الرد المكتوب على الدفع بالتقادم&#10;طلب حلف اليمين الشرعية للخصم"
                    value={requirementsString}
                    onChange={(e) => setRequirementsString(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">ملاحظات ومجريات الجلسة (سير الجلسة)</label>
                  <textarea
                    rows={2}
                    placeholder="بيّن هنا ما دار بالجلسة بالتفصيل وسير المرافعة..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-950 flex items-center gap-1">
                      <Scale className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>القرارات أو الأوامر الصادرة</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="القرارات الوجوبية أو التمهيدية الصادرة عن منصة القضاء..."
                      value={decisions}
                      onChange={(e) => setDecisions(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-emerald-950 flex items-center gap-1">
                      <ListTodo className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>الخطوات التالية المطلوبة للوكيل</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="ما هي الإجراءات الواجب اتخاذها والعرائض المطلوب تقديمها للاستحقاق..."
                      value={nextSteps}
                      onChange={(e) => setNextSteps(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-stone-50 border-t border-stone-150 p-4 rounded-b-3xl flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-750 font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                >
                  إلغاء وإغلاق
                </button>
                <button
                  type="submit"
                  disabled={cases.length === 0}
                  className={`px-6 py-2.5 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer border ${
                    cases.length === 0 
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed border-stone-300" 
                    : "bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-500"
                  }`}
                >
                  {editingSessionId ? "حفظ التعديلات والتثبيت" : "جدولة الجلسة بالملفات"}
                </button>
              </div>
          </form>
        </div>
      )}

    </div>
  );
}
