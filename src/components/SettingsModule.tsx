import { apiUrl } from "../utils/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Settings, User, Palette, Sun, Moon, Eye, Award, 
  Phone, Mail, Cloud, ShieldCheck, RefreshCw, LogOut, Sparkles, Code,
  Volume2, VolumeX, Shield, Key, Lock, Unlock, Check, AlertTriangle, Users,
  Activity, ArrowRightLeft, FileSpreadsheet, EyeOff, MessageSquare, Share2, Copy
} from "lucide-react";
import { LegalCase, LegalSession } from "../types";
import { triggerVoiceNotification } from "../utils/audioNotifier";

interface SettingsModuleProps {
  themeMode: string;
  setThemeMode: (mode: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  currentUser: { 
    username: string; 
    isAdmin?: boolean; 
    subscriptionStatus?: string; 
    subscriptionExpires?: string; 
    inviteCodeUsed?: string; 
    sessionToken?: string;
  } | null;
  cases: LegalCase[];
  sessions: LegalSession[];
  documents: any[];
  syncStatus: string;
  lastSyncedTime: string | null;
  onManualSync: () => void;
  handleLogout: () => void;
  onLoadSeedData: () => void;
  attorneyName: string;
  setAttorneyName: (name: string) => void;
}

export default function SettingsModule({
  themeMode,
  setThemeMode,
  accentColor,
  setAccentColor,
  currentUser,
  cases,
  sessions,
  documents,
  syncStatus,
  lastSyncedTime,
  onManualSync,
  handleLogout,
  onLoadSeedData,
  attorneyName,
  setAttorneyName,
}: SettingsModuleProps) {
  const [isAdminSimulated, setIsAdminSimulated] = useState(false);
  const [localAttorneyName, setLocalAttorneyName] = useState(attorneyName);
  const [identitySaved, setIdentitySaved] = useState(false);

  const isTrueAdmin = currentUser?.isAdmin === true;

  const showAdminUI = isTrueAdmin && (currentUser?.isAdmin || isAdminSimulated);

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminCodes, setAdminCodes] = useState<any[]>([]);
  const [customCode, setCustomCode] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  const fetchAdminData = async () => {
    setIsAdminLoading(true);
    setAdminError("");
    try {
      const headers = { 
        "x-admin-user": currentUser?.username || "",
        "x-admin-token": currentUser?.sessionToken || ""
      };
      const rUsers = await fetch(apiUrl("/api/admin/users"), { headers });
      const rCodes = await fetch(apiUrl("/api/admin/invite-codes"), { headers });
      if (rUsers.ok && rCodes.ok) {
        const dUsers = await rUsers.json();
        const dCodes = await rCodes.json();
        setAdminUsers(dUsers.users || []);
        setAdminCodes(dCodes.inviteCodes || []);
      }
    } catch (err) {
      console.error(err);
      setAdminError("فشل تحديث البيانات السحابية الحية من منصة الوتيحي.");
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    if (showAdminUI) {
      fetchAdminData();
    }
  }, [showAdminUI]);

  const handleToggleSubStatus = async (targetUser: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
      const res = await fetch(apiUrl("/api/admin/update-subscription"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-user": currentUser?.username || "",
          "x-admin-token": currentUser?.sessionToken || ""
        },
        body: JSON.stringify({ username: targetUser, status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAdminSuccess(data.message);
      triggerVoiceNotification(`عظيم! تم بنجاح تغيير ترخيص المحامي ${targetUser} السحابي.`);
      fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || "فشل تبديل وتحديث الترخيص.");
    }
  };

  const handleGenerateCode = async (e: any) => {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");
    try {
      const res = await fetch(apiUrl("/api/admin/generate-invite-code"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-user": currentUser?.username || "",
          "x-admin-token": currentUser?.sessionToken || ""
        },
        body: JSON.stringify({ customCode: customCode || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAdminSuccess(data.message);
      setCustomCode("");
      triggerVoiceNotification("تم توليد وفحص رمز الدخول الحصري الجديد.");
      fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || "فشل توليد رمز الدخول.");
    }
  };

  const handleRestoreUserBackup = async (targetUser: string) => {
    if (!window.confirm(`🔮 لوحة الساحرة الإدارية:\n\nهل أنت متأكد من رغبتك في إرجاع وضخ كامل القضايا والمذخرات المعتمدة للمستخدم (${targetUser})؟ سيقوم هذا بنسخ وإعادة قضاياك النموذجية الحالية فوراً إلى مكتبه السحابي لإنقاذه وإلغاء أي عطل يواجهه.`)) {
      return;
    }
    setAdminError("");
    setAdminSuccess("");
    try {
      const res = await fetch(apiUrl("/api/admin/restore-backup"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-user": currentUser?.username || "",
          "x-admin-token": currentUser?.sessionToken || ""
        },
        body: JSON.stringify({
          targetUsername: targetUser,
          sourceUsername: currentUser?.username || "admin",
          cases: cases, 
          sessions: sessions,
          documents: documents
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAdminSuccess(data.message);
      triggerVoiceNotification(`تم بنجاح وبقوة الساحرة استرجاع وأرشفة ملفات القضية للمستخدم ${targetUser}`);
      fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || "فشل استرجاع السجلات عبر خادم الساحرة.");
    }
  };
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("watihi_audio_notifications") !== "false";
    } catch {
      return true;
    }
  });

  const handleToggleAudio = (enabled: boolean) => {
    setAudioEnabled(enabled);
    localStorage.setItem("watihi_audio_notifications", enabled ? "true" : "false");
    if (enabled) {
      setTimeout(() => {
        triggerVoiceNotification("تم تفعيل التنبيهات الصوتية ونظام النطق العربي بنجاح!");
      }, 150);
    }
  };

  // Accent Presets list
  const accentPresets = [
    { id: "marib_gold", name: "🏆 ذهب مأرب", color: "#B58A3C" },
    { id: "sanaa_green", name: "🌲 صنعاء الخضراء", color: "#059669" },
    { id: "aden_sapphire", name: "🌊 خليج عدن", color: "#1D4ED8" },
    { id: "taiz_crimson", name: "🔥 عقيق تعز", color: "#DC2626" },
    { id: "violet_sheba", name: "🔮 ملوك سبأ", color: "#7C3AED" },
  ];

  const handleManualSyncToggle = async () => {
    setIsSyncing(true);
    setShowSyncSuccess(false);
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onManualSync();
    setIsSyncing(false);
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 3000);
  };

  // Check if current accent is custom (not in presets)
  const isCustomAccent = !accentPresets.some(p => p.id === accentColor) && accentColor.startsWith("#");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-right"
      id="settings-container-panel"
    >
      {/* Title Header */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
          <Settings className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">إعدادات المنصة والتحكيم البصري</h2>
          <p className="text-xs text-stone-500 mt-0.5">تخصيص ألوان الواجهة، إضاءة القراءة، إدارة السحابة والتعريف بفريق العمل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Appearance & Colors (التصميم وتحسين الألوان) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Attorney Identity settings (هوية المحامي والمنصة) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
              <User className="h-4 w-4 text-amber-500" />
              <span>الهوية القانونية وعضوية المحامي بالمنصة</span>
            </h3>
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">اسم المحامي المعتمد للمنصة:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localAttorneyName}
                  onChange={(e) => setLocalAttorneyName(e.target.value)}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-xs flex-1 font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                  placeholder="مثال: المحامي اسم المحامي/المكتب"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (localAttorneyName.trim()) {
                      setAttorneyName(localAttorneyName.trim());
                      localStorage.setItem("watihi_attorney_name", localAttorneyName.trim());
                      triggerVoiceNotification("تم تعديل الاسم واعتماده بالمنصة بنجاح!");
                      setIdentitySaved(true);
                      setTimeout(() => setIdentitySaved(false), 3000);
                    }
                  }}
                  className="bg-amber-500 text-slate-950 font-extrabold text-xs px-4 rounded-xl cursor-pointer hover:bg-amber-400 transition-colors"
                >
                  حفظ الهوية
                </button>
              </div>
              {identitySaved && (
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                  <Check className="h-3 w-3" />
                  <span>تم تحديث اسم المحامي وإعادة برمجة جميع النماذج وصيغ المنصة باسمك!</span>
                </p>
              )}
              <p className="text-[10px] text-stone-500 leading-normal">
                عند تغيير هذا الاسم، سيتم إعادة برمجة المنصة ومسودات القضايا والنماذج والملفات المصدرة وصيغ الذكاء الاصطناعي باسمك فورياً.
              </p>
            </div>
          </div>
          
          {/* Tone & Ambiance Selectors (الإضاءة والقراءة) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
              <Palette className="h-4 w-4 text-stone-500" />
              <span>أجواء الإضاءة والقراءة المريحة (الأخاديد البصرية)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Parchment Light */}
              <button
                type="button"
                onClick={() => {
                  setThemeMode("parchment");
                  localStorage.setItem("watihi_theme_mode", "parchment");
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                  themeMode === "parchment"
                    ? "border-amber-500 bg-amber-500/[0.03] scale-[1.02]"
                    : "border-stone-200 bg-stone-50/50 hover:bg-stone-50"
                }`}
              >
                <div className="h-8 w-12 rounded bg-[#F8F6F0] border border-[#E2DDD1] mb-2 flex items-center justify-center">
                  <Sun className="h-4 w-4 text-[#B58A3C]" />
                </div>
                <span className="font-bold text-xs text-slate-900">ورق الحصون النقي</span>
                <span className="text-[10px] text-stone-500 mt-0.5">إضاءة بيضاء نهارية دافئة</span>
              </button>

              {/* Option 2: Cosmic Navy Dark */}
              <button
                type="button"
                onClick={() => {
                  setThemeMode("cosmic_navy");
                  localStorage.setItem("watihi_theme_mode", "cosmic_navy");
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                  themeMode === "cosmic_navy"
                    ? "border-amber-500 bg-amber-500/[0.03] scale-[1.02]"
                    : "border-stone-200 bg-stone-50/50 hover:bg-stone-50"
                }`}
              >
                <div className="h-8 w-12 rounded bg-[#0B121F] border border-[#1E293B] mb-2 flex items-center justify-center">
                  <Moon className="h-4 w-4 text-[#8B5CF6]" />
                </div>
                <span className="font-bold text-xs text-slate-900">ليل صنعاء الكحلي</span>
                <span className="text-[10px] text-stone-500 mt-0.5">مظهر كحلي مريح جداً بالليل</span>
              </button>

              {/* Option 3: Shibam Sepia */}
              <button
                type="button"
                onClick={() => {
                  setThemeMode("shibam_sepia");
                  localStorage.setItem("watihi_theme_mode", "shibam_sepia");
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                  themeMode === "shibam_sepia"
                    ? "border-amber-500 bg-amber-500/[0.03] scale-[1.02]"
                    : "border-stone-200 bg-stone-50/50 hover:bg-stone-50"
                }`}
              >
                <div className="h-8 w-12 rounded bg-[#F5ECD7] border border-[#E4DC CE] mb-2 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-[#B58A3C]" />
                </div>
                <span className="font-bold text-xs text-slate-900">مخطوطات شبوة القديمة</span>
                <span className="text-[10px] text-stone-500 mt-0.5">صفار كريمي دافئ لحماية العين</span>
              </button>
            </div>
          </div>

          {/* Accent Color Customizer (اختر أي مظهر لون للبرنامج) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>لون الهوية المخصص (مفاتيح وأزرار البرنامج)</span>
            </h3>

            {/* Accent Presets list */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {accentPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setAccentColor(preset.id);
                    localStorage.setItem("watihi_theme_accent", preset.id);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all cursor-pointer font-bold text-[11px] justify-center ${
                    accentColor === preset.id
                      ? "border-amber-500 bg-amber-500/[0.03] scale-[1.02]"
                      : "border-stone-200 bg-stone-50/50 hover:bg-stone-50"
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: preset.color }}></span>
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Interactive Color Picker (اجعل المستخدم يختار أي لون يناسبه) */}
            <div className="bg-stone-100/50 p-4 rounded-xl border border-stone-150/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">جهاز انتقاء تدرج اللون اللامحدود</h4>
                  <p className="text-[10px] text-stone-500">اختر أي لون مخصص يعبر عن ذوقك العدلي (انقر على اللون لتعديله)</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <input
                    type="color"
                    id="custom-hex-picker"
                    value={accentColor.startsWith("#") ? accentColor : "#B58A3C"}
                    onChange={(e) => {
                      const col = e.target.value;
                      setAccentColor(col);
                      localStorage.setItem("watihi_theme_accent", col);
                    }}
                    className="h-8 w-14 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                  />
                  <input
                    type="text"
                    maxLength={7}
                    value={accentColor.startsWith("#") ? accentColor : "#B58A3C"}
                    onChange={(e) => {
                      let col = e.target.value;
                      if (!col.startsWith("#")) col = "#" + col;
                      if (col.length <= 7) {
                        setAccentColor(col);
                        localStorage.setItem("watihi_theme_accent", col);
                      }
                    }}
                    className="w-20 bg-white border border-stone-200 text-slate-950 font-mono text-xs font-bold p-1 rounded-md text-center"
                    placeholder="#B58A3C"
                  />
                </div>
              </div>

              {/* Custom State Label if picker is chosen */}
              {isCustomAccent && (
                <div className="p-2 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg text-emerald-800 text-[10px] font-bold text-center">
                  ✨ لقد قمت بتفعيل اللون العدلي المخصص: <strong className="font-mono">{accentColor}</strong> بنجاح!
                </div>
              )}
            </div>

          </div>

          {/* Audio Alert Toggles & Sound Settings Panel */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4 text-right">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-start gap-2 border-b border-stone-100 pb-2.5">
              {audioEnabled ? (
                <Volume2 className="h-4 w-4 text-amber-500 animate-pulse" />
              ) : (
                <VolumeX className="h-4 w-4 text-stone-400" />
              )}
              <span>نظام التنبيهات الصوتية ونطق الجلسات (Web Speech API)</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-stone-100/40 rounded-xl border border-stone-150">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-900">سماح التنبيه الصوتي والنطق الآلي</h4>
                <p className="text-[10px] text-stone-500 leading-relaxed max-w-xl">
                  عند الجلسات أو التحضير القضائي، يُصدر البرنامج نغماً صوتياً ويعلن المواعيد بالصوت العربي الفصيح وقارئ النصوص تفادياً لفوائت المواعيد الهامة.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleAudio(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    audioEnabled
                      ? "bg-amber-500 text-white shadow"
                      : "bg-stone-200/60 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  تفعيل التنبيهات 🔊
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAudio(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !audioEnabled
                      ? "bg-red-500 text-white shadow"
                      : "bg-stone-200/60 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  تعطيل الصوت 🔇
                </button>
              </div>
            </div>

            {audioEnabled && (
              <div className="bg-emerald-500/[0.03] p-4 rounded-xl border border-emerald-500/10 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-emerald-800">اختبار سماع الصوت والنطق فوراً</h4>
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      اختبر ميزة النطق الآلي بصوت اصطناعي عربي نقي مع قارع التنبيه الخاص بمواعيد المحاماة.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      triggerVoiceNotification("تأكيد تفعيل الصوت. هذا تنبيه تجريبي من منصة الوتيحي لدراسة وتتبع الجلسات القضائية اليمنية بنظام المزامنة الذاتية.");
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg transition-all shadow hover:scale-[1.02] cursor-pointer"
                  >
                    🔊 تجربة ونطق التنبيه الآن
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Core System stats information */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-stone-100 pb-2.5">📊 إحصائيات التخزين وقواعد البيانات المحمية</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-stone-100/40 rounded-xl border border-stone-150">
                <span className="block text-xl font-black text-slate-950">{cases.length}</span>
                <span className="text-[10px] text-stone-500 font-bold">ملف قضية مخزن</span>
              </div>
              <div className="p-3 bg-stone-100/40 rounded-xl border border-stone-150">
                <span className="block text-xl font-black text-slate-950">{sessions.length}</span>
                <span className="text-[10px] text-stone-500 font-bold">جلسة محاكمة مجدولة</span>
              </div>
              <div className="p-3 bg-stone-100/40 rounded-xl border border-stone-150">
                <span className="block text-xl font-black text-slate-950">{documents.length}</span>
                <span className="text-[10px] text-stone-500 font-bold">مستند ومذكرة قانونية</span>
              </div>
            </div>
          </div>

          {/* Seed Data Recovery Option */}
          <div className="bg-amber-500/[0.03] rounded-2xl border-2 border-dashed border-amber-500/20 p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-amber-500 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>إعادة تعبئة البيانات واستعادة القضايا النموذجية</span>
            </h3>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              إذا كانت لوحة التحكم الخاصة بك فارغة أو تود استئناف القضايا والمستندات المحررة مسبقاً، يمكنك بنقرة واحدة استيراد وتعبئة قضايا يمنية نموذجية متكاملة، جلسات مجدولة بتواريخ هجرية/ميلادية، وصكوك ومذكرات عدلية مصممة وجاهزة ومعدة بالكامل تحت إشراف وتنسيق <strong>المهندس والمطور حاتم الوتيحي</strong>.
            </p>
            <button
              onClick={() => {
                if (window.confirm("هل أنت متأكد من رغبتك في تحميل واستيراد القضايا والملفات النموذجية اليمنية؟ سيتم إضافتها إلى مخزن حسابك النشط لتكون جاهزة للمطالعة والتحليل.")) {
                  onLoadSeedData();
                  triggerVoiceNotification("تم استيراد وتعبئة القضايا والمستندات النموذجية اليمنية بنجاح واقتدار!");
                  alert("🚀 تم استيراد وتعبئة القضايا والمستندات النموذجية اليمنية بنجاح واقتدار!");
                }
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform shadow-md cursor-pointer hover:scale-[1.01]"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>نعم، قم باستيراد وتعبئة القضايا والملفات فوراً</span>
            </button>
          </div>

        </div>

        {/* Column 2: Account and Developers Info (خيارات الحساب والمصمم وفريق التطوير) */}
        <div className="space-y-6">
          
          {/* Account Details & Cloud Synchronization Area (خيارات الحساب والاتصال) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-stone-500" />
                <span>خيارات حساب المحامي الذكي</span>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full font-black">
                سحابي • مزمـن دائم
              </span>
            </h3>

            {currentUser ? (
              <div className="space-y-3.5 text-right">
                <div className="p-3.5 bg-amber-500/[0.03] rounded-xl border border-amber-500/10 flex items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] text-stone-400 font-black block leading-none">حساب المستخدم الحالي</span>
                    <strong className="text-slate-950 text-base font-bold block mt-1">{currentUser.username}</strong>
                  </div>
                  <div className="h-9 w-9 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {currentUser.username.substring(0, 1).toUpperCase()}
                  </div>
                </div>

                {/* Live Premium Subscription status card */}
                <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-black">حزمة الاشتراك السحابي النشطة</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black ${
                      currentUser.subscriptionStatus === "suspended" 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {currentUser.subscriptionStatus === "suspended" ? "🔴 معلق مؤقتاً" : "🟢 نشط بالدفع"}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-100 flex items-center justify-between gap-2.5">
                      <span>باقة الودائع السحابية اللامحدودة (محاماة)</span>
                      <span className="text-amber-400 font-mono text-[11px] font-black shrink-0 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                        10$ / شهرياً
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-slate-450 bg-white/5 border border-white/5 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-stone-400">قيمة الاشتراك الشهري:</span>
                      <strong className="text-amber-300 font-extrabold select-all">10 دولار فقط (10$ USD)</strong>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>تاريخ التجديد القادم:</span>
                      <strong className="text-amber-200">
                        {currentUser.subscriptionExpires 
                          ? new Date(currentUser.subscriptionExpires).toLocaleDateString("ar-YE", { year: 'numeric', month: 'long', day: 'numeric' }) 
                          : "خلال 30 يوم"}
                      </strong>
                    </div>
                    {currentUser.inviteCodeUsed && (
                      <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                        <span>رمز التفعيل المستخدم:</span>
                        <span className="text-amber-400/90">{currentUser.inviteCodeUsed}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-700 block text-right">حالة المزامنة السحابية:</span>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold justify-start">
                      <Cloud className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>قناة المزامنة مغطاة ومحمية</span>
                    </div>
                    {lastSyncedTime ? (
                      <p className="text-[10px] text-stone-500 text-right" dir="rtl">
                        🕒 آخر تحديث ومزامنة للسحاب: <span className="font-mono">{lastSyncedTime}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-stone-500 text-right">تم التوافق مع آخر تحديثات الخادم بنجاح.</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleManualSyncToggle}
                    disabled={isSyncing}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "جاري الاتصال والمزامنة..." : "مزامنة البيانات السحابية الآن"}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-red-650 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-stone-200 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>تسجيل خروج الحساب الكلي</span>
                  </button>

                  {/* Simulator button so users can easily toggle and see "لوحة الساحرة" features */}
                  {isTrueAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isAdminSimulated;
                        setIsAdminSimulated(nextState);
                        triggerVoiceNotification(nextState ? "تم تفعيل محاكاة لوحة الساحرة الإدارية للمشرف" : "إلغاء وضع الإدارة");
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        isAdminSimulated 
                          ? "bg-amber-600 text-white border border-amber-500" 
                          : "bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      <span>{isAdminSimulated ? "🔒 إلغاء محاكاة إدارة السحابة" : "🔑 تشغيل محاكاة إدارة السحابة (لوحة الساحرة 🔮)"}</span>
                    </button>
                  )}
                </div>

                {showSyncSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-250 text-[10px] font-black rounded-lg text-center"
                  >
                    🚀 تم إكمال المزامنة وضمان تأمين حسابك!
                  </motion.div>
                )}

              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50/70 text-orange-850 rounded-xl border border-orange-100 text-xs text-center font-bold">
                  🔒 أنت تعمل كزائر تحت ميزة التنشيط المحلي (أوفلاين).
                </div>
                
                <div className="p-4 bg-red-500/10 text-slate-900 rounded-2xl border border-red-500/20 text-xs text-right space-y-3 shadow-inner">
                  <h4 className="font-extrabold text-xs text-red-700 flex items-center justify-end gap-1.5">
                    <span>⚠️ تعليق وحظر جلسة تجريبية</span>
                  </h4>
                  <p className="text-[10px] text-stone-600 leading-relaxed">
                    إذا قمت بإعطاء الهاتف أو المتصفح لشخص آخر لتجربة ومطالعة النظام، أو انتهت مدة تجربتهم وتريد قفل التطبيق فوراً وحذف كل ما تم تسجيله وإدخاله محلياً، اضغط على الزر أحمر اللون بالأسفل. سيقوم هذا بإفقادهم الوصول للغرفة كلياً ومطالبتهم بالرمز السري في المرة القادمة.
                  </p>
                  
                  <button
                    onClick={() => {
                      if (window.confirm("⚠️ تذكير بالأمان المالي والقانوني:\n\nهل أنت متأكد من رغبتك في حذف وإتلاف هذه الجلسة التفعيلية وإعادة إغلاق النظام بالكامل؟ سيتم مسح كافة ملفات القضايا والبيانات من تطبيقك لحفظ خصوصيتها، ولن يسمح لأحد بالمرور للمكتب مجدداً بدون إذنك وكتابة الرمز السري.")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer border border-red-700"
                  >
                    <span>🔒 إنهاء التجربة وقفل الرصيد فوراً</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Premium "لوحة الساحرة الإدارية" - Rendered if active admin or simulated */}
          {showAdminUI && (
            <div className="bg-white rounded-2xl border-2 border-amber-500/30 p-5 shadow-lg space-y-5 text-right animate-fade-in" id="wizard-admin-panel">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 bg-amber-500 rounded-full animate-ping"></span>
                  <h3 className="font-black text-sm text-slate-950">🔮 لوحة الساحرة الذكية لإدارة سحابة الوتيحي</h3>
                </div>
                <span className="text-[9px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-mono font-black uppercase">
                  WIZARD ADMIN v2.0
                </span>
              </div>

              <p className="text-[11px] text-stone-600 leading-relaxed">
                مرحباً بك يا حضرة المستشار في لوحة الساحرة الخلفية لإدارة السحاب. من هنا يمكنك مراقبة حسابات المستخدمين العشرة، التحكم في رخص الدخول والاشتراك الشهري، توليد رموز دعوة شخص واحد، وإرجاع واسترداد كامل قضايا وملفات أي حساب في لمحة بصر!
              </p>

              {/* Status messages in admin panel */}
              {adminError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold leading-relaxed">
                  ⚠️ {adminError}
                </div>
              )}
              {adminSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold leading-relaxed">
                  ☘️ {adminSuccess}
                </div>
              )}

              {/* LIST OF REGISTERED ACCOUNT SUITES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">👥 حسابات المشتركين النشطة على السيرفر ({adminUsers.length || "10"})</span>
                  <button 
                    onClick={fetchAdminData}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 shrink-0" /> تحديث القائمة
                  </button>
                </div>

                <div className="divide-y divide-stone-100 max-h-[280px] overflow-y-auto pr-1">
                  {adminUsers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400 font-bold bg-stone-50 rounded-xl border border-stone-100">
                      جاري جلب قائمة المشتركين من السحابة... يرجى الانتظار
                    </div>
                  ) : (
                    adminUsers.map((u) => (
                      <div key={u.username} className="py-3 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 bg-stone-100 text-stone-800 rounded-full flex items-center justify-center text-xs font-bold">
                              {u.username.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-xs text-slate-900 block font-bold">
                                {u.username} {u.isAdmin && <span className="text-[9px] text-amber-600 mx-1">(مدير)</span>}
                              </strong>
                              <span className="text-[9px] text-stone-500 font-mono">
                                🔑 الرمز: {u.inviteCodeUsed || "دخول مباشر / منشأ يدوياً"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                              u.subscriptionStatus === "suspended" 
                                ? "bg-red-50 text-red-700 border border-red-200" 
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {u.subscriptionStatus === "suspended" ? "🔴 معلق وبحاجة دفع" : "🟢 نشط الدفع شهرياً"}
                            </span>
                          </div>
                        </div>

                        {/* File details & control buttons per user */}
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50/70 p-2 rounded-xl text-[10px]">
                          <div className="flex items-center gap-2 text-stone-500 font-bold">
                            <span>💼 قضايا: <strong className="text-slate-900">{u.cases?.length || 0}</strong></span> • 
                            <span>📅 جلسات: <strong className="text-slate-900">{u.sessions?.length || 0}</strong></span> • 
                            <span>📄 وثائق: <strong className="text-slate-900">{u.documents?.length || 0}</strong></span>
                          </div>

                          <div className="flex items-center gap-1.5 font-bold">
                            {/* Toggle payments button */}
                            <button
                              onClick={() => handleToggleSubStatus(u.username, u.subscriptionStatus)}
                              className={`px-2 py-1 rounded text-[9px] border transition-colors cursor-pointer ${
                                u.subscriptionStatus === "suspended"
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                                  : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              }`}
                            >
                              {u.subscriptionStatus === "suspended" ? "🟢 تفعيل الاشتراك" : "🔴 تعليق الحساب"}
                            </button>

                            {/* Restore backup button - wizard action */}
                            <button
                              onClick={() => handleRestoreUserBackup(u.username)}
                              title="إرجاع واستعادة كامل قضايا ومجالس هذا المحامي النموذجية من مكتب الساحرة لحل أي مسألة أو ملفات محذوفة للعميل"
                              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-[9px] flex items-center gap-0.5 shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>🔮 إرجاع من الساحرة</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* GENERATE UNIQUE SINGLE-USE REGISTRATION CODES */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3.5">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 justify-start">
                  <Key className="h-4 w-4 text-amber-500" />
                  <span>مولد رموز دعوة تسجيل الحسابات (شخص قانوني واحد فقط)</span>
                </span>
                
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  لكل مستخدم جديد ترغب في بيع البرنامج أو إعطائه له شهرياً، يجب عليك توليد رمز فريد. عند استعمال الرمز من قِبل أي مستخدم، يتم إتلافه فوراً وربطه بحسابه الشخصي بشكل دائم كحماية ضد استخدام حساب واحد من قِبل شخصين.
                </p>

                <form onSubmit={handleGenerateCode} className="flex gap-2">
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="رمز مخصص (مثل: HATEM-LAW)"
                    className="flex-1 bg-white border border-stone-200 p-2 text-xs font-bold rounded-lg text-right text-slate-900 outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-slate-950 text-amber-400 hover:bg-slate-900 text-xs px-3 py-2 font-extrabold rounded-lg shrink-0 transition-colors cursor-pointer"
                  >
                    ⚡️ توليد الرمز
                  </button>
                </form>

                {/* Grid of codes */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-stone-500 block">لائحة الرموز المولّدة المعتمدة للعملاء:</span>
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1 text-center font-mono text-[10px]">
                    {adminCodes.map((c) => (
                      <div 
                        key={c.code} 
                        className={`p-1.5 rounded border text-right pr-2 ${
                          c.isUsed 
                            ? "bg-red-50 text-red-800 border-red-100" 
                            : "bg-emerald-50 text-emerald-800 border-emerald-100"
                        }`}
                      >
                        <div className="font-extrabold text-[11px]">{c.code}</div>
                        <div className="text-[9px] text-stone-400 mt-0.5">
                          {c.isUsed ? `🔴 مستعمل بواسطة: ${c.usedBy}` : "🟢 متاح ومستعد للاستعمال"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Designer & Programmer Credits (المصمم والمبرمج للبرنامج) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
              <Award className="h-4 w-4 text-amber-500" />
              <span>فريق الإشراف الفني والابتكار</span>
            </h3>

            <div className="space-y-4">
              
              {/* Designer / Developer Information Card (مهندس ومطور النظام حاتم الوتيحي) */}
              <div className="bg-amber-500/[0.04] p-3.5 rounded-xl border border-amber-500/10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
                    <Award className="h-5 w-5 text-slate-950 font-bold" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black text-amber-800 tracking-wider block leading-none">هندسة وبناء وتطوير النظام كلياً</span>
                    <strong className="text-slate-950 text-sm font-black block mt-1">المهندس والمطور حاتم الوتيحي</strong>
                  </div>
                </div>
                
                <p className="text-[10.5px] text-slate-700 leading-normal border-r-2 border-amber-400 pr-2">
                  تمت هندسة معمارية البيانات، بناء وتصميم الواجهات، وتطوير البنية الداخلية لهذا النظام المتكامل بواسطة <strong>المهندس حاتم الوتيحي</strong> ليمنح المحامي والباحث القانوني اليمني أداة فريدة ومتقنة بالكامل.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 text-[10px] font-mono select-all">
                  <a href="tel:+967771673276" className="flex items-center gap-1.5 text-stone-600 hover:text-amber-500 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <strong>اتصال: +967 771673276</strong>
                  </a>
                  <a href="https://wa.me/967771673276" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-extrabold transition-colors">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>مراسلة واتساب فورية</span>
                  </a>
                  <a href="mailto:office@example.com" className="flex items-center gap-1.5 text-stone-600 hover:text-amber-500 transition-colors truncate md:col-span-2 border-t border-stone-100 pt-1.5">
                    <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <strong className="truncate">office@example.com</strong>
                  </a>
                </div>
              </div>

              {/* Technical Specifications & Credentials Card */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider block leading-none">مواصفات ومعايير الأمان</span>
                    <strong className="text-white text-xs font-bold block mt-1">منظومة حماية متكاملة</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-300 leading-normal border-r-2 border-slate-700 pr-2">
                  يدعم هذا النظام تشفير البيانات الحساسة وقفل السجلات بمفاتيح مخصصة محلياً، مع محرك ذكي للمزامنة التلقائية والعمل بكفاءة دون إنترنت للحفاظ على خصوصية مذكرات المحامي وجلساته.
                </p>

                <div className="pt-1 flex flex-col gap-1 text-[9px] text-slate-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span>قاعدة بيانات مشفرة بالكامل محلياً وسحابياً</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span>مزامنة تلقائية مع توافر كاش الطوارئ أوفلاين</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
