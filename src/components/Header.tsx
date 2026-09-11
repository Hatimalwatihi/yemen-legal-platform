/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Scale, Calendar, Clock, Bell, X, Volume2, ShieldAlert, 
  Sparkles, Phone, Mail, User, CheckCircle2, Award, HeartHandshake,
  Cloud, CloudOff, RefreshCw, Wifi, WifiOff, LogOut, Database, MessageSquare
} from "lucide-react";
import { convertGregorianToHijri } from "../utils/calendarUtils";
import { LegalSession, LegalCase } from "../types";
import { speakArabicText, isAudioEnabled } from "../utils/audioNotifier";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sessions?: LegalSession[];
  cases?: LegalCase[];
  currentUser?: { username: string } | null;
  isOnline?: boolean;
  syncStatus?: "synced" | "syncing" | "error" | "offline";
  lastSyncedTime?: string | null;
  handleLogout?: () => void;
  attorneyName?: string;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  sessions = [], 
  cases = [], 
  currentUser = null,
  isOnline = true,
  syncStatus = "synced",
  lastSyncedTime = null,
  handleLogout,
  attorneyName = "الوتيحي للمحاماة"
}: HeaderProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [simulatedAlertBanner, setSimulatedAlertBanner] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const gregorianStr = currentDate.toISOString().split("T")[0];
  const hijriStr = convertGregorianToHijri(gregorianStr);

  const navItems = [
    { id: "dashboard", label: "الرئيسية والمؤشرات" },
    { id: "cases", label: "إدارة القضايا" },
    { id: "sessions", label: "جدول الجلسات" },
    { id: "calendar", label: "التقاويم المزدوجة" },
    { id: "documents", label: "محرر الوثائق والمستندات" },
    { id: "templates", label: "📋 نماذج الوثائق (654)" },
    { id: "promo-hub", label: "📢 مركز الترويج والإعلانات" },
    { id: "ai-advisor", label: "المستشار اليمني الذكي" },
    { id: "notarizations", label: "التوثيقات" },
    { id: "archive", label: "🗄️ الأرشيف العدلي" },
    { id: "recycle-bin", label: "🗑️ سلة المحذوفات" },
    { id: "settings", label: "⚙️ الإعدادات والمظهر" },
  ];

  // Sound generator using Web Audio API for a crisp, high-end legal alert chime
  const playCriticalBeep = () => {
    try {
      if (!isAudioEnabled()) {
        return;
      }
      setIsPlayingSound(true);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtx) {
        setIsPlayingSound(false);
        return;
      }
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // Notes A5
      gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.3);

      setTimeout(() => {
        try {
          if (audioCtx && audioCtx.state !== 'closed') {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(1109.73, audioCtx.currentTime); // C#6
            gain2.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.4);
          }
        } catch (innerError) {
          console.error("Inner Audio error:", innerError);
        } finally {
          setTimeout(() => setIsPlayingSound(false), 450);
        }
      }, 150);
    } catch (e) {
      console.error("Audio API not allowed or supported on this browser.", e);
      setIsPlayingSound(false);
    }
  };

  const handleTestAlert = () => {
    playCriticalBeep();
    speakArabicText("تنبيه فوري. تم فحص واختبار صفارات الإنذار لجدولة المحامي بنجاح.");
    setSimulatedAlertBanner("🔊 تنبيه فوري: تم فحص واختبار صفارات الإنذار لجدولة المحامي بنجاح!");
    setTimeout(() => setSimulatedAlertBanner(null), 5000);
  };

  // Dynamic system warnings
  const getAlertList = () => {
    const alerts: { id: string; title: string; desc: string; time?: string; type: "critical" | "warning" | "info" }[] = [];
    
    // Filter scheduled sessions
    const scheduled = sessions.filter(s => s.status === "مجدولة");
    scheduled.forEach(s => {
      alerts.push({
        id: `session-alert-${s.id}`,
        title: `جلسة قادمة: ${s.caseTitle}`,
        desc: `📍 ${s.courtName} • الساعة ${s.time} • القاضي: ${s.judgeName || "لم يعين"}`,
        time: s.sessionDateHijri,
        type: "critical"
      });
      
      if (s.requirements && s.requirements.length > 0) {
        alerts.push({
          id: `req-alert-${s.id}`,
          title: `متطلبات عاجلة لجلسة: ${s.caseTitle}`,
          desc: `تحضير مستندات: ${s.requirements.join(" | ")}`,
          time: `القاضي: ${s.judgeName || "المحكمة المختصة"}`,
          type: "warning"
        });
      }
    });

    // Add general alerts for active cases
    const activeCases = cases.filter(c => c.status === "نشطة (قيد النظر)");
    activeCases.forEach((c, idx) => {
      if (idx < 2) { // limit noise
        alerts.push({
          id: `case-alert-${c.id}`,
          title: `متابعة الجلسة لـ [${c.caseNumber}]`,
          desc: `الموكل: ${c.clientName} (موقف: ${c.clientRole}) ضد الخصم: ${c.opponentName}`,
          time: `تاريخ البدء: ${c.startDate}`,
          type: "info"
        });
      }
    });

    // Add default welcome alert
    alerts.push({
      id: "design-wel",
      title: "نظام حاتم الوتيحي الحصين",
      desc: "تم تفعيل التنبيهات وإشارات المزامنة التلقائية لجدول الجلسات وحساب فروقات القوانين اليمنية.",
      time: "جاهز الآن",
      type: "info"
    });

    return alerts;
  };

  const activeAlerts = getAlertList();
  const criticalCount = activeAlerts.filter(a => a.type === "critical").length;

  return (
    <header id="app-header" className="bg-slate-900 text-white border-b-2 border-amber-500 shadow-md relative">
      
      {/* Visual Simulated Push Banner if triggered */}
      {simulatedAlertBanner && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 px-4 py-3 text-center text-xs font-bold transition-all shadow-lg animate-bounce flex items-center justify-center gap-2 z-50">
          <Sparkles className="h-4 w-4 text-slate-950 animate-spin" />
          <span>{simulatedAlertBanner}</span>
          <button onClick={() => setSimulatedAlertBanner(null)} className="mr-4 bg-slate-950/20 hover:bg-slate-950/40 p-1 rounded-full">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Top Bar with Title, Dynamic Alarms Alert, and Real-time Dual Calendar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/10 shrink-0">
            <Scale className="h-8 w-8 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 sm:gap-2 font-sans">
              <span>المنصة العدلية لمكاتب المحاماة</span>
              <span className="text-amber-400 font-extrabold text-2xl hidden sm:inline">|</span>
              <span className="text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg text-lg sm:text-xl font-extrabold font-mono">في الجمهورية اليمنية</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-1.5">
              <span className="text-[10px] sm:text-xs text-slate-400">مكتب المحامي {attorneyName} - نظام ذكي متكامل ومؤمن لإدارة القضايا والتقاويم وجدول الجلسات</span>
              <span className="text-slate-700 font-extrabold text-xs hidden sm:inline">|</span>
              <a 
                href="tel:+967771673276" 
                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full transition-all duration-300 shrink-0"
                title="اتصال مباشر بالمحامي"
              >
                <Phone className="h-3 w-3 inline text-slate-950" />
                <span>اتصال: 771673276</span>
              </a>
              <a 
                href="https://wa.me/967771673276" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full transition-all duration-300 shrink-0"
                title="مراسلة واتساب فورية"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                <span>واتساب المحامي</span>
              </a>

              {/* Cloud Synchronization and Account Status Indicators */}
              <div className="flex items-center gap-1.5 shrink-0 select-none">
                <span className="text-slate-800 text-[10px] font-bold">|</span>
                
                {currentUser ? (
                  <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs">
                    <Database className="h-3 w-3 text-amber-500" />
                    <span className="text-amber-400 font-extrabold">{currentUser.username}</span>
                    
                    {syncStatus === "syncing" && (
                      <span className="flex items-center gap-1 text-sky-400">
                        <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                        <span className="hidden leading-none md:inline">جاري المزامنة...</span>
                      </span>
                    )}

                    {syncStatus === "synced" && (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold" title={lastSyncedTime ? `آخر مزامنة: ${lastSyncedTime}` : "البيانات متطابقة مع السيرفر"}>
                        <Cloud className="h-3 w-3" />
                        <span className="hidden md:inline">مزامنة سحابية نشطة</span>
                      </span>
                    )}

                    {syncStatus === "offline" && (
                      <span className="flex items-center gap-1 text-stone-400" title="أنت خارج نطاق الاتصال بالشبكة حالياً">
                        <WifiOff className="h-3 w-3" />
                        <span className="hidden md:inline">يعمل محلياً (أوفلاين)</span>
                      </span>
                    )}

                    {syncStatus === "error" && (
                      <span className="flex items-center gap-1 text-red-500 font-bold" title="فشلت مزامنة البيانات الأخيرة مع السيرفر">
                        <CloudOff className="h-3 w-3" />
                        <span className="hidden md:inline">خطأ في السيرفر</span>
                      </span>
                    )}

                    {handleLogout && (
                      <button 
                        onClick={handleLogout}
                        className="mr-2 p-0.5 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                        title="تسجيل خروج الحساب وسحب الحفظ السحابي"
                      >
                        <LogOut className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 text-slate-400 px-2.5 py-1 rounded-full text-[10px] sm:text-xs">
                    {isOnline ? <Wifi className="h-3 w-3 text-emerald-500 animate-pulse" /> : <WifiOff className="h-3 w-3 text-stone-500" />}
                    <span>تنشيط محلي مؤقت (تجريبي)</span>
                    <button
                      onClick={() => {
                        if (window.confirm("⚠️ تنبيه أمني للسيادة:\n\nهل أنت متأكد من رغبتك في حذف وحظر جلسة التفعيل بالكامل فوراً؟ سيتم محو جميع القضايا والبيانات من المتصفح ولن يتمكن أي شخص من تصفح النظام محلياً مجدداً بدون إذنك وإدخال رمز التفعيل الخاص بك.")) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="mr-1.5 px-2 py-0.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded font-black text-[9px] transition-all cursor-pointer shadow-md inline-flex items-center gap-1 border border-red-750"
                      title="اضغط لحظر الدخول المحلي وحذف كافة القضايا والبيانات فوراً"
                    >
                      <span>🔒 إنهاء التجربة وقفل الرصيد</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alarm Bell Button & Dual Calendar Display */}
        <div className="flex items-center gap-3 self-stretch md:self-center justify-between sm:justify-end bg-slate-950/60 p-2 sm:p-3 rounded-xl border border-slate-800">
          
          {/* Smart Notifications Bell Trigger */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            id="notification-bell-btn"
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer group"
            title="جرس التنبيهات وجدول الجلسات"
          >
            <Bell className={`h-5 w-5 ${criticalCount > 0 ? "animate-swing origin-top" : "group-hover:scale-110"}`} />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-650 text-[10px] font-extrabold text-white animate-pulse">
                {criticalCount}
              </span>
            )}
          </button>

          <div className="text-slate-700 font-bold text-lg">|</div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 text-right">
            <div className="flex items-center gap-2 text-amber-400 text-[10px] sm:text-xs font-mono font-semibold">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span>التقويم الهجري:</span>
              <span className="text-white font-sans">{hijriStr}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] sm:text-xs font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>الميلادي:</span>
              <span className="text-white">{gregorianStr}</span>
            </div>
          </div>

        </div>

      </div>



      {/* Sliding Notification & Alert Drawer (World-Class Desktop & Mobile Experience) */}
      {showNotifications && (
        <div id="alert-drawer-panel" className="absolute left-4 top-20 sm:left-12 w-full max-w-[360px] sm:max-w-md bg-stone-50 border border-stone-200 shadow-2xl rounded-2xl p-4 sm:p-5 z-50 animate-fade-in text-slate-900 font-sans text-xs">
          
          {/* Drawer Title Block */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-950">لوحة التنبيهات والتحصين العدلي الذكي</span>
            </div>
            <button 
              onClick={() => setShowNotifications(false)}
              className="p-1 text-stone-400 hover:text-slate-900 bg-stone-100 rounded-lg hover:bg-stone-200 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Real Auditory Test Alarm (Satisfies user request for notifications & alerts) */}
          <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 mb-4 flex items-center justify-between gap-2.5">
            <div>
              <p className="font-bold text-[11px] text-amber-400 flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>نظام التنبيهات المسموعة والاهتزاز</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">اختبار فوري لصفارات الإنذار ونغمات التنبيه والاتصال لتأكيد جاهزية جوالك.</p>
            </div>
            <button
              onClick={handleTestAlert}
              className={`p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-extrabold flex items-center justify-center gap-1 transition-all shrink-0 cursor-pointer ${isPlayingSound ? "animate-ping" : ""}`}
              disabled={isPlayingSound}
            >
              <span>رنين فوري</span>
            </button>
          </div>

          {/* Warnings List Stream */}
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto mb-4 pr-1">
            <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest border-r-2 border-slate-300 pr-1.5 mb-1.5">التنبيهات النشطة حالياً:</p>
            
            {activeAlerts.length === 0 ? (
              <div className="text-center py-6 text-stone-500">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="font-bold text-[11px] text-slate-800">لا توجد تنبيهات استعجالية نشطة</p>
                <p className="text-[10px] text-stone-400 mt-0.5">جدولك مصان وخالٍ من المواعيد المتعثرة.</p>
              </div>
            ) : (
              activeAlerts.map((alert, idx) => {
                let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
                if (alert.type === "critical") badgeColor = "bg-red-50 text-red-750 border-red-200";
                if (alert.type === "warning") badgeColor = "bg-amber-50 text-amber-850 border-amber-200";

                return (
                  <div key={idx} className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${badgeColor}`}>
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-[11px] leading-tight flex items-center gap-1">
                        {alert.type === "critical" && <span className="h-1.5 w-1.5 rounded-full bg-red-650 animate-ping"></span>}
                        {alert.title}
                      </span>
                      {alert.time && (
                        <span className="text-[9px] bg-slate-950/5 text-slate-900 px-1.5 py-0.5 rounded font-bold">{alert.time}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-850 leading-relaxed font-sans">{alert.desc}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Elite Creator / Designer Profile Corner (Fulfills Hatem Al-Watihi details completely as premium credit) */}
          <div className="border-t border-stone-200 pt-3 mt-3 bg-amber-400/5 p-3 rounded-xl border border-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-lg shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="font-extrabold text-[11px] text-slate-900 block leading-tight">واجهة صُممت من قبل:</span>
                <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-1">
                  <span>المصمم حاتم الوتيحي</span>
                  <Sparkles className="h-3 w-3" />
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-700 leading-normal mb-2 border-r-2 border-amber-300 pr-1.5 bg-white/70 p-2 rounded-lg">
              "لقد حظي تطبيق المحامي القدير {attorneyName} بأفخم تصميم عدلي تفاعلي متزامن للموبايل والأجهزة اللوحية لمنافسة ألمع النظم الحقوقية بالمشرق العربي."
            </p>

            <div className="grid grid-cols-1 gap-1.5 text-[9px] text-stone-600 font-mono">
              <a href="tel:771673276" className="flex items-center gap-1 p-1 bg-stone-100 hover:bg-stone-200 rounded text-slate-900 hover:text-amber-500 transition-colors">
                <Phone className="h-3 w-3 text-stone-500 shrink-0" />
                <span>+967 771673276 (اتصال)</span>
              </a>
              <a href="https://wa.me/967771673276" target="_blank" rel="noreferrer" className="flex items-center gap-1 p-1 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-800 hover:text-emerald-950 transition-colors">
                <MessageSquare className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>واتساب: 771673276</span>
              </a>
              <a href="mailto:office@example.com" className="flex items-center gap-1 p-1 bg-stone-100 hover:bg-stone-200 rounded text-slate-900 hover:text-amber-500 transition-colors truncate">
                <Mail className="h-3 w-3 text-stone-500 shrink-0" />
                <span className="truncate" title="office@example.com">Hatimalwatihi...</span>
              </a>
            </div>
          </div>

        </div>
      )}

    </header>
  );
}
