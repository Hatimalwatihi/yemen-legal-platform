import { apiUrl } from "../utils/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Briefcase, Plus, Search, Eye, Edit3, Trash2, Calendar, 
  MapPin, UserCheck, DollarSign, Upload, FileText, Check, 
  Trash, ChevronRight, Scale, Clock, Sparkles, AlertCircle,
  ArrowRightLeft, Download, Copy, Printer, Archive
} from "lucide-react";
import { LegalCase, CaseType, CaseStatus, Attachment, LegalSession } from "../types";
import { triggerVoiceNotification } from "../utils/audioNotifier";

interface CasesModuleProps {
  cases: LegalCase[];
  sessions: LegalSession[];
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  onAddCase: (c: LegalCase) => void;
  onUpdateCase: (c: LegalCase) => void;
  onDeleteCase: (id: string) => void;
  onAddAttachmentToCase: (caseId: string, att: Attachment) => void;
  onDeleteAttachmentFromCase: (caseId: string, attId: string) => void;
  setQuickAiPrompt: (prompt: string) => void;
  setActiveTab: (tab: string) => void;
  currentUser: { username: string; isAdmin?: boolean; subscriptionStatus?: string } | null;
}

export default function CasesModule({
  cases,
  sessions,
  selectedCaseId,
  setSelectedCaseId,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onAddAttachmentToCase,
  onDeleteAttachmentFromCase,
  setQuickAiPrompt,
  setActiveTab,
  currentUser
}: CasesModuleProps) {
  const getSecureUrl = (url: string) => {
    if (!url) return "";
    const token = (currentUser as any)?.sessionToken || "";
    if (!token) return apiUrl(url);
    if (url.includes("?")) {
      return `${apiUrl(url)}&token=${encodeURIComponent(token)}`;
    }
    return `${apiUrl(url)}?token=${encodeURIComponent(token)}`;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Export & print target states
  const [printTargetCase, setPrintTargetCase] = useState<LegalCase | null>(null);
  const [printTargetAll, setPrintTargetAll] = useState<boolean>(false);
  const [autoPrint, setAutoPrint] = useState<boolean>(false);
  const [includeSessionNotes, setIncludeSessionNotes] = useState<boolean>(true);
  
  // P2P Pass-to-Pass states
  const [isP2POpen, setIsP2POpen] = useState(false);
  const [p2pUserField, setP2pUserField] = useState("");
  const [p2pLoading, setP2pLoading] = useState(false);
  const [p2pError, setP2pError] = useState("");
  const [p2pSuccess, setP2pSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Strategic defense analysis loading state
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null);

  // Form states
  const [caseNumber, setCaseNumber] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CaseType>(CaseType.CIVIL);
  const [court, setCourt] = useState("");
  const [progressStage, setProgressStage] = useState<"ابتدائية" | "استئناف" | "محكمة عليا" | "تنفيذ">("ابتدائية");
  const [clientName, setClientName] = useState("");
  const [clientRole, setClientRole] = useState<"مدعي" | "مدعى عليه" | "طرف ثالث" | "مستأنف">("مدعي");
  const [opponentName, setOpponentName] = useState("");
  const [opponentLawyer, setOpponentLawyer] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [status, setStatus] = useState<CaseStatus>(CaseStatus.ACTIVE);
  const [feesTotal, setFeesTotal] = useState(150000);
  const [feesPaid, setFeesPaid] = useState(50000);
  const [description, setDescription] = useState("");
  const [criminalSubType, setCriminalSubType] = useState<"جسيمة" | "غير جسيمة">("جسيمة");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || null;
  const linkedSessions = sessions.filter(s => s.caseId === selectedCaseId);

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesQuery = 
      c.title.includes(searchQuery) || 
      c.caseNumber.includes(searchQuery) ||
      c.clientName.includes(searchQuery) ||
      c.opponentName.includes(searchQuery);
    const matchesType = filterType === "ALL" || c.type === filterType;
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    return matchesQuery && matchesType && matchesStatus;
  });

  // Auto-print effect when direct printing is triggered
  useEffect(() => {
    if (autoPrint && (printTargetCase || printTargetAll)) {
      const timer = setTimeout(() => {
        window.print();
        setAutoPrint(false);
      }, 600); // 600ms buffer to ensure DOM layout is fully mounted and styled
      return () => clearTimeout(timer);
    }
  }, [autoPrint, printTargetCase, printTargetAll]);

  // Export cases to CSV (UTF-8 BOM supported for Microsoft Excel in Arabic)
  const exportCasesToCSV = () => {
    if (filteredCases.length === 0) {
      alert("⚠️ عذراً، لا توجد قضايا مطابقة لتصديرها.");
      return;
    }

    const headers = [
      "رقم القضية",
      "موضوع النزاع أو العنوان",
      "النوع والفرع القانوني",
      "المحكمة المختصة",
      "اسم الموكل",
      "صفة الموكل",
      "الطرف الآخر (الخصم)",
      "محامي الطرف الخصم",
      "القاضي ناظر الخصومة",
      "مرحلة التقاضي",
      "حالة ملف القضية",
      "الأتعاب الكلية (ريال يمني)",
      "المبلغ المدفوع (ريال يمني)",
      "المبلغ المتبقي (ريال يمني)",
      "تاريخ البدء بالمكتب",
      "ملخص النزاع"
    ];

    const escapeCSV = (val: string | number) => {
      const str = String(val === null || val === undefined ? '' : val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredCases.map(c => [
      escapeCSV(c.caseNumber),
      escapeCSV(c.title),
      escapeCSV(c.type),
      escapeCSV(c.court || "غير محدد"),
      escapeCSV(c.clientName),
      escapeCSV(c.clientRole || "غير محدد"),
      escapeCSV(c.opponentName || "غير محدد"),
      escapeCSV(c.opponentLawyer || "غير محدد"),
      escapeCSV(c.judgeName || "غير محدد"),
      escapeCSV(c.progressStage || "غير محدد"),
      escapeCSV(c.status),
      c.feesTotal,
      c.feesPaid,
      (c.feesTotal - c.feesPaid),
      escapeCSV(c.startDate),
      escapeCSV(c.description || "")
    ]);

    // Prepend UTF-8 BOM so Excel opens Arabic correctly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `أرشيف_قضايا_مكتب_الوتيحي_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerVoiceNotification("تم تصدير أرشيف القضايا كملف إكسل بنجاح!");
  };

  const handleEditClick = (c: LegalCase) => {
    setCaseNumber(c.caseNumber);
    setTitle(c.title);
    setType(c.type);
    setCourt(c.court);
    setProgressStage(c.progressStage as any);
    setClientName(c.clientName);
    setClientRole(c.clientRole as any);
    setOpponentName(c.opponentName);
    setOpponentLawyer(c.opponentLawyer);
    setJudgeName(c.judgeName);
    setStatus(c.status);
    setFeesTotal(c.feesTotal);
    setFeesPaid(c.feesPaid);
    setDescription(c.description);
    setCriminalSubType(c.criminalSubType || "جسيمة");
    
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    if (isEditing && selectedCaseId) {
      const updated: LegalCase = {
        ...cases.find(c => c.id === selectedCaseId)!,
        caseNumber,
        title,
        type,
        court,
        progressStage,
        clientName,
        clientRole: clientRole as any,
        opponentName,
        opponentLawyer,
        judgeName,
        status,
        feesTotal: Number(feesTotal),
        feesPaid: Number(feesPaid),
        description,
        criminalSubType: type === CaseType.CRIMINAL ? criminalSubType : undefined,
      };
      onUpdateCase(updated);
      setIsEditing(false);
    } else {
      const newCase: LegalCase = {
        id: "case_" + Date.now(),
        caseNumber: caseNumber || `${Math.floor(Math.random() * 900 + 100)}/${type === CaseType.CRIMINAL ? "جنائي" : "مدني"}/${new Date().getFullYear()}`,
        title,
        type,
        court,
        progressStage,
        clientName,
        clientRole: clientRole as any,
        opponentName,
        opponentLawyer,
        judgeName,
        status,
        feesTotal: Number(feesTotal),
        feesPaid: Number(feesPaid),
        description,
        startDate: new Date().toISOString().split("T")[0],
        attachments: [],
        criminalSubType: type === CaseType.CRIMINAL ? criminalSubType : undefined,
      };
      onAddCase(newCase);
      setSelectedCaseId(newCase.id);
      setIsAddingNew(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCaseId) return;

    // Direct Max limit set to 500MB to support large legal materials
    const MAX_USER_SIZE_MB = 500.0;
    
    if (file.size > MAX_USER_SIZE_MB * 1024 * 1024) {
      alert(`⚠️ عذراً، حجم الملف كبير جداً (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت).\n\nالحد الأقصى المسموح برَفعه للملف الواحد بالسحابة هو ${MAX_USER_SIZE_MB} ميجابايت لحماية أداء معالجة القضايا بالخادم العدلي.`);
      return;
    }

    // If there's no logged-in user (Local Bypass Mode), we restrict file content to 1.5MB to avoid crash in localStorage
    if (!currentUser) {
      const LOCAL_LIMIT_MB = 1.5;
      if (file.size > LOCAL_LIMIT_MB * 1024 * 1024) {
        alert(`⚠️ عذراً، لقد قمت برفع ملف بحجم (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت).\n\nبما أنك قمت بـ "تخطي الدخول والتفعيل المحلي" وتعمل الآن أوفلاين (بلا حساب سحابي)، يتم حفظ بياناتك فقط داخل المتصفح الخاص بك (والذي يمتلك سعة قصوى محدودة بـ 5 ميجابايت كلياً للأجهزة).\n\n💡 الحلول المتاحة للرفع الكامل:\n1️⃣ يرجى الذهاب للإعدادات وتسجيل حساب سحابي رسمي (Register) وتسجيل الدخول لتفعيل السحابة ومزامنة حسابك، لتتمكن من رفع جميع الملفات الضخمة بالكامل بسعة تصل إلى ${MAX_USER_SIZE_MB} ميجابايت على الخادم العدلي السحابي الآمن والمدعوم.\n2️⃣ كبديل مؤقت أوفلاين، يرجى تصفح ملفات أصغر من ${LOCAL_LIMIT_MB} ميجابايت أو تقسيمها.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress("جاري تهيئة الملف والاتصال بالسحابة الآمنة لرفع الملف...");
    setUploadPercent(0);

    try {
      let uploadUrl: string | undefined = undefined;

      // 1. If logged-in online user: upload using Form Data directly via XMLHttpRequest for progress monitoring
      if (currentUser) {
        setUploadProgress("جاري رفع المستند ونقله بأمان لالخادم العدلي (يرجى الانتظار، لا تغلق الصفحة لحجم الملف)...");
        
        const fd = new FormData();
        fd.append("file", file); // Appends the File object directly! Extremely low memory footprint.

        const uploadResult = await new Promise<{ success: boolean; url?: string; error?: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadPercent(percent);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (err) {
                reject(new Error("فشل معالجة استجابة السيرفر."));
              }
            } else {
              reject(new Error(`فشل رفع المستند. كود السيرفر: ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("حدث خطأ في الاتصال أثناء رفع الملف."));
          });

          xhr.open("POST", apiUrl("/api/upload-file"));
          xhr.setRequestHeader("x-session-token", (currentUser as any)?.sessionToken || "");
          xhr.send(fd);
        });

        if (uploadResult.success && uploadResult.url) {
          uploadUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "لم نتمكن من الحصول على رابط الملف الصالح للسحابة.");
        }
      }

      // 2. If offline, or we need local base64 fallback
      let base64Data: string | undefined = undefined;
      if (!uploadUrl) {
        setUploadProgress("جاري معالجة الملف واستخراج بيانات الذاكرة المحلية لأوفلاين...");
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("فشل قراءة الملف محلياً"));
          reader.readAsDataURL(file);
        });
      }

      const newAttachment: Attachment = {
        id: "att_" + Date.now(),
        name: file.name,
        size: file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`,
        mimeType: file.type || "application/octet-stream",
        base64Data, // undefined for cloud files to keep client local state extremely light!
        url: uploadUrl,
        uploadDate: new Date().toISOString().split("T")[0]
      };

      onAddAttachmentToCase(selectedCaseId, newAttachment);
      setUploadProgress("");
      setUploadPercent(null);
      setIsUploading(false);
      triggerVoiceNotification("تم رفع المرفق وضم المستند القانوني للملف بنجاح!");
      alert("✨ تم رفع الملف وضمه لملف القضية بنجاح!");
    } catch (err: any) {
      console.error("Upload process failed:", err);
      alert(`❌ فشل رفع الملف السحابي: ${err.message || "يرجى التحقق من اتصال الشبكة وإعادة المحاولة."}`);
      setUploadPercent(null);
      setIsUploading(false);
    }
  };

  // AI strategic analysis based on a file attachment or entire case details
  const triggerAiAnalysis = async (attName: string) => {
    if (!selectedCase) return;
    setAiAnalyzing(attName);
    
    // Construct rich simulation prompt for Gemini custom legal strategies in Yemen
    const query = `أهلا مستشارنا القانوني اسم المحامي/المكتب. لدي قضية هامة بعنوان "${selectedCase.title}" (رقم القضية: ${selectedCase.caseNumber}). 
- نوع القضية: ${selectedCase.type} (مرحلة التقاضي: ${selectedCase.progressStage}).
- صفة موكلي: ${selectedCase.clientName} بصفتة (${selectedCase.clientRole}).
- الخصم: ${selectedCase.opponentName} ومحاميه (${selectedCase.opponentLawyer || "غير محدد"}).
- المحكمة المختصة: ${selectedCase.court}.

الملف المرفق المعني: "${attName}".

المطلوب: تقديم ورقة تكييف قانوني وتحليل استراتيجي (Strategic Litigation Strategy) للقضية بموجب القوانين اليمنية النافذة. اذكر:
1. الأسس والخرائط القانونية الملائمة بموجب القانون المدني وقانون الإثبات اليمني.
2. الثغرات المتوقعة التي يمكن لخصمنا إثارتها وكيفية التحصين ضدها.
3. التوصيات والدفوع القانونية المطلوبة لتقديمها في الجلسة المقبلة.`;

    setQuickAiPrompt(query);
    setTimeout(() => {
      setAiAnalyzing(null);
      setActiveTab("ai-advisor");
    }, 1000);
  };

  const startNewCaseCreation = () => {
    setCaseNumber(`${Math.floor(Math.random() * 800 + 100)}/${new Date().getFullYear()}`);
    setTitle("");
    setType(CaseType.CIVIL);
    setCourt("");
    setProgressStage("ابتدائية");
    setClientName("");
    setClientRole("مدعي");
    setOpponentName("");
    setOpponentLawyer("");
    setJudgeName("");
    setStatus(CaseStatus.ACTIVE);
    setFeesTotal(250000);
    setFeesPaid(0);
    setDescription("");
    
    setIsAddingNew(true);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cases-module-root">
      
      {/* Sidebar: Cases List and Filters */}
      <aside className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex flex-col h-[750px]">
        <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
          <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-amber-500" />
            <span>سجل القضايا الموكلة</span>
          </h2>
          <button 
            onClick={startNewCaseCreation}
            className="p-1 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>قضية جديدة</span>
          </button>
        </div>

        {/* Searching and Filter inputs */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="ابحث برقم القضية، الموكل، الخصم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pr-9 pl-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg p-1.5 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
            >
              <option value="ALL">كل الأنواع</option>
              {Object.values(CaseType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg p-1.5 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
            >
              <option value="ALL">كل الحالات</option>
              {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* أزرار تصدير وأرشفة القضايا */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 mt-2">
            <button
              type="button"
              onClick={exportCasesToCSV}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.01]"
              title="تصدير جدول القضايا الحالية كأرشيف ملف إكسل CSV متكامل"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span>تصدير CSV</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (filteredCases.length === 0) {
                  alert("⚠️ لا توجد قضايا معروضة لطباعتها في التقرير الكلي.");
                  return;
                }
                setPrintTargetAll(true);
                setPrintTargetCase(null);
                triggerVoiceNotification("تم فتح ترويسة التقرير العام لطباعة ملف البي دي إف");
              }}
              className="p-2 bg-slate-50 hover:bg-stone-100 text-slate-800 border border-stone-250 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.01]"
              title="توليد تقرير رسمي بكامل القضايا وطباعته أو حفظه كملف PDF"
            >
              <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>تقرير PDF الشامل</span>
            </button>
          </div>
        </div>

        {/* Case Units rendering list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredCases.length === 0 ? (
            <div className="text-center py-20 text-stone-400 text-xs">
              لم نعثر على قضايا مطابقة لبحثك.
            </div>
          ) : (
            filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  setIsAddingNew(false);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-right flex flex-col justify-between gap-1.5 ${
                  selectedCaseId === c.id
                    ? "bg-slate-900 border-amber-500 text-white shadow-md shadow-amber-500/5"
                    : "bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-800"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      selectedCaseId === c.id 
                      ? "bg-amber-400/20 text-amber-400" 
                      : "bg-slate-100 text-slate-800"
                    }`}>
                      {c.type}
                    </span>
                    {c.type === CaseType.CRIMINAL && c.criminalSubType && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        c.criminalSubType === "جسيمة"
                        ? "bg-red-500/25 text-red-500 font-extrabold"
                        : "bg-blue-500/25 text-blue-400 font-extrabold"
                      }`}>
                        {c.criminalSubType}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono ${selectedCaseId === c.id ? "text-slate-400" : "text-stone-500"}`}>
                    رقم: {c.caseNumber}
                  </span>
                </div>

                <div className="font-extrabold text-xs line-clamp-1">{c.title}</div>
                
                <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-dashed border-stone-200">
                  <span className={selectedCaseId === c.id ? "text-slate-300" : "text-stone-600"}>
                    الموكل: {c.clientName}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className={`font-semibold ${
                      c.status === CaseStatus.CLOSED 
                        ? "text-amber-500 font-bold" 
                        : c.status.includes("نشطة") 
                          ? "text-emerald-500" 
                          : "text-stone-500"
                    }`}>
                      {c.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const isArchived = c.status === CaseStatus.CLOSED;
                        const updated: LegalCase = {
                          ...c,
                          status: isArchived ? CaseStatus.ACTIVE : CaseStatus.CLOSED
                        };
                        onUpdateCase(updated);
                        triggerVoiceNotification(
                          isArchived 
                            ? "تم إلغاء أرشفة القضية بنجاح." 
                            : "تم نقل القضية للأرشيف بنجاح!"
                        );
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        c.status === CaseStatus.CLOSED
                          ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20"
                      }`}
                      title={c.status === CaseStatus.CLOSED ? "إلغاء الأرشفة ونقلها للنشطة" : "أرشفة ونقل هذه القضية إلى الأرشيف"}
                    >
                      <Archive className="h-3.5 w-3.5 shrink-0" />
                      <span>{c.status === CaseStatus.CLOSED ? "إلغاء الأرشفة" : "أرشفة"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Panel: Details */}
      <main className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-[750px] flex flex-col">
        {selectedCase ? (
          /* Case Details View Mode */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Bar with Case actions */}
            <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-400 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                    {selectedCase.type}
                  </span>
                  {selectedCase.type === CaseType.CRIMINAL && selectedCase.criminalSubType && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase ${
                      selectedCase.criminalSubType === "جسيمة"
                      ? "bg-red-600 text-white font-extrabold"
                      : "bg-blue-600 text-white font-extrabold"
                    }`}>
                      {selectedCase.criminalSubType}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">رقم القضية بالمحكمة: {selectedCase.caseNumber}</span>
                </div>
                <h3 className="text-base font-extrabold mt-1 text-white">{selectedCase.title}</h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {/* P2P button */}
                <button
                  onClick={() => setIsP2POpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 border border-amber-400 p-2 rounded-xl text-white flex items-center gap-1 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
                  title="تمرير ملف القضية وكامل تفاصيلها لزميل آخر فورا بالخط السريع"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-extrabold pb-0.5">تمرير Pass-to-Pass</span>
                </button>

                <button
                  onClick={() => handleEditClick(selectedCase)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => {
                    const isArchived = selectedCase.status === CaseStatus.CLOSED;
                    const updated: LegalCase = {
                      ...selectedCase,
                      status: isArchived ? CaseStatus.ACTIVE : CaseStatus.CLOSED
                    };
                    onUpdateCase(updated);
                    triggerVoiceNotification(
                      isArchived 
                        ? "تم إلغاء أرشفة القضية بنجاح." 
                        : "تم أرشفة القضية وحفظها في الأرشيف المغلق!"
                    );
                  }}
                  className={`p-2 rounded-xl flex items-center gap-1 transition-all border hover:scale-[1.02] cursor-pointer ${
                    selectedCase.status === CaseStatus.CLOSED
                      ? "bg-emerald-950/40 hover:bg-emerald-950/85 border-emerald-900/40 text-emerald-400"
                      : "bg-amber-500/10 hover:bg-amber-500/25 border-amber-500/30 text-amber-400"
                  }`}
                  title={selectedCase.status === CaseStatus.CLOSED ? "إلغاء أرشفة القضية وإعادتها للجدول اليومي" : "أرشفة القضية ونقلها للأرشيف المغلق"}
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>{selectedCase.status === CaseStatus.CLOSED ? "إلغاء الأرشفة" : "أرشفة القضية"}</span>
                </button>
                <button
                  onClick={() => {
                    setPrintTargetCase(selectedCase);
                    setPrintTargetAll(false);
                    setAutoPrint(true);
                    triggerVoiceNotification(`جاري تحضير ملف تقرير القضية وطباعته فوراً`);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-xl flex items-center gap-1.5 font-extrabold transition-all hover:scale-[1.02] cursor-pointer"
                  title="طباعة فورية مباشرة للملف المنسق كتقرير رسمي"
                >
                  <Printer className="h-3.5 w-3.5 shrink-0" />
                  <span>طباعة مباشرة</span>
                </button>
                <button
                  onClick={() => {
                    setPrintTargetCase(selectedCase);
                    setPrintTargetAll(false);
                    setAutoPrint(false);
                    triggerVoiceNotification(`جاري عرض معاينة التقرير الكامل للقضية`);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="عرض معاينة التقرير لتتمكن من تعديله أو نسخه أو طباعته يدوياً"
                >
                  <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>معاينة التقرير</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("هل تريد بالتأكيد نقل هذه القضية لقسم المراجعة أو حذفها؟")) {
                      onDeleteCase(selectedCase.id);
                      setSelectedCaseId(null);
                    }
                  }}
                  className="bg-red-950/40 hover:bg-red-950/80 border border-red-900/40 p-2 rounded-xl text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>

            {/* Scrolling Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Part 1: Case general details table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200/60 text-xs">
                <div>
                  <div className="py-1.5 border-b border-stone-200/60 flex justify-between">
                    <span className="text-stone-500">الموكل:</span>
                    <span className="font-extrabold text-slate-900">{selectedCase.clientName} ({selectedCase.clientRole})</span>
                  </div>
                  <div className="py-1.5 border-b border-stone-200/60 flex justify-between">
                    <span className="text-stone-500">الطرف الخصم:</span>
                    <span className="font-bold text-slate-900">{selectedCase.opponentName || "غير محدد"}</span>
                  </div>
                  <div className="py-1.5 border-b border-stone-200/60 flex justify-between">
                    <span className="text-stone-500">محامي الخصم:</span>
                    <span className="text-stone-850 font-semibold">{selectedCase.opponentLawyer || "لا يوجد / مجهول"}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-stone-500">فضيلة القاضي:</span>
                    <span className="text-slate-800 font-bold">{selectedCase.judgeName || "لم يفرز بعد"}</span>
                  </div>
                </div>

                <div className="border-r border-stone-200 pr-0 md:pr-4">
                  <div className="py-1.5 border-b border-stone-200/60 flex justify-between">
                    <span className="text-stone-500">المحكمة المختصة:</span>
                    <span className="font-extrabold text-slate-900">{selectedCase.court || "غير محدد"}</span>
                  </div>
                  <div className="py-1.5 border-b border-stone-200/60 flex justify-between">
                    <span className="text-stone-500">مرحلة التقاضي الحالية:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 rounded-md">{selectedCase.progressStage}</span>
                  </div>
                  <div className="py-1.5 border-b border-stone-200/60 flex justify-between">
                    <span className="text-stone-500">تاريخ بدء العمل بالمكتب:</span>
                    <span className="font-mono text-stone-700">{selectedCase.startDate}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-stone-500">الحالة العامة:</span>
                    <span className="font-bold text-emerald-600">{selectedCase.status}</span>
                  </div>
                </div>
              </div>

              {/* Part 2: Brief content summary description */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-900 border-r-4 border-amber-500 pr-2">ملخص النزاع والخلفية الموضوعية</h4>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCase.description || "لا يوجد وصف قضائي مسجل حتى الآن. يمكنك إضافته عبر خيار تعديل."}
                </div>
              </div>

              {/* Part 3: Connected Sessions List */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-xs text-slate-900 border-r-4 border-emerald-500 pr-2">سجل الجلسات المرتبطة بهذه القضية</h5>
                {linkedSessions.length === 0 ? (
                  <p className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-100">
                    لا توجد جلسات مجدولة أو مسجلة مرتبطة بملف هذه القضية حتى الآن.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {linkedSessions.map(sec => (
                      <div key={sec.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs flex flex-col justify-between gap-1">
                        <div className="flex justify-between font-bold">
                          <span>{sec.courtName}</span>
                          <span className="text-amber-600 font-mono">{sec.time}</span>
                        </div>
                        <div className="text-[10px] text-stone-500">
                          القاضي: {sec.judgeName} • حالة الجلسة: <span className="text-emerald-600 font-semibold">{sec.status}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-100 flex justify-between">
                          <span>ميلادي: {sec.sessionDateGregorian}</span>
                          <span>هجري: {sec.sessionDateHijri}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Part 4: Attachments and custom AI defense analyst */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <h4 className="font-extrabold text-xs text-slate-900 border-r-4 border-blue-500 pr-2">البينات والمستندات المرفقة للقضية</h4>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 px-3 bg-slate-100 hover:bg-amber-100 text-slate-900 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 text-amber-500" />
                    <span>إرفاق وثيقة/مستند</span>
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {isUploading && (
                  <div className="bg-amber-50/70 border border-amber-200/80 text-slate-900 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 text-right shadow-sm">
                    {uploadPercent !== null && (
                      <div className="relative flex items-center justify-center w-14 h-14 shrink-0 bg-white rounded-full p-1 shadow-sm">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            className="text-stone-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            className="text-amber-600 transition-all duration-150"
                            strokeWidth="3.5"
                            strokeDasharray={2 * Math.PI * 20}
                            strokeDashoffset={2 * Math.PI * 20 * (1 - (uploadPercent ?? 0) / 100)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute font-mono text-[10px] font-black text-stone-800">
                          {uploadPercent}%
                        </div>
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping shrink-0" />
                        <span>جاري رفع المستند كاملاً للملف القضائي...</span>
                      </div>
                      <div className="text-[10px] text-stone-600 leading-relaxed font-sans">{uploadProgress}</div>
                    </div>
                  </div>
                )}

                {selectedCase.attachments.length === 0 ? (
                  <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 border-dashed text-center">
                    <FileText className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-[11px] text-stone-500">لا توجد وثائق أو أدلة مرفقة في ملف هذه القضية.</p>
                    <p className="text-[10px] text-stone-400 mt-1">تساعدك المرفقات في الحفاظ على أدلتك (مثل صور العقود، الأحكام السابقة، الكمبيالات) وتقديمها لمستشارك الذكي لتحليلها فوراً!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCase.attachments.map((att) => (
                      <div 
                        key={att.id}
                        className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col justify-between gap-1.5 hover:border-amber-400 transition-all text-right"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-900 rounded-lg text-amber-500 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-[11px] text-slate-900 line-clamp-1">{att.name}</div>
                            <div className="text-[10px] text-stone-400 font-mono">الحجم: {att.size} • تاريخ الرفع: {att.uploadDate}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-stone-100 text-[10px] flex-wrap md:flex-nowrap">
                          {att.url ? (
                            <>
                              <a
                                href={getSecureUrl(att.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors border border-emerald-200 text-center shrink-0"
                                title="فتح الملف مباشرة من الخادم العدلي"
                              >
                                <Download className="h-3 w-3 shrink-0" />
                                <span>فتح المرفق</span>
                              </a>
                              
                              <button
                                onClick={() => {
                                  // Construct absolute URL with security token appended
                                  const absoluteUrl = window.location.origin + getSecureUrl(att.url);
                                  navigator.clipboard.writeText(absoluteUrl)
                                    .then(() => {
                                      setCopiedId(att.id);
                                      triggerVoiceNotification("تم نسخ رابط المستند بالكامل للحافظة لإرساله!");
                                      setTimeout(() => setCopiedId(null), 3000);
                                    })
                                    .catch(() => {
                                      alert(`رابط الملف المباشر هو:\n${absoluteUrl}`);
                                    });
                                }}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors border border-amber-200 text-center shrink-0"
                                title="نسخ رابط التحميل المباشر لإرساله للعملاء أو المستخدمين"
                              >
                                {copiedId === att.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                    <span className="text-emerald-700 font-sans">تم النسخ!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 shrink-0" />
                                    <span>نسخ الرابط</span>
                                  </>
                                )}
                              </button>
                            </>
                          ) : att.base64Data ? (
                            <a
                              href={att.base64Data}
                              download={att.name}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors border border-emerald-200 text-center shrink-0"
                              title="تنزيل محتوى الملف المخزن محلياً"
                            >
                              <Download className="h-3 w-3 shrink-0" />
                              <span>تحميل</span>
                            </a>
                          ) : null}

                          <button
                            onClick={() => triggerAiAnalysis(att.name)}
                            disabled={aiAnalyzing !== null}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-1 px-1 rounded flex items-center justify-center gap-1 transition-colors text-center"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>{aiAnalyzing === att.name ? "جاري ترحيل الاستشارة..." : "تحليل الدفاع"}</span>
                          </button>
                          
                          <button
                            onClick={() => onDeleteAttachmentFromCase(selectedCase.id, att.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-650 p-1.5 rounded transition-colors border border-red-200 shrink-0"
                            title="حذف المرفق"
                          >
                            <Trash className="h-3.5 w-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Part 5: Financial Statement Summary widget */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-slate-900 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-amber-200/50">
                  <h4 className="font-extrabold text-xs flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    <span>موقف الأتعاب والدفوعات المالية لملف القضية</span>
                  </h4>
                  <span className="text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded-full font-semibold">تصفية</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">الأتعاب المتفق عليها</div>
                    <div className="font-bold font-mono text-slate-900 mt-0.5">{selectedCase.feesTotal.toLocaleString()} ريال</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">المبلغ المدفوع</div>
                    <div className="font-bold font-mono text-emerald-600 mt-0.5">{selectedCase.feesPaid.toLocaleString()} ريال</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <div className="text-[10px] text-stone-500">المبلغ المتبقي</div>
                    <div className="font-bold font-mono text-amber-700 mt-0.5">{(selectedCase.feesTotal - selectedCase.feesPaid).toLocaleString()} ريال</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Empty State Display when no case is selected */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 bg-amber-50 rounded-full mb-4">
              <Scale className="h-10 w-10 text-amber-500" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">أهلاً بك في وحدة شؤون القضايا للمحاكم اليمنية</h3>
            <p className="text-xs text-stone-500 mt-2 max-w-sm leading-relaxed">
              يرجى اختيار قضية من الجانب الأيمن لاستعراض تفاصيلها كاملة ومرفقاتها وتحليلات الدفاع الذكي، أو انقر على "قضية جديدة" لتسجيل معاملة إضافية.
            </p>
            <button 
              onClick={startNewCaseCreation}
              className="mt-6 bg-slate-900 border border-amber-500 text-amber-400 hover:bg-slate-800 text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>تسجيل قضية أولى للمكتب</span>
            </button>
          </div>
        )}

      </main>

      {/* P2P Pass-to-Pass Dialog Modal */}
      {isP2POpen && selectedCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-right" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h4 className="font-extrabold text-sm text-slate-950 flex items-center gap-1.5 justify-start">
                <ArrowRightLeft className="h-4 w-4 text-amber-500 shrink-0" />
                <span>🚀 خدمة التمرير السحابي المباشر (Pass-to-Pass)</span>
              </h4>
              <button 
                onClick={() => {
                  setIsP2POpen(false);
                  setP2pError("");
                  setP2pSuccess("");
                  setP2pUserField("");
                }}
                className="text-stone-400 hover:text-stone-600 font-extrabold text-sm cursor-pointer"
                title="إغلاق التلميح"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              قم بتمرير ملف القضية بالكامل (المسمى: <strong className="text-slate-900">{selectedCase.title}</strong>) من حسابك السحابي إلى حساب زميل آخر مشترك فوراً في لمحة بصر عن طريق تبادل البيانات من جهاز لجهاز سحابياً.
            </p>

            {p2pError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold leading-relaxed">
                ⚠️ {p2pError}
              </div>
            )}

            {p2pSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold leading-relaxed">
                🚀 {p2pSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-black text-stone-400 tracking-wider">
                اسم حساب المحامي المتلقي في السحابة
              </label>
              <input 
                type="text"
                autoFocus
                value={p2pUserField}
                onChange={(e) => setP2pUserField(e.target.value)}
                placeholder="اكتب اسم الحساب أو العميل المتلقي (مثل: admin أو watihi)"
                className="w-full text-right bg-stone-50 border border-stone-250 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 transition-colors shadow-inner font-mono"
              />
              <div className="p-3 bg-stone-100/60 rounded-xl text-[10px] text-stone-500 leading-normal space-y-1">
                <span className="font-bold text-stone-700 block">💡 اقتراحات حسابات متلقية صالحة وفورية للتجربة:</span>
                <p className="text-[9px] text-stone-400">يمكنك تجربة التمرير بين حسابين (مثلاً من حسابك إلى الحساب العام admin أو watihi). عند التمرير، ستنتقل القضية بكامل مرفقاتها وحساباتها فوراً لسطح مكتب الطرف الآخر!</p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-amber-600">
                  <button 
                    type="button" 
                    onClick={() => setP2pUserField("admin")}
                    className="bg-white px-2.5 py-0.5 rounded border border-stone-350 text-[10px] hover:border-amber-400 font-bold cursor-pointer"
                  >
                    admin
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setP2pUserField("watihi")}
                    className="bg-white px-2.5 py-0.5 rounded border border-stone-350 text-[10px] hover:border-amber-400 font-bold cursor-pointer"
                  >
                    watihi
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                if (!p2pUserField.trim()) {
                  setP2pError("يرجى كتابة اسم الحساب المتلقي أولاً.");
                  return;
                }
                if (p2pUserField.trim().toLowerCase() === currentUser?.username.toLowerCase()) {
                  setP2pError("تنبيـه: لا يمكنك تمرير ملف إلى نفس حسابك المفتوح حالياً.");
                  return;
                }
                setP2pLoading(true);
                setP2pError("");
                setP2pSuccess("");
                try {
                  const res = await fetch(apiUrl("/api/p2p/pass"), {
                    method: "POST",
                    headers: { 
                      "Content-Type": "application/json",
                      "x-session-token": (currentUser as any)?.sessionToken || ""
                    },
                    body: JSON.stringify({
                      sourceUsername: currentUser?.username || "Guest",
                      sessionToken: (currentUser as any)?.sessionToken || "",
                      targetUsername: p2pUserField.trim(),
                      itemType: "case",
                      itemData: selectedCase
                    })
                  });
                  const resData = await res.json();
                  if (!res.ok) throw new Error(resData.error || "عذراً، فشل تمرير الملف السحابي.");

                  setP2pSuccess(resData.message);
                  triggerVoiceNotification(`مبروك! تم بنجاح تمرير قضيتك بالكامل إلى المحامي المستهدف ${p2pUserField}`);
                  setTimeout(() => {
                    setIsP2POpen(false);
                    setP2pUserField("");
                    setP2pSuccess("");
                  }, 2500);
                } catch (err: any) {
                  setP2pError(err.message);
                } finally {
                  setP2pLoading(false);
                }
              }}
              disabled={p2pLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-2.5 rounded-xl shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{p2pLoading ? "جاري الاتصال السريع والتمرير..." : "🚀 إرسال وتمرير القضية بالكامل الآن"}</span>
            </button>
          </div>
        </div>
      )}

      {/* نافذة معاينة التقرير والطباعة لحفظ PDF */}
      {(printTargetCase || printTargetAll) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-start p-4 md:p-8 z-[9999] overflow-y-auto" dir="rtl">
          
          {/* شريط التحكم المخصص للتحميل/الطباعة */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-4 mb-4 flex flex-wrap items-center justify-between gap-3 text-white print:hidden shadow-xl">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">معاينة مستند الأرشفة الرسمي</h4>
                <p className="text-[10px] text-slate-400">يمكنك طباعة التقرير مباشرة أو حفظه بصيغة PDF عالية الدقة عبر خيار الطابعة</p>
              </div>
            </div>

            {printTargetCase && (
              <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSessionNotes}
                    onChange={(e) => setIncludeSessionNotes(e.target.checked)}
                    className="w-4 h-4 text-amber-500 bg-slate-950 border-slate-700 rounded focus:ring-amber-500 focus:ring-2 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-stone-200">تضمين ملاحظات ومخرجات الجلسات بالتقرير</span>
                </label>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  let text = "";
                  if (printTargetCase) {
                    text = `=== تقرير قضية: ${printTargetCase.title} ===\n` +
                           `رقم القضية: ${printTargetCase.caseNumber}\n` +
                           `النوع: ${printTargetCase.type}\n` +
                           `المحكمة المختصة: ${printTargetCase.court || "غير حدد"}\n` +
                           `الموكل لدينا والصفة: ${printTargetCase.clientName} (${printTargetCase.clientRole})\n` +
                           `الطرف الخصم والممثل: ${printTargetCase.opponentName || "غير محدد"} ${printTargetCase.opponentLawyer ? `(بتمثيل: ${printTargetCase.opponentLawyer})` : ""}\n` +
                           `القاضي ناظر الخصومة: ${printTargetCase.judgeName || "لم يفرز بعد"}\n` +
                           `الحالة العامة: ${printTargetCase.progressStage} / ${printTargetCase.status}\n\n` +
                           `--- تفاصيل النزاع والخلفية القانونية ---\n` +
                           `${printTargetCase.description || "لا يوجد شرح تفصيلي مسجل للقضية"}\n\n`;

                    const caseSessions = sessions.filter(s => s.caseId === printTargetCase.id);
                    if (caseSessions.length > 0) {
                      text += `=== سجل الجلسات القضائية الموثقة ===\n`;
                      caseSessions.forEach((s, idx) => {
                        text += `${idx + 1}. جلسة بمحكمة: ${s.courtName}\n` +
                                `   التاريخ: ${s.sessionDateGregorian} م / ${s.sessionDateHijri} هـ | الحالة: ${s.status}\n` +
                                `   القاضي: ${s.judgeName || "غير محدد"}\n`;
                        if (includeSessionNotes) {
                          if (s.notes) text += `   الملاحظات والمخرجات: ${s.notes}\n`;
                          if (s.decisions) text += `   القرارات الصادرة: ${s.decisions}\n`;
                          if (s.nextSteps) text += `   الإجراءات والخطوات القادمة: ${s.nextSteps}\n`;
                        }
                        text += `   ----------------------------------------\n`;
                      });
                    }
                  } else if (printTargetAll) {
                    text = `=== تقرير شامل لكافة القضايا الموكلة ===\nالتاريخ: ${new Date().toISOString().split('T')[0]}\n\n`;
                    filteredCases.forEach((c, index) => {
                      text += `${index + 1}. قضية: ${c.title} (رقم: ${c.caseNumber})\n` +
                              `   - النوع: ${c.type} | الموكل: ${c.clientName}\n` +
                              `   - الحالة: ${c.status} | مرحلة التقاضي: ${c.progressStage}\n` +
                              `   ----------------------------------------\n`;
                    });
                  }
                  if (text) {
                    navigator.clipboard.writeText(text);
                    alert("📋 تم نسخ نص التقرير بالكامل بنجاح إلى الحافظة! يمكنك الآن لصقه في أي ملف وورد (Word) أو مشاركته بسهولة.");
                    triggerVoiceNotification("تم نسخ التقرير كملف نصي بنجاح");
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                title="نسخ كامل نص التقرير المكتوب لتتمكن من لصقه وتعديله في ملف وورد أو إرساله واتساب"
              >
                <Copy className="h-4 w-4 shrink-0" />
                <span>نسخ التقرير كنص</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4 shrink-0" />
                <span>طباعة أو حفظ كـ PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrintTargetCase(null);
                  setPrintTargetAll(false);
                }}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>

          {/* تنبيه هام جداً حول محددات الطباعة في المتصفحات البيئية المغلقة */}
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-2xl max-w-4xl w-full p-4 mb-4 text-xs leading-relaxed text-right print:hidden flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">⚠️ تنبيه فني هام لطباعة التقرير وحفظ الـ PDF السليم:</p>
              <p>أنت تتصفح حالياً التطبيق من داخل نافذة معاينة مغلقة (Iframe)، وبعض المتصفحات تمنع ظهور أو تفعيل نافذة طابعة الويندوز من داخل الإطارات الفرعية لحمايتك.</p>
              <p className="font-bold text-white pt-1">💡 للحل والطباعة المباشرة بأعلى جودة:</p>
              <ul className="list-disc list-inside space-y-1 text-stone-200 mr-2">
                <li>اضغط على زر <span className="font-bold text-amber-300">"فتح في نافذة جديدة" (الأيقونة المربعة مع سهم مائل في أعلى يسار الشاشة الخضراء للتطبيق)</span> لفتح النظام بكامل المتصفح.</li>
                <li>بمجرد فتح التطبيق بالكامل بالخارج، اضغط زر الطباعة هنا مجدداً وستفتح لك نافذة طابعة نظام التشغيل فوراً لحفظ الملف كـ <span className="font-bold text-amber-300">PDF</span> أو إرساله للطابعة!</li>
                <li>كما يمكنك دوماً استخدام خيار <span className="font-bold text-emerald-300">"نسخ التقرير كنص"</span> بالأعلى لنقل البيانات فوراً إلى تطبيق Word (وورد).</li>
              </ul>
            </div>
          </div>

          {/* مساحة محاكاة ورقة الطباعة A4 */}
          <div 
            id="print-document-area" 
            className="bg-white rounded-lg border border-stone-300 p-8 md:p-12 max-w-4xl w-full text-stone-900 shadow-2xl relative min-h-[1123px] flex flex-col justify-between"
          >
            {/* ستايل الطباعة المخصص والمحلي */}
            <style>{`
              @media print {
                body {
                  background-color: white !important;
                  color: black !important;
                }
                body * {
                  visibility: hidden;
                }
                #print-document-area, #print-document-area * {
                  visibility: visible;
                }
                #print-document-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  border: none !important;
                  box-shadow: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
              }
            `}</style>

            {/* محتوى الورقة */}
            <div>
              {/* الترويسة الرسمية للمكتب */}
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
                {/* الجهة اليمنى */}
                <div className="text-right space-y-1">
                  <div className="font-extrabold text-sm text-slate-900">جمهورية اليمن</div>
                  <div className="font-bold text-xs text-slate-800">مكتب المحاماة والاستشارات القانونية</div>
                  <div className="font-extrabold text-xs text-amber-700">المستشار القانوني: اسم المحامي/المكتب</div>
                  <div className="text-[10px] text-stone-500 font-sans">معتمد أمام المحكمة العليا والنيابة العامة</div>
                </div>

                {/* الشعار في المنتصف */}
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-slate-900 text-amber-500 rounded-full border border-amber-400">
                    <Scale className="h-8 w-8" />
                  </div>
                  <div className="text-[9px] text-stone-500 tracking-widest font-black uppercase mt-1">YEMEN LEGAL PLATFORM</div>
                </div>

                {/* الجهة اليسرى */}
                <div className="text-left space-y-1 text-xs">
                  <div><strong>التاريخ:</strong> <span className="font-sans">{new Date().toISOString().split('T')[0]}</span></div>
                  <div><strong>طبيعة المستند:</strong> <span className="font-bold bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">تقرير أرشفة معتمد</span></div>
                  <div className="text-[10px] text-stone-500 font-sans">مستند إلكتروني آمن</div>
                </div>
              </div>

              {printTargetCase ? (
                /* لآوت تقرير القضية الواحدة */
                <div className="space-y-6">
                  {/* العنوان */}
                  <div className="text-center py-2 bg-slate-900 text-white rounded-lg border border-amber-500/30">
                    <h3 className="font-extrabold text-sm tracking-tight">تقرير تفصيلي لملف القضية الرقمية</h3>
                    <p className="text-[10px] font-mono mt-0.5 text-amber-400">رقم المرجع بالمحكمة: {printTargetCase.caseNumber}</p>
                  </div>

                  {/* القسم 1: بيانات أطراف النزاع والتقاضي */}
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-xs text-slate-900 border-r-4 border-amber-500 pr-2 pb-0.5">أولاً: بطاقة تعريف الخصومة والتقاضي</h5>
                    <div className="grid grid-cols-2 gap-px bg-stone-300 border border-stone-300 text-xs">
                      <div className="bg-stone-50 p-2 font-bold text-stone-600">موضوع النزاع الرئيسي</div>
                      <div className="bg-white p-2 font-extrabold text-slate-900">{printTargetCase.title}</div>

                      <div className="bg-stone-50 p-2 font-bold text-stone-600">رقم القضية القضائي</div>
                      <div className="bg-white p-2 font-mono font-bold text-slate-900">{printTargetCase.caseNumber}</div>

                      <div className="bg-stone-50 p-2 font-bold text-stone-600">الاختصاص / نوع القضية</div>
                      <div className="bg-white p-2 font-bold text-amber-800">{printTargetCase.type}</div>

                      <div className="bg-stone-50 p-2 font-bold text-stone-600">المحكمة المختصة والدائرة</div>
                      <div className="bg-white p-2 font-bold">{printTargetCase.court || "غير محدد"}</div>

                      <div className="bg-stone-50 p-2 font-bold text-stone-600">اسم الموكل لدينا والصفة</div>
                      <div className="bg-white p-2 font-extrabold text-slate-900">{printTargetCase.clientName} <span className="text-stone-500 font-bold">({printTargetCase.clientRole})</span></div>

                      <div className="bg-stone-50 p-2 font-bold text-stone-600">الطرف الخصم والمكتب الممثل</div>
                      <div className="bg-white p-2 font-bold">{printTargetCase.opponentName || "غير محدد"} {printTargetCase.opponentLawyer ? `(بتمثيل: ${printTargetCase.opponentLawyer})` : ""}</div>

                      <div className="bg-stone-50 p-2 font-bold text-stone-600">فضيلة القاضي ناظر الخصومة</div>
                      <div className="bg-white p-2 font-semibold text-slate-800">{printTargetCase.judgeName || "لم يفرز بعد"}</div>

                      <div className="bg-stone-50 p-2 font-bold text-stone-600">مرحلة التقاضي والحالة العامة</div>
                      <div className="bg-white p-2 font-bold"><span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{printTargetCase.progressStage}</span> / <span className="text-emerald-600">{printTargetCase.status}</span></div>
                    </div>
                  </div>

                  {/* القسم 2: ملخص الخلاف الموضوعي والأزمة */}
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-xs text-slate-900 border-r-4 border-amber-500 pr-2 pb-0.5">ثانياً: ملخص النزاع والخلفية القانونية للخصومة</h5>
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {printTargetCase.description || "لا يوجد شرح تفصيلي مسجل للقضية حتى الآن في ملف الأرشفة."}
                    </div>
                  </div>

                  {/* القسم 3: سجل الجلسات القضائية المرتبطة */}
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-xs text-slate-900 border-r-4 border-amber-500 pr-2 pb-0.5">ثالثاً: سجل وحضور الجلسات القضائية الموثقة</h5>
                    {sessions.filter(s => s.caseId === printTargetCase.id).length === 0 ? (
                      <p className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded border border-stone-100">
                        لا توجد جلسات قضائية مرتبطة أو مجدولة مسجلة في ملف هذه القضية حالياً.
                      </p>
                    ) : (
                      <table className="w-full text-right text-xs border border-stone-200">
                        <thead>
                          <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold">
                            <th className="p-2 border-l border-stone-200">المحكمة والدائرة</th>
                            <th className="p-2 border-l border-stone-200">تاريخ الجلسة (ميلادي/هجري)</th>
                            <th className="p-2 border-l border-stone-200">فضيلة القاضي</th>
                            <th className="p-2">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.filter(s => s.caseId === printTargetCase.id).map((s) => (
                            <React.Fragment key={s.id}>
                              <tr className="border-b border-stone-150 bg-white">
                                <td className="p-2 border-l border-stone-200 font-bold text-slate-900">{s.courtName}</td>
                                <td className="p-2 border-l border-stone-200 font-mono text-[10px]">
                                  {s.sessionDateGregorian} م / {s.sessionDateHijri} هـ ({s.time})
                                </td>
                                <td className="p-2 border-l border-stone-200">{s.judgeName || "غير محدد"}</td>
                                <td className="p-2 font-bold text-emerald-600">{s.status}</td>
                              </tr>
                              {includeSessionNotes && (s.notes || s.decisions || s.nextSteps) && (
                                <tr className="bg-stone-50/60 border-b border-stone-200">
                                  <td colSpan={4} className="p-2.5 text-[11px] text-stone-700 leading-relaxed pr-6 border-l border-stone-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {s.notes && (
                                        <div className="space-y-0.5">
                                          <span className="block font-extrabold text-stone-800">📝 ملاحظات الجلسة ومخرجاتها:</span>
                                          <p className="text-stone-600 bg-white p-1.5 rounded border border-stone-150">{s.notes}</p>
                                        </div>
                                      )}
                                      {s.decisions && (
                                        <div className="space-y-0.5">
                                          <span className="block font-extrabold text-amber-950">⚖️ القرارات الصادرة عن الدائرة:</span>
                                          <p className="text-amber-900 bg-amber-50/30 p-1.5 rounded border border-amber-100">{s.decisions}</p>
                                        </div>
                                      )}
                                      {s.nextSteps && (
                                        <div className="space-y-0.5">
                                          <span className="block font-extrabold text-slate-900">📋 الإجراءات والخطوات القادمة المطلوبة:</span>
                                          <p className="text-slate-800 bg-slate-50 p-1.5 rounded border border-stone-200">{s.nextSteps}</p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* القسم 4: المرفقات */}
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-xs text-slate-900 border-r-4 border-amber-500 pr-2 pb-0.5">رابعاً: المستندات والبينات المرفقة بالملف</h5>
                    {printTargetCase.attachments.length === 0 ? (
                      <p className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded border border-stone-100">
                        لم يتم إرفاق أي مستندات أو وثائق قضائية مادية في ملف القضية.
                      </p>
                    ) : (
                      <ul className="list-disc list-inside text-xs text-stone-600 space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200">
                        {printTargetCase.attachments.map((att) => (
                          <li key={att.id} className="font-mono text-[10px]">
                            <span className="font-sans font-bold text-stone-800">{att.name}</span> (الحجم: {att.size} • المودع بتاريخ: {att.uploadDate})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* القسم 5: الموقف المالي */}
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-xs text-slate-900 border-r-4 border-amber-500 pr-2 pb-0.5">خامساً: المحاسبة والموقف المالي للأتعاب المستحقة</h5>
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-stone-500 font-bold text-[10px]">الأتعاب المقررة المتفق عليها</div>
                        <div className="font-bold font-mono text-slate-900 mt-1 text-sm">{printTargetCase.feesTotal.toLocaleString()} ريال يمني</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="text-emerald-700 font-bold text-[10px]">المبلغ المدفوع سلفاً</div>
                        <div className="font-bold font-mono text-emerald-800 mt-1 text-sm">{printTargetCase.feesPaid.toLocaleString()} ريال يمني</div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="text-amber-800 font-bold text-[10px]">الرصيد المتبقي المستحق</div>
                        <div className="font-bold font-mono text-amber-900 mt-1 text-sm">{(printTargetCase.feesTotal - printTargetCase.feesPaid).toLocaleString()} ريال يمني</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* لآوت تقرير جميع القضايا بالمكتب */
                <div className="space-y-6">
                  {/* العنوان */}
                  <div className="text-center py-2 bg-slate-900 text-white rounded-lg border border-amber-500/30">
                    <h3 className="font-extrabold text-sm tracking-tight">تقرير بورتفوليو وجدول القضايا الجارية بالمكتب</h3>
                    <p className="text-[10px] mt-0.5 text-slate-400">إجمالي الحصيلة وسجل النشاط القانوني والموقف المالي الكلي</p>
                  </div>

                  {/* جدول القضايا بالكامل */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[10px] border border-stone-300">
                      <thead>
                        <tr className="bg-stone-100 border-b-2 border-stone-300 text-stone-700 font-black">
                          <th className="p-2 border-l border-stone-300">م</th>
                          <th className="p-2 border-l border-stone-300">رقم القضية</th>
                          <th className="p-2 border-l border-stone-300">عنوان وموضوع القضية</th>
                          <th className="p-2 border-l border-stone-300">النوع</th>
                          <th className="p-2 border-l border-stone-300">الموكل والصفة</th>
                          <th className="p-2 border-l border-stone-300">المحكمة المختصة</th>
                          <th className="p-2 border-l border-stone-300">الحالة</th>
                          <th className="p-2 border-l border-stone-300 text-left">الأتعاب (ريال)</th>
                          <th className="p-2 text-left">المتبقي (ريال)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCases.map((c, idx) => (
                          <tr key={c.id} className="border-b border-stone-200 bg-white">
                            <td className="p-2 border-l border-stone-200 font-mono text-center">{idx + 1}</td>
                            <td className="p-2 border-l border-stone-200 font-mono font-bold text-slate-800">{c.caseNumber}</td>
                            <td className="p-2 border-l border-stone-200 font-bold text-slate-900">{c.title}</td>
                            <td className="p-2 border-l border-stone-200">{c.type}</td>
                            <td className="p-2 border-l border-stone-200 font-medium">{c.clientName} <span className="text-[9px] text-stone-500">({c.clientRole})</span></td>
                            <td className="p-2 border-l border-stone-200 font-medium">{c.court || "غير محدد"}</td>
                            <td className="p-2 border-l border-stone-200 font-semibold text-emerald-600">{c.status}</td>
                            <td className="p-2 border-l border-stone-300 text-left font-mono font-bold">{c.feesTotal.toLocaleString()}</td>
                            <td className="p-2 text-left font-mono font-bold text-amber-700">{(c.feesTotal - c.feesPaid).toLocaleString()}</td>
                          </tr>
                        ))}
                        {/* صف الإجماليات */}
                        <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900 text-left">
                          <td colSpan={7} className="p-2 border-l border-stone-300 text-right font-black text-xs">إجمالي الحصيلة والملخص المالي العام بالمكتب:</td>
                          <td className="p-2 border-l border-stone-300 text-left font-mono">
                            {filteredCases.reduce((acc, c) => acc + c.feesTotal, 0).toLocaleString()}
                          </td>
                          <td className="p-2 text-left font-mono">
                            {filteredCases.reduce((acc, c) => acc + (c.feesTotal - c.feesPaid), 0).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* إحصائيات سريعة */}
                  <div className="grid grid-cols-4 gap-4 pt-2">
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-250 text-center">
                      <div className="text-[10px] text-stone-500 font-bold">عدد القضايا الإجمالي</div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">{filteredCases.length} قضية</div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-250 text-center">
                      <div className="text-[10px] text-stone-500 font-bold">إجمالي الأتعاب المقررة</div>
                      <div className="font-bold text-emerald-700 text-xs mt-0.5">
                        {filteredCases.reduce((acc, c) => acc + c.feesTotal, 0).toLocaleString()} ريال
                      </div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-250 text-center">
                      <div className="text-[10px] text-stone-500 font-bold">إجمالي المبالغ المحصلة</div>
                      <div className="font-bold text-emerald-800 text-xs mt-0.5">
                        {filteredCases.reduce((acc, c) => acc + c.feesPaid, 0).toLocaleString()} ريال
                      </div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-250 text-center">
                      <div className="text-[10px] text-stone-500 font-bold">الديون المستحقة للمكتب</div>
                      <div className="font-bold text-amber-700 text-xs mt-0.5">
                        {filteredCases.reduce((acc, c) => acc + (c.feesTotal - c.feesPaid), 0).toLocaleString()} ريال
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ذيل الصفحة وحقول التوقيع والأختام */}
            <div className="mt-12 pt-8 border-t-2 border-stone-300">
              <div className="flex justify-between items-start text-xs">
                {/* ختم المكتب والشركة */}
                <div className="text-center space-y-4">
                  <span className="font-bold text-stone-600 block text-[11px]">الختم الرسمي لمكتب المحاماة</span>
                  <div className="w-20 h-20 border-2 border-dashed border-stone-350 rounded-full mx-auto flex items-center justify-center text-[9px] text-stone-400">
                    مكان الختم
                  </div>
                </div>

                {/* توقيع المستشار اسم المحامي/المكتب */}
                <div className="text-center space-y-6">
                  <span className="font-bold text-stone-600 block text-[11px]">توقيع المستشار / اسم المحامي/المكتب</span>
                  <div className="font-serif italic text-stone-500 font-black tracking-wider text-xs">
                    عبد الله الوتيحي
                  </div>
                </div>
              </div>

              {/* هامش الاتصال السفلي */}
              <div className="mt-8 text-center text-[9px] text-stone-400 leading-normal border-t border-stone-200 pt-4 font-sans">
                صنعاء - الجمهورية اليمنية • هاتف مكتب الاستشارات: رقم الهاتف • البريد المعتمد: office@example.com <br />
                نظام الأرشفة السحابية الذكي المتكامل • تم طباعته وتأكيده الكترونياً بواسطة اسم المحامي/المكتب
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ADD/EDIT CASE MODAL OVERLAY */}
      {(isAddingNew || isEditing) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <form 
            onSubmit={handleSave} 
            className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[82vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-scale-up text-right"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 rounded-t-3xl border-b border-amber-500 flex justify-between items-center shrink-0">
              <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-400" />
                <span>{isEditing ? "تعديل تفاصيل القضية الحالية" : "تسجيل ملف قضية جديدة"}</span>
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setIsEditing(false);
                }}
                className="text-xs bg-slate-800 hover:bg-slate-750 text-stone-300 py-1.5 px-3 rounded-xl transition-all cursor-pointer font-bold"
              >
                إلغاء وإغلاق
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-right min-h-0 overscroll-contain touch-pan-y">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="font-bold text-stone-700">عنوان القضية أو موضوع النزاع *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: دعوى فسخ عقد بيع أرض ببيت بوس"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">رقم القضية بالمحكمة</label>
                    <input
                      type="text"
                      placeholder="مثلا: 104/تجاري/2026"
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">نوع الاختصاص والفرع القانوني</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as CaseType)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                    >
                      {Object.values(CaseType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {type === CaseType.CRIMINAL && (
                    <div className="space-y-1.5 animate-fadeIn col-span-1 md:col-span-2">
                      <label className="font-bold text-red-600 flex items-center gap-1">
                        <span>تصنيف القضية الجنائية</span>
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-extrabold">(ملفان جنائيان)</span>
                      </label>
                      <select
                        value={criminalSubType}
                        onChange={(e) => setCriminalSubType(e.target.value as any)}
                        className="w-full bg-red-50/10 border border-red-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-red-500 font-bold text-red-950"
                      >
                        <option value="جسيمة">قضية جنائية جسيمة (Felony)</option>
                        <option value="غير جسيمة">قضية جنائية غير جسيمة (Misdemeanor)</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">المحكمة والدائرة القضائية المختصة</label>
                    <input
                      type="text"
                      placeholder="مثال: محكمة استئناف أمانة العاصمة - الدائرة التجارية الثالثة"
                      value={court}
                      onChange={(e) => setCourt(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">اسم موكلنا بالكامل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: يحيى صالح الأهدل"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">صفة موكلنا في الدعوى</label>
                    <select
                      value={clientRole}
                      onChange={(e) => setClientRole(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    >
                      <option value="مدعي">مدعي (الشاكي)</option>
                      <option value="مدعى عليه">مدعى عليه</option>
                      <option value="طرف ثالث">طرف ثالث متداخل</option>
                      <option value="مستأنف">مستأنف</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">اسم الخصم (الطرف الآخر)</label>
                    <input
                      type="text"
                      placeholder="مثال: شركة سبأ العقارية"
                      value={opponentName}
                      onChange={(e) => setOpponentName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">محامي الطرف الخصم للاتصال</label>
                    <input
                      type="text"
                      placeholder="مثال: مكتب الأستاذ فؤاد الحكيمي"
                      value={opponentLawyer}
                      onChange={(e) => setOpponentLawyer(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">القاضي ناظر الخصومة</label>
                    <input
                      type="text"
                      placeholder="مثال: فضيلة القاضي عصام العبيدي"
                      value={judgeName}
                      onChange={(e) => setJudgeName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">حالة ملف القضية بالمكتب</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as CaseStatus)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    >
                      {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">الأتعاب الكلية المحددة مع الموكل (ريال يمني)</label>
                    <input
                      type="number"
                      value={feesTotal}
                      onChange={(e) => setFeesTotal(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-left font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-700">المبلغ المدفوع كدفعة أولى (ريال يمني)</label>
                    <input
                      type="number"
                      value={feesPaid}
                      onChange={(e) => setFeesPaid(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 text-left font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-stone-700">وصف الخلاف القانوني والطلبات المطلوبة بالتفصيل</label>
                  <textarea
                    rows={4}
                    placeholder="بيّن هنا ملخص الأزمة القانونية، الأدلة المبدئية، وتاريخ النزاع المادي..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-stone-50 border-t border-stone-150 p-4 rounded-b-3xl flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setIsEditing(false);
                  }}
                  className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-750 font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                >
                  إلغاء وإغلاق
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer border border-amber-500"
                >
                  {isEditing ? "حفظ التعديلات والتثبيت" : "إضافة وحفظ ملف القضية"}
                </button>
              </div>
          </form>
        </div>
      )}

    </div>
  );
}
