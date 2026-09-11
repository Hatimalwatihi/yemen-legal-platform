import { apiUrl } from "../utils/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from "react";
import { 
  Building2, Scale, CalendarCheck, FolderGit2, AlertTriangle, 
  BookOpen, Search, ArrowRightLeft, FileCheck2, Users, ChevronLeft,
  BellRing, Timer, X, Sparkles, Plus, Play, Info,
  Cloud, CloudOff, RefreshCw, Lock, Database, Shield, Activity,
  WifiOff, CheckCircle2
} from "lucide-react";
import { LegalCase, LegalSession, Document } from "../types";
import { YEMENI_LAWS } from "../data/yemeniLaws";
import { convertGregorianToHijri } from "../utils/calendarUtils";
import { speakArabicText, isAudioEnabled } from "../utils/audioNotifier";

interface DashboardProps {
  cases: LegalCase[];
  sessions: LegalSession[];
  documents: Document[];
  setActiveTab: (tab: string) => void;
  setSelectedCaseId: (id: string | null) => void;
  setSelectedDocId: (id: string | null) => void;
  setQuickAiPrompt: (prompt: string) => void;
  onAddSession?: (newSession: LegalSession) => void;
  currentUser?: { username: string } | null;
  isOnline?: boolean;
  syncStatus?: "synced" | "syncing" | "error" | "offline";
  lastSyncedTime?: string | null;
  handleLogin?: (username: string, serverData: any, userObject?: any) => void;
  handleLogout?: () => void;
  onManualSync?: () => void;
  attorneyName?: string;
}

export default function Dashboard({
  cases,
  sessions,
  documents,
  setActiveTab,
  setSelectedCaseId,
  setSelectedDocId,
  setQuickAiPrompt,
  onAddSession,
  currentUser = null,
  isOnline = true,
  syncStatus = "synced",
  lastSyncedTime = null,
  handleLogin,
  handleLogout,
  onManualSync,
  attorneyName = "مكتب المحاماة"
}: DashboardProps) {
  const [selectedLawIndex, setSelectedLawIndex] = useState(0);
  const isAdmin = !currentUser || (currentUser as any).isAdmin === true;
  const [lawSearchQuery, setLawSearchQuery] = useState("");
  const [isPopupDismissed, setIsPopupDismissed] = useState(false);

  // States for Cloud accounts and sync controls
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [dashboardStorageStatus, setDashboardStorageStatus] = useState<{
    usedBytes: number;
    totalBytes: number;
    usedFormatted: string;
    totalFormatted: string;
  } | null>(null);

  const fetchDashboardStorageStatus = async () => {
    try {
      const res = await fetch(apiUrl("/api/storage/status"));
      if (res.ok) {
        const data = await res.json();
        setDashboardStorageStatus(data);
      } else {
        setDashboardStorageStatus({
          usedBytes: 0,
          totalBytes: 5 * 1024 * 1024 * 1024,
          usedFormatted: "0.00 ميجابايت",
          totalFormatted: "5 جيجابايت"
        });
      }
    } catch (err) {
      console.warn("Soft fallback for dashboard storage status:", err);
      setDashboardStorageStatus({
        usedBytes: 0,
        totalBytes: 5 * 1024 * 1024 * 1024,
        usedFormatted: "0.00 ميجابايت",
        totalFormatted: "5 جيجابايت"
      });
    }
  };

  React.useEffect(() => {
    fetchDashboardStorageStatus();
  }, [documents, currentUser]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!authUsername.trim() || !authPassword) {
      setAuthError("يرجى إدخال اسم المستخدم وكلمة المرور.");
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: authUsername.trim(),
          password: authPassword
        })
      });

      let resData: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        resData = await response.json();
      } else {
        throw new Error("سيرفر المزامنة مستغرق في بدء التشغيل أو حدث خطأ مؤقت في الاتصال. يرجى الانتظار ثانية ثم إعادة المحاولة.");
      }

      if (!response.ok) {
        throw new Error(resData.error || "فشلت العملية على سيرفر المزامنة.");
      }

      if (authMode === "login") {
        setAuthSuccess("تم تسجيل الدخول بنجاح! جاري تحميل ومزامنة البيانات العدلية...");
        if (handleLogin) {
          handleLogin(authUsername.trim(), resData.data, resData.user);
        }
        setAuthUsername("");
        setAuthPassword("");
      } else {
        setAuthSuccess("تم تأسيس حسابك بنجاح! يرجى تسجيل الدخول الآن.");
        setAuthMode("login");
        setAuthPassword("");
      }
    } catch (err: any) {
      console.error("Cloud Authentication Error:", err);
      setAuthError(err.message || "فشل الاتصال بسيرفر اسم المحامي/المكتب.");
    } finally {
      setAuthLoading(false);
    }
  };

  const activeCasesCount = cases.filter(c => c.status !== "مؤرشفة" && c.status !== "محكومة").length;
  const pendingSessions = sessions.filter(s => s.status === "مجدولة").length;
  const docsCount = documents.length;

  // Find sessions within 48 hours relative to current browser local time
  const now = new Date();
  const upcoming48HoursSessions = sessions.filter(s => {
    if (s.status !== "مجدولة") return false;
    try {
      const sDate = new Date(`${s.sessionDateGregorian}T${s.time || "09:00"}`);
      const diffMs = sDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      // Scheduled in the next 48 hours and not in the far past (allow within last 1 hour)
      return diffHours >= -1 && diffHours <= 48;
    } catch {
      return false;
    }
  });

  const getCountdownText = (sessionDateGregorian: string, sessionTimeStr: string) => {
    try {
      const target = new Date(`${sessionDateGregorian}T${sessionTimeStr || "09:00"}`);
      const diffMs = target.getTime() - now.getTime();
      if (diffMs < 0) {
        return "بدأت بالفعل أو انتهت للتو";
      }
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      
      if (hours === 0) {
        return `متبقي ${mins} دقيقة فقط! 🚨`;
      }
      if (hours < 24) {
        return `متبقي ${hours} ساعة و ${mins} دقيقة ⏳`;
      }
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      return `متبقي يوم واحد و ${remHours} ساعة ⚖️`;
    } catch {
      return "مجدولة قريبًا";
    }
  };

  // Immediate simulation of a sessions expiring within 24 hours to test Notification & Alarm sound systems
  const handleSimulateUrgentSession = () => {
    if (!onAddSession) return;
    
    // Use target case or generate reference
    const activeCase = cases[0] || { id: "case_test", title: "نزاع عقاري كبيير مستعجل بباب اليمن" };
    
    // Create a date exactly 18 hours from now
    const targetDate = new Date(Date.now() + 18 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split("T")[0];
    const timeStr = "10:00";
    
    const hijriStr = "١١ ذو الحجة ١٤٤٧ هـ"; 
    
    const simSession: LegalSession = {
      id: `sim_session_${Date.now()}`,
      caseId: activeCase.id,
      caseTitle: activeCase.title,
      sessionDateGregorian: dateStr,
      sessionDateHijri: hijriStr,
      time: timeStr,
      courtName: "مجمع محاكم أمانة العاصمة - شعبة المرافعة والطعن المباشر",
      judgeName: "القاضي يوسف الكبسي",
      status: "مجدولة" as any,
      requirements: [
        "إبداع وثائق حصر الورثة المعتمدة والعرائض المستعجلة",
        "حضور شاهدي التوثيق والتعميد العقاري"
      ],
      notes: "جلسة عاجلة ذكية تمت محاكاتها لاختبار ميزة الإنذار الـ 48 ساعة بنجاح واقتدار."
    };
    
    onAddSession(simSession);
    setIsPopupDismissed(false); // Enable popup display
    
    // Play alert audio and speak notification to simulate live voice notification
    try {
      if (isAudioEnabled()) {
        speakArabicText("تنبيه عاجل. تم جدولة جلسة محاكمة طارئة خلال ثمانية وأربعين ساعة.");
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        }
      }
    } catch (e) {
      console.warn("Audio Context blocked by browser autoplay rules.", e);
    }
  };

  // Search inside laws
  const filteredHighlights = YEMENI_LAWS[selectedLawIndex].highlights.filter(h => 
    h.title.includes(lawSearchQuery) || 
    h.content.includes(lawSearchQuery) || 
    h.articles.includes(lawSearchQuery)
  );

  const viewCase = (id: string) => {
    setSelectedCaseId(id);
    setActiveTab("cases");
  };

  const viewDoc = (id: string) => {
    setSelectedDocId(id);
    setActiveTab("documents");
  };

  const askAiQuick = (topic: string) => {
    setQuickAiPrompt(topic);
    setActiveTab("ai-advisor");
  };

  // Quick topics
  const quickQuestions = [
    { title: "مدد الاستئناف باليمن", q: "ما هي المدد والمواعيد القانونية لتقديم لائحة استئناف في القانون اليمني المدني والاستعجالي؟" },
    { title: "أركان وصحة عقد الإيجار", q: "ما هي الشروط الواجب توافرها في عقد إيجار العقارات اليمني حتى لا يثور نزاع الإخلاء؟ وزودني بمواد القانون المدني اليمني ذات العلاقة." },
    { title: "شروط كتابة الكمبيالة", q: "كيف تصاغ الكمبيالة والسند لأمر في الثقافة القضائية اليمنية وما شروط قبولها للتنفيذ المباشر؟" },
    { title: "الفسخ لعدم النفقة", q: "ما هو حكم وحقوق الزوجة في فسخ النكاح لإعسار الزوج بالنفقة المادية في قانون الأحوال الشخصية اليمني؟" }
  ];

  return (
    <div className="space-y-8" id="dashboard-container">
      
      {/* Empty State / Welcome Seed Activation Banner */}
      {cases.length === 0 && (
        <section id="watihi-professional-welcome-banner" className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden text-right animate-fade-in">
          {/* Decorative ambient elements */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative">
            <div className="space-y-2 text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-black">
                <Scale className="h-3 w-3 animate-spin-slow text-amber-500" />
                <span>المنصة العدلية لمكاتب المحاماة في الجمهورية اليمنية</span>
              </span>
              <h3 className="text-sm sm:text-base font-black text-white leading-snug">
                مكتب المحامي {attorneyName || "اسم المحامي/المكتب"}
              </h3>
              <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                نظام ذكي متكامل ومؤمن لإدارة القضايا والتقاويم وجدول الجلسات القضائية. مرحباً بك في لوحة تحكم مكتبك المخصصة. يمكنك البدء بإضافة قضية جديدة أو جلسة محاكمة لتتبع المواعيد وتلقي الإنذارات الآلية.
              </p>
            </div>
            
            <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-auto shrink-0 font-sans">
              <a
                href="https://wa.me/967771673276?text=السلام%20عليكم%20الأستاذ%20المحامي%20عبدالله%20الوتيحي"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 no-underline shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping"></span>
                <span>💬 واتساب المحامي</span>
              </a>
              <a
                href="tel:+967771673276"
                className="flex-1 md:flex-initial w-full px-4 py-2 bg-slate-900 border border-slate-800 text-amber-400 font-black rounded-xl text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 no-underline hover:bg-slate-850"
              >
                <span>📞 اتصال: 771673276</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 48-Hour Urgent Sessions Active Alerts Panel */}
      {upcoming48HoursSessions.length > 0 && !isPopupDismissed && (
        <section id="forty-eight-hour-alerts" className="relative overflow-hidden bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/20 rounded-2xl border-2 border-red-500/30 p-5 sm:p-6 shadow-xl animate-fade-in animate-pulse-subtle">
          
          {/* Ambient glowing throb point background */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-650"></span>
              </div>
              <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
                <BellRing className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">تنبيه المواعيد العدلية الوشيكة (خلال 48 ساعة القادمة)</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium">يرجى تحضير الدفوع ومراجعة النيابة المختصة ومرافقي الجلسة فوراً لتجنب فوات الميعاد القانوني.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsPopupDismissed(true)} 
              className="p-1 px-2.5 bg-slate-950/40 hover:bg-slate-950/80 rounded-lg text-slate-400 hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="إخفاء التنبيه مؤقتاً"
            >
              <span>إخفاء</span>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcoming48HoursSessions.map((session) => (
              <div 
                key={session.id}
                className="p-4 bg-slate-950/85 border border-red-500/25 hover:border-amber-400/50 rounded-xl transition-all flex flex-col justify-between gap-3 relative group"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/25 px-2 py-0.5 rounded font-extrabold flex items-center gap-1 w-max">
                      <Timer className="h-3 w-3 animate-spin text-red-500" />
                      <span>عاجل جداً</span>
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-white leading-relaxed pt-1">{session.caseTitle}</h4>
                  </div>
                </div>

                <div className="space-y-1.5 py-1 border-t border-b border-slate-800 text-[11px] text-slate-300">
                  <p className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold shrink-0">📍 المحكمة:</span>
                    <span className="truncate">{session.courtName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold shrink-0">⚖️ القاضي:</span>
                    <span>{session.judgeName || "لم يقرر ببعد"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold shrink-0">🕒 التوقيت:</span>
                    <span className="font-mono text-white tracking-widest bg-slate-900 px-1.5 py-0.5 rounded">{session.time}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-400/5 p-1 px-2 rounded-lg border border-amber-500/10 font-sans">
                    {getCountdownText(session.sessionDateGregorian, session.time)}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => viewCase(session.caseId)}
                      className="flex-1 sm:flex-none text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>ملف القضية</span>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const q = `أريد خطة مرافعة عاجلة وتحضير مستندات سريع لجلسة الغد في موضوع قضية (${session.caseTitle}) بمحكمة (${session.courtName}) أمام القاضي الموقر (${session.judgeName}). ما هي الدفوع الشرعية والمدنية اليمنية المناسبة؟`;
                        askAiQuick(q);
                      }}
                      className="flex-1 sm:flex-none text-center bg-slate-900 hover:bg-slate-850 text-amber-400 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>تدريب عاجل (الذكاء الاصطناعي)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Elite Control Bar with Simulators & Quick Navigation Indicators */}
      <section id="elite-control-bar" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 text-amber-500 rounded-xl shrink-0">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <span className="text-white font-extrabold text-xs sm:text-sm block">أدوات الفحص والتحصين العدلي الذكي ({attorneyName})</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">لوحة تحكم فورية لمكتب المحاماة ({attorneyName}) لتجربة جرس الإنذار والتنبيه الفوري للجلسات القضائية</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {onAddSession && (
            <button
              onClick={handleSimulateUrgentSession}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs py-2 px-4 rounded-xl shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 group transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-slate-950 font-bold group-hover:rotate-90 transition-transform" />
              <span>محاكاة جلسة طارئة (اختبر جرس الإنذار الـ 48 ساعة)</span>
            </button>
          )}

          {upcoming48HoursSessions.length > 0 && isPopupDismissed && (
            <button
              onClick={() => setIsPopupDismissed(false)}
              className="w-full sm:w-auto bg-slate-950 hover:bg-slate-850 text-amber-400 border border-slate-800 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
              <span>إعادة إظهار التنبيه الضوئي</span>
            </button>
          )}
        </div>
      </section>

      {/* Cloud Synchronization & Secure Account Panel */}
      {isAdmin && (
        <section id="cloud-sync-hub" className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-stone-100">
          
          {/* Left column / Info status: Connection states and actions */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 bg-amber-500/10 text-amber-600 rounded-lg text-xs font-bold font-mono">
                  مزامنة مزدوجة (متصل/أوفلاين)
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                <span className="text-[10px] font-bold text-stone-500">
                  {isOnline ? "سيرفر نشط" : "يعمل محلياً (أوفلاين)"}
                </span>
              </div>
              
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-amber-500" />
                <span>مركز المزامنة السحابية والحفظ الاحتياطي</span>
              </h3>
              
              <p className="text-xs text-stone-500 leading-relaxed text-right">
                يتيح لك هذا النظام إدارة وإبقاء قضاياك وجلساتك السحابية مطابقة تماماً. يمكنك العمل بكامل إمكانياتك حتى لو انقطع الإنترنت (Offline), حيث يقوم النظام بحفظ كل التغييرات محلياً, وبند المزامنة التلقائية يرفعها مباشرة (Online) لحظة عودتك للشبكة.
              </p>
            </div>

            {/* Connected User Area */}
            {currentUser ? (
              <div className="bg-stone-50 border border-stone-150 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-stone-500">المحامي المسجل:</span>
                  <span className="bg-slate-900 text-amber-400 font-extrabold px-3 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                    <Database className="h-3.5 w-3.5 text-amber-400" />
                    <span>{currentUser.username}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-1 text-[11px] text-stone-500 font-medium">
                  <span>حالة مزامنة الملفات:</span>
                  <span className="flex items-center gap-1">
                    {syncStatus === "syncing" && (
                      <span className="text-sky-600 font-extrabold flex items-center gap-1 animate-pulse">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        الرفع السحابي مستمر...
                      </span>
                    )}
                    {syncStatus === "synced" && (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                        <Cloud className="h-4 w-4" />
                        محفوظة ومطابقة على السيرفر
                      </span>
                    )}
                    {syncStatus === "offline" && (
                      <span className="text-stone-500 font-bold flex items-center gap-1">
                        <WifiOff className="h-4 w-4" />
                        نمط أوفلاين (كاش محلي)
                      </span>
                    )}
                    {syncStatus === "error" && (
                      <span className="text-red-600 font-extrabold flex items-center gap-1">
                        <CloudOff className="h-4 w-4" />
                        تعذر مزامنة آخر حركة
                      </span>
                    )}
                  </span>
                </div>

                {/* Cloud Storage 5GB Progress Bar */}
                <div className="pt-2.5 border-t border-stone-200/60 space-y-1.5 text-right">
                  <div className="flex justify-between items-center text-[10px] font-bold text-stone-600">
                    <span>💾 مساحة التخزين السحابية الشخصية</span>
                    <span className="text-amber-700 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono text-[9px]">
                      {dashboardStorageStatus?.usedFormatted || "0.00 ميجابايت"} / 5 جيجابايت
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: dashboardStorageStatus 
                          ? `${Math.min(100, (dashboardStorageStatus.usedBytes / dashboardStorageStatus.totalBytes) * 100)}%` 
                          : "0.01%" 
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-stone-400">
                    <span>مشفرة بالكامل بالدرجة العسكرية والعدلية</span>
                    <button 
                      onClick={() => setActiveTab("documents")}
                      className="text-amber-700 hover:underline font-extrabold flex items-center gap-0.5"
                    >
                      فتح الرفع السحابي والمرفقات ←
                    </button>
                  </div>
                </div>

                {lastSyncedTime && (
                  <div className="text-[10px] text-stone-400 text-left font-mono">
                    آخر مزامنة ناجحة للبيانات: {lastSyncedTime}
                  </div>
                )}

                <div className="flex gap-2 pt-1 flex-wrap">
                  {onManualSync && (
                    <button
                      onClick={onManualSync}
                      disabled={syncStatus === "syncing"}
                      className="flex-1 py-1.5 bg-slate-900 text-amber-400 hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-lg border border-amber-400/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm animate-fade-in"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                      <span>مزامنة يدوية الآن</span>
                    </button>
                  )}
                  {handleLogout && (
                    <button
                      onClick={handleLogout}
                      className="py-1.5 px-3 bg-stone-200 text-stone-700 hover:bg-red-105 hover:text-red-700 text-xs font-bold rounded-lg border border-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>تسجيل الخروج</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/70 border border-amber-100 text-amber-850 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <span>حساب الحماية السحابية معطل كلياً</span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed text-right">
                  بياناتك تحفظ محلياً فقط في متصفحك الحالي. في حال مسح سجل التصفح, قد تفقد السجلات. يرجى إنشاء حساب لتثبيتها وحمايتها بالسيرفر السحابي للمكتب ومطابقتها بين الأجهزة.
                </p>
                <div className="mt-1 pt-1.5 border-t border-amber-200/50 text-[10px] text-amber-800 font-bold leading-normal">
                  💡 بمجرد تأسيس حسابك أو تسجيل الدخول, ستحصل فوراً على مساحة سحابية مشفرة بسعة 5 جيجابايت لرفع وحفظ اللوائح والملفات والأدلة المصورة بأمان كامل.
                </div>
              </div>
            )}
          </div>
          
          {/* Right column: Auth dynamic widget forms */}
          <div className="md:w-1/2 p-6 flex flex-col justify-center bg-stone-50/30">
            {!currentUser ? (
              <div className="space-y-4">
                <div className="flex border-b border-stone-200">
                  <button
                    onClick={() => { setAuthMode("login"); setAuthError(""); setAuthSuccess(""); }}
                    className={`flex-1 pb-2 text-center text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                      authMode === "login"
                        ? "border-amber-500 text-slate-900"
                        : "border-transparent text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => { setAuthMode("register"); setAuthError(""); setAuthSuccess(""); }}
                    className={`flex-1 pb-2 text-center text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                      authMode === "register"
                        ? "border-amber-500 text-slate-900"
                        : "border-transparent text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    إنشاء حساب جديد
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">اسم الحساب السحابي / اسم المستخدم</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 px-3 text-xs focus:ring-1 focus:ring-amber-500 font-bold outline-none text-slate-900"
                        placeholder="مثال: alwatihi-office أو hatim36"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">كلمة المرور الأمنية للمكتب</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 px-3 text-xs focus:ring-1 focus:ring-amber-500 font-bold outline-none text-slate-900"
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-2.5 bg-red-50 px-3 border border-red-100 rounded-xl text-[11px] font-bold text-red-650 animate-fade-in flex flex-col gap-1.5 justify-start text-right">
                      <div className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-red-600 shrink-0" />
                        <span>{authError}</span>
                      </div>
                      {authError.includes("مسجل سابقاً") && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setAuthError("");
                          }}
                          className="text-right text-[10px] font-extrabold text-amber-600 hover:text-amber-850 underline underline-offset-4 cursor-pointer transition-colors self-start"
                        >
                          اضغط هنا للانتقال لتبويب "تسجيل الدخول" مباشرة
                        </button>
                      )}
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-2.5 bg-emerald-50 px-3 border border-emerald-100 rounded-xl text-[11px] font-bold text-emerald-650 animate-fade-in flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {authLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                    ) : authMode === "login" ? (
                      <Lock className="h-4 w-4 text-slate-950 font-bold" />
                    ) : (
                      <Shield className="h-4 w-4 text-slate-950 font-bold" />
                    )}
                    <span>
                      {authLoading ? "جاري الاتصال بالسيرفر..." : authMode === "login" ? "مزامنة وتسجيل الدخول سحابياً" : "تأسيس الحساب والمزامنة الفورية"}
                    </span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 animate-fade-in">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-full text-emerald-600 shadow-inner">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">سجل الاتصال بالخادم مؤمّن ومكفول</h4>
                <p className="text-[11px] text-stone-500 max-w-xs leading-relaxed">
                  أي قضايا جديدة أو تعديل على جدول جلسات المحكمة أو صياغة عقود سيتم رفعها تلقائياً وبشكل مشفر لحفظها في حسابك السحابي الاحتياطي بسيرفر اسم المحامي/المكتب. يمكنك تسجيل الدخول من جهاز آخر واستردادها في أي وقت!
                </p>
              </div>
            )}
          </div>
          
        </section>
      )}
      
      {/* Overview Cards Grid */}
      <section id="stats-dashboard" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Active Cases Card */}
        <div 
          onClick={() => setActiveTab("cases")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold">القضايا الجارية</span>
            <p className="text-3xl font-bold text-white font-mono">{activeCasesCount}</p>
            <span className="text-amber-400 text-xs flex items-center gap-1 group-hover:underline">
              <span>تصفح القضايا</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
            <Scale className="h-6 w-6" />
          </div>
        </div>

        {/* Sessions Card */}
        <div 
          onClick={() => setActiveTab("sessions")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold">الجلسات المجدولة</span>
            <p className="text-3xl font-bold text-white font-mono">{pendingSessions}</p>
            <span className="text-emerald-400 text-xs flex items-center gap-1 group-hover:underline">
              <span>سجل الجلسات</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Documents Card */}
        <div 
          onClick={() => setActiveTab("documents")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold">وثائق ومذكرات معتمدة</span>
            <p className="text-3xl font-bold text-white font-mono">{docsCount}</p>
            <span className="text-blue-400 text-xs flex items-center gap-1 group-hover:underline">
              <span>محرر الوثائق</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
            <FolderGit2 className="h-6 w-6" />
          </div>
        </div>

        {/* Yemen Law library shortcut indicator */}
        <div 
          onClick={() => {
            const el = document.getElementById("yemen-laws-section");
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-semibold">مكتبة التشريع اليمني</span>
            <p className="text-xl font-bold text-white">5 قوانين كبرى</p>
            <span className="text-violet-400 text-xs flex items-center gap-1 group-hover:underline">
              <span>تصفح المواد</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl text-violet-500 group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

      </section>

      {/* Main Grid: Urgent Hearings & AI Consult Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Right side: Quick AI Consultation Assist */}
        <section id="quick-ai-consult" className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">المستشار اليمني الفوري للحقوق والطلبات</h2>
            </div>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              بصفتك بمكتب مكتب المحاماة والاستشارات القانونية، يمكنك التشاور بشكل فوري مع المساعد الذكي حول أي مسألة قضائية، صياغة عرائض الدعوى أو التحقق من المواعيد التنظيمية بدقة مذهلة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => askAiQuick(q.q)}
                  className="p-3 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-stone-700 text-right text-xs rounded-xl font-medium transition-all duration-300 group flex justify-between items-start gap-1"
                >
                  <span>{q.title}</span>
                  <ChevronLeft className="h-4 w-4 text-stone-400 group-hover:text-amber-500 transition-colors shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-semibold text-sm">استشارة قانونية مخصصة وعميقة؟</h4>
              <p className="text-xs text-slate-400 mt-1">تفوق في صياغة دفاعك واكشف ثغرات القوانين بنقرة واحدة</p>
            </div>
            <button
              onClick={() => askAiQuick("")}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>فتح شاشة المستشار</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Left side: Urgent Schedule Sessions (Gregorian-Hijri Hybrid) */}
        <section id="urgent-schedule" className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-amber-500" />
              <span>الجلسات القادمة العاجلة</span>
            </h2>
            <button 
              onClick={() => setActiveTab("sessions")}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
            {sessions.filter(s => s.status === "مجدولة").length === 0 ? (
              <div className="text-center py-10">
                <FileCheck2 className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-500">لا توجد جلسات مجدولة بانتظار الانعقاد حالياً.</p>
              </div>
            ) : (
              sessions
                .filter(s => s.status === "مجدولة")
                .slice(0, 4)
                .map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => viewCase(session.caseId)}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between gap-1"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-900">{session.caseTitle}</span>
                      <span className="text-[10px] bg-amber-400/20 text-slate-800 px-2 py-0.5 rounded-full font-semibold">
                        {session.time}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 line-clamp-1">
                      📍 {session.courtName} • القاضي: {session.judgeName}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-amber-600 mt-1 font-mono pt-1 border-t border-stone-100">
                      <span>ميلادي: {session.sessionDateGregorian}</span>
                      <span>هجري: {session.sessionDateHijri}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

      </div>

    </div>
  );
}
