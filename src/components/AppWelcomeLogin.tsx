import { apiUrl } from "../utils/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, useEffect } from "react";
import { 
  Scale, Lock, User, Database, Shield, Globe, RefreshCw, 
  Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, Layout
} from "lucide-react";

interface AppWelcomeLoginProps {
  onLogin: (username: string, serverData: any, userObject: any, attorneyNameInput?: string) => void;
  onBypass: (attorneyNameInput?: string) => void;
  isOnline: boolean;
}

export default function AppWelcomeLogin({ onLogin, onBypass, isOnline }: AppWelcomeLoginProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [userRole, setUserRole] = useState<"lawyer" | "admin">("lawyer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attorneyNameInput, setAttorneyNameInput] = useState(() => {
    return localStorage.getItem("legal_platform_attorney_name") || localStorage.getItem("watihi_attorney_name") || "اسم المحامي/المكتب";
  });

  // States for local activation gate
  const [showLocalActivation, setShowLocalActivation] = useState(false);
  const [localCode, setLocalCode] = useState("");
  const [localCodeError, setLocalCodeError] = useState("");

  useEffect(() => {
    // التحقق من الرابط لتسريع عملية التسجيل المباشر وتعبئة الرمز تلقائياً
    const params = new URLSearchParams(window.location.search);
    const registerParam = params.get("register");
    const codeParam = params.get("code");
    
    if (registerParam === "true" || window.location.hash === "#register" || window.location.search.includes("register")) {
      setAuthMode("register");
      if (codeParam) {
        setInviteCode(codeParam.trim().toUpperCase());
        setSuccess(`✨ تم توجيهك لرابط التسجيل المباشر! تم ملء رمز الدعوة [${codeParam}] تلقائياً من أجلك.`);
      }
    }
  }, []);

  const handleLocalActivationSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalCodeError("");

    const normalizedCode = localCode.trim().toUpperCase();
    const isWatihiPattern = /^WATIHI-\d+$/.test(normalizedCode);
    const validCodes = [
      "77777",
      "777",
      "999",
      "WATIHI-777",
      "WATIHI-999",
      "WATIHI-VIP",
      "LAW-YEMEN-2026",
      "WATIHI2026"
    ];

    if (validCodes.includes(normalizedCode) || isWatihiPattern) {
      // Correct code, activate and enter local db!
      onBypass(attorneyNameInput.trim());
    } else {
      setLocalCodeError("رمز التنشيط الذي أدخلته غير صحيح. يرجى التواصل مع المحامي على الرقم 771673276 للحصول على الرمز.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password) {
      setError("يرجى ملء جميع الحقول المطلوبة للمواصلة.");
      return;
    }

    if (authMode === "register" && !attorneyNameInput.trim()) {
      setError("يرجى كتابة اسم الأستاذ المحامي لتأسيس الحساب.");
      return;
    }

    if (authMode === "register" && !inviteCode.trim()) {
      setError("تنبيه: لتأسيس حساب يرجى إدخال رمز دعوة التسجيل الحصري الصادر من مالك المنصة.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const bodyPayload: any = {
        username: username.trim(),
        password: password,
        role: userRole
      };
      if (authMode === "register") {
        bodyPayload.attorneyName = attorneyNameInput.trim();
        bodyPayload.inviteCode = inviteCode.trim();
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      let resData: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        resData = await response.json();
      } else {
        throw new Error("سيرفر المزامنة مستغرق في بدء التشغيل أو حدث خطأ مؤقت في الاتصال. يرجى الانتظار ثانية ثم إعادة المحاولة.");
      }

      if (!response.ok) {
        throw new Error(resData.error || "فشلت العملية على خادم المزامنة.");
      }

      if (authMode === "login") {
        setSuccess("تم التحقق والمصادقة بنجاح! جاري جلب ملفاتك العدلية السحابية...");
        setTimeout(() => {
          onLogin(username.trim(), resData.data, resData.user, attorneyNameInput.trim());
        }, 1200);
      } else {
        setSuccess("عظيم! تم تأسيس حسابك القانوني الجديد بنجاح في السيرفر باستخدام رمز الدعوة! يرجى تسجيل الدخول.");
        setAuthMode("login");
        setInviteCode("");
        setPassword("");
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      setError(err.message || "فشل الاتصال بخادم مكتب المحاماة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 relative overflow-hidden" id="welcome-auth-page" style={{ direction: "rtl" }}>
      
      {/* Absolute Decorative Premium Ambient Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px] pointer-events-none -ml-48 -mb-48" />

      {/* Header bar */}
      <header className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center z-10 backdrop-blur-md bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 shadow-md">
            <Scale className="h-5 sm:h-6 w-5 sm:w-6" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white hover:text-amber-400 transition-colors">المنصة العدلية لمكاتب المحاماة</h1>
            <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-wider">النظام السحابي والمستشار القضائي المؤمن في الجمهورية اليمنية</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}></span>
          <span className="text-[10px] sm:text-xs text-stone-300 font-extrabold font-sans hidden sm:inline">
            {isOnline ? "السيرفر متصل ونشط" : "السيرفر غير متصل (أوفلاين)"}
          </span>
        </div>
      </header>

      {/* Main Core Form Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10 my-8">
        <div className="w-full max-w-[500px] bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
          
          {/* Logo element decorative */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6 sm:mb-8">
            <div className="p-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-amber-400 shadow-inner flex items-center justify-center relative">
              <Scale className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            
            <h2 className="text-sm sm:text-base font-black text-white">
              {authMode === "login" ? "بوابة الدخول والمزامنة السحابية" : "تأسيس حساب مكتب ذكي جديد"}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-stone-400 max-w-sm leading-relaxed">
              مكتب المحاماة - نظام ذكي متكامل ومؤمن لإدارة القضايا والتقاويم وجدول الجلسات القضائية بالجمهورية اليمنية
            </p>
            
            {/* Subscription banner pricing info */}
            <div className="mt-2.5 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl text-[11px] text-amber-300 font-extrabold shadow-inner leading-relaxed">
              <span className="h-2 w-2 bg-amber-400 rounded-full shrink-0 animate-pulse"></span>
              <span>باقة الترخيص السحابية اللامحدودة: <strong className="text-white bg-amber-600/30 px-1.5 py-0.5 rounded text-xs font-black select-all">10$ شهرياً فقط</strong> للخدمات والمزامنة الآمنة.</span>
            </div>
          </div>

          {/* Form switch tab menu */}
          <div className="grid grid-cols-2 bg-slate-950/70 p-1.5 rounded-2xl mb-4 border border-slate-850">
            <button
              onClick={() => { setAuthMode("login"); setError(""); setSuccess(""); }}
              className={`py-2 text-center text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md"
                  : "text-stone-450 hover:text-white"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setAuthMode("register"); setError(""); setSuccess(""); }}
              className={`py-2 text-center text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                authMode === "register"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md"
                  : "text-stone-450 hover:text-white"
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* Role selection tab menu */}
          <div className="mb-6 space-y-1.5 text-right">
            <span className="block text-[10px] sm:text-[11px] font-black text-amber-500 tracking-wide">💼 صفة تسجيل الدخول والعمل:</span>
            <div className="grid grid-cols-2 bg-slate-950/70 p-1 rounded-xl border border-slate-850">
              <button
                type="button"
                onClick={() => { setUserRole("lawyer"); setError(""); setSuccess(""); }}
                className={`py-1.5 text-center text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  userRole === "lawyer"
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <span>⚖️ دخول كمحامي</span>
              </button>
              <button
                type="button"
                onClick={() => { setUserRole("admin"); setError(""); setSuccess(""); }}
                className={`py-1.5 text-center text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  userRole === "admin"
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <span>🏢 دخول كإدارة</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            
            {/* Attorney Name Input Field - Only for Registration */}
            {authMode === "register" && (
              <div className="space-y-1.5 text-right animate-fade-in">
                <label className="block text-[11px] sm:text-xs uppercase font-black text-amber-400 tracking-wider">
                  ⚖️ اسم الأستاذ المحامي لتخصيص المنصة باسمه (قابل للتعديل)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-amber-500 z-10">
                    <Scale className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={attorneyNameInput}
                    onChange={(e) => setAttorneyNameInput(e.target.value)}
                    placeholder="مثال: اسم المحامي/المكتب"
                    className="w-full text-right bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-11 pl-4 text-sm sm:text-base font-black text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] sm:text-xs uppercase font-black text-stone-300 tracking-wider">
                اسم المستخدم لقفل السجلات
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400 z-10">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: alwatihi-law"
                  className="w-full text-right bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-11 pl-4 text-sm sm:text-base font-black text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] sm:text-xs uppercase font-black text-stone-300 tracking-wider">
                كلمة المرور الأمنية
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400 z-10">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-right bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-11 pl-12 text-sm sm:text-base font-black text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner tracking-widest"
                />
                
                {/* Show/Hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 hover:text-white cursor-pointer z-10"
                  title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Invite Code field - only during registration */}
            {authMode === "register" && (
              <div className="space-y-1.5 animate-fade-in text-right">
                <label className="block text-[11px] sm:text-xs uppercase font-black text-amber-450 tracking-wider">
                  رمز دعوة التسجيل الحصري (يُستخدم لشخص واحد فقط)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-amber-500 z-10">
                    <Shield className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="أدخل رمز الدعوة هنا"
                    className="w-full text-right bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-11 pl-4 text-sm sm:text-base font-black text-amber-400 placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                  />
                </div>
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-xs text-stone-300 leading-relaxed space-y-2 text-right">
                  <span className="font-extrabold text-amber-450 block">🔑 الحصول على رمز دعوة التسجيل الحصري:</span>
                  <p className="text-[11px] text-stone-350">
                    يرجى التواصل السريع لطلب رمز تفعيل وتدعيم حسابك من المحامي فوراً عبر واتساب:
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-2 justify-center pt-1 font-sans">
                    <a
                      href="https://wa.me/967771673276?text=السلام%20عليكم%20الأستاذ%20المحامي%20عبدالله%20الوتيحي%20أريد%20تنشيط%20حسابي"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 no-underline cursor-pointer"
                    >
                      <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping"></span>
                      <span>💬 واتساب المحامي</span>
                    </a>
                    <a
                      href="tel:+967771673276"
                      className="w-full sm:w-auto px-4 py-1.5 bg-slate-950 border border-slate-800 text-amber-400 font-bold rounded-lg text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-95 no-underline"
                    >
                      <span>📞 اتصال مباشر: 771673276</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Response Banner states */}
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-xl text-xs font-bold text-red-105 flex flex-col gap-2 animate-fade-in text-right">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
                {error.includes("مسجل سابقاً") && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setError("");
                    }}
                    className="mt-1.5 text-right text-[11px] font-extrabold text-amber-400 hover:text-amber-350 underline underline-offset-4 cursor-pointer transition-colors self-start"
                  >
                    اضغط هنا للانتقال لتبويب "تسجيل الدخول" وكتابة كلمة المرور الخاصة بك.
                  </button>
                )}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-xs font-bold text-emerald-450 flex items-start gap-2 animate-fade-in text-right">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit dynamic action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-50 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer select-none"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
              ) : (
                <Shield className="h-4 w-4 text-slate-950" />
              )}
              <span>
                {loading ? "جاري الإرسال والتحقق..." : authMode === "login" ? "تسجيل الدخول ومزامنة البيانات" : "تأسيس الحساب والمزامنة السحابية"}
              </span>
            </button>

          </form>

          {/* Bypass Guest Offline fallback link / Local Activation barrier */}
          <div className="mt-6 pt-5 border-t border-slate-850 flex flex-col items-center justify-center space-y-3.5">
            {!showLocalActivation ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowLocalActivation(true)}
                  className="text-amber-400/90 hover:text-amber-400 text-xs font-black transition-all cursor-pointer underline underline-offset-4 flex items-center gap-1.5"
                >
                  <Layout className="h-4 w-4 text-amber-500" />
                  <span>الاستمرار وتفعيل التطبيق محلياً (أوفلاين)</span>
                </button>
                <p className="text-[10px] text-stone-500 text-center max-w-xs leading-relaxed">
                  * ملاحظة: يتطلب تشغيل أو فك قفل التطبيق محلياً إدخال رمز ومفتاح التشغيل الممنوح لك من المالك من المرة الأولى فقط.
                </p>
              </>
            ) : (
              <form onSubmit={handleLocalActivationSubmit} className="w-full space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 animate-fade-in text-right">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-400">تفعيل وتنشيط النظام محلياً</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLocalActivation(false);
                      setLocalCode("");
                      setLocalCodeError("");
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    إلغاء الرجوع
                  </button>
                </div>
                
                <p className="text-[10px] text-stone-300 leading-relaxed">
                  الرجاء كتابة رقم/رمز التفعيل الخاص بك الممنوح لك من قبل المطور أو إدارة المنصة للمتابعة:
                </p>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    value={localCode}
                    onChange={(e) => setLocalCode(e.target.value)}
                    placeholder="أدخل مفتاح التفعيل هنا"
                    className="w-full text-center bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs font-extrabold text-amber-400 placeholder-stone-600 outline-none focus:border-amber-500 transition-colors shadow-inner font-mono"
                  />
                </div>

                {localCodeError && (
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-red-400 font-extrabold leading-relaxed pr-1">
                      ⚠️ {localCodeError}
                    </p>
                    <a
                      href="https://wa.me/967771673276?text=السلام%20عليكم%20الأستاذ%20المحامي%20عبدالله%20الوتيحي%20أريد%20تنشيط%20حسابي"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-black text-amber-450 hover:text-amber-400 underline cursor-pointer pr-1"
                    >
                      <span>💬 انقر هنا للتواصل بخصوص التنشيط عبر واتساب</span>
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />
                  <span>تأكيد ومطابقة الرمز للدخول للموقع</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      {/* Footer bar */}
      <footer className="p-4 border-t border-white/5 bg-slate-950/40 text-center text-[10px] text-stone-500 z-10 font-bold">
        <span>تحت إشراف ومصادقة وزارة العدل والمحاكم بالجمهورية اليمنية • {new Date().getFullYear()}م</span>
      </footer>

    </div>
  );
}
