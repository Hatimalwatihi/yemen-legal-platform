/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Folder, FolderOpen, Search, ArrowLeft, Upload, Download, 
  Trash2, Archive, Briefcase, FileText, CheckCircle, Plus, 
  Eye, HelpCircle, FileCheck, RefreshCw, X, Shield, Lock,
  Printer, Scale
} from "lucide-react";
import { LegalCase, Document, Attachment, CaseStatus } from "../types";
import { triggerVoiceNotification } from "../utils/audioNotifier";

interface ArchiveModuleProps {
  cases: LegalCase[];
  documents: Document[];
  onUpdateCase: (updated: LegalCase) => void;
  onUpdateDoc: (updated: Document) => void;
  onAddDoc: (doc: Document) => void;
  currentUser: { username: string; isAdmin?: boolean } | null;
}

export default function ArchiveModule({
  cases,
  documents,
  onUpdateCase,
  onUpdateDoc,
  onAddDoc,
  currentUser
}: ArchiveModuleProps) {
  const [activeFolder, setActiveFolder] = useState<"none" | "cases" | "deeds" | "contracts">("none");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals / Details states
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showAddDocForm, setShowAddDocForm] = useState(false);

  // Report States
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<"none" | "cases" | "deeds" | "contracts" | "all">("none");

  // Form states for archiving new documents directly in the folder
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; mimeType: string; base64Data: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Filter archived items
  const archivedCases = cases.filter(c => c.status === CaseStatus.CLOSED);
  
  // Deeds folder contains documents of type "بصيرة" (marked isArchived or just of that category as it's inherently an archival/proof document)
  const archivedDeeds = documents.filter(d => d.docType === "بصيرة" || (d.docType === "بصيرة" && d.isArchived));
  const unarchivedDeeds = documents.filter(d => d.docType === "بصيرة" && !d.isArchived);

  // Contracts folder contains documents of type "عقد" that are marked as archived
  const archivedContracts = documents.filter(d => d.docType === "عقد" && d.isArchived);
  const unarchivedContracts = documents.filter(d => d.docType === "عقد" && !d.isArchived);

  const totalArchivedCount = archivedCases.length + archivedDeeds.length + archivedContracts.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ عذراً، حجم الملف كبير جداً. يرجى اختيار ملف بحجم أقل من 5 ميجابايت.");
      return;
    }

    setUploadProgress(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const approxSizeKb = Math.ceil((reader.result.length * 3) / 4 / 1024);
        setUploadedFile({
          name: file.name,
          size: `${approxSizeKb} KB`,
          mimeType: file.type,
          base64Data: reader.result
        });
        triggerVoiceNotification("تم تحميل الملف بنجاح للتخزين بالأرشيف.");
      }
      setUploadProgress(false);
    };
    reader.onerror = () => {
      alert("فشل في قراءة ملف التنزيل.");
      setUploadProgress(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateArchivedDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) {
      alert("يرجى إدخال عنوان للمستند المؤرشف.");
      return;
    }

    const folderType = activeFolder === "deeds" ? "بصيرة" : "عقد";
    
    // Attachments conversion
    const attachments: Attachment[] = [];
    if (uploadedFile) {
      attachments.push({
        id: "att_arch_" + Date.now(),
        name: uploadedFile.name,
        size: uploadedFile.size,
        mimeType: uploadedFile.mimeType,
        base64Data: uploadedFile.base64Data,
        uploadDate: new Date().toISOString().split("T")[0]
      });
    }

    const newDoc: Document = {
      id: "doc_arch_" + Date.now(),
      title: newDocTitle,
      content: newDocContent || `مستند مؤرشف بتاريخ ${new Date().toLocaleDateString("ar-YE")}`,
      docType: folderType,
      lastModified: new Date().toISOString().split("T")[0],
      attachments: attachments,
      isArchived: true,
      archivedAt: new Date().toISOString().split("T")[0]
    };

    onAddDoc(newDoc);
    setNewDocTitle("");
    setNewDocContent("");
    setUploadedFile(null);
    setShowAddDocForm(false);
    triggerVoiceNotification("تمت أرشفة وتوثيق الملف وحفظه بالأرشيف العدلي الحصين!");
  };

  const handleArchiveExistingDoc = (doc: Document) => {
    const updated = {
      ...doc,
      isArchived: true,
      archivedAt: new Date().toISOString().split("T")[0]
    };
    onUpdateDoc(updated);
    triggerVoiceNotification("تم نقل المستند إلى الأرشيف الحصين.");
  };

  const handleUnarchiveDoc = (doc: Document) => {
    const updated = {
      ...doc,
      isArchived: false,
      archivedAt: undefined
    };
    onUpdateDoc(updated);
    triggerVoiceNotification("تم إلغاء أرشفة المستند وإعادته للمكتبات النشطة.");
  };

  const handleUnarchiveCase = (legalCase: LegalCase) => {
    const updated = {
      ...legalCase,
      status: CaseStatus.ACTIVE
    };
    onUpdateCase(updated);
    triggerVoiceNotification("تم إلغاء أرشفة القضية وإعادتها لجدول القضايا النشطة.");
  };

  // Safe routine to download documents directly formatted for Word
  const downloadDocAsWord = (doc: Document) => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${doc.title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; padding: 25px; line-height: 1.6; }
          h2 { text-align: center; color: #0f172a; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h2>${doc.title}</h2>
        <div style="white-space: pre-wrap; text-align: justify;">
          ${doc.content.replace(/\n/g, '<br/>')}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6" id="archive-module-root" dir="rtl">
      
      {/* 1. Header & Quick Analytics */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-amber-500/30 p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/15 p-2 rounded-xl text-amber-400 border border-amber-500/20">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">الخزنة والأرشيف العدلي المغلق</h1>
          </div>
          <p className="text-slate-400 text-xs font-semibold">
            حفظ وأرشفة ملفات القضايا المغلقة، البصائر الشرعية لملكية العقارات، والعقود والاتفاقيات المصادقة في مجمع المحاكم.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setShowReportDialog(true);
              setSelectedReportType("none");
              triggerVoiceNotification("تم فتح نافذة إصدار التقارير للأرشيف العدلي.");
            }}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer border border-amber-400"
          >
            <FileText className="h-4 w-4 text-slate-950" />
            <span>تقارير الأرشيف العدلي 📊</span>
          </button>

          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-bold">الملفات والمجلدات المؤرشفة</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">{totalArchivedCount}</span>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-bold">قضايا محكومة</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">{archivedCases.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Folders Dashboard */}
      {activeFolder === "none" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Folder 1: القضايا المؤرشفة */}
          <div 
            onClick={() => {
              setActiveFolder("cases");
              setSearchQuery("");
            }}
            className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-amber-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-right group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-1 w-full bg-blue-500" />
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Folder className="h-8 w-8 fill-blue-100" />
              </div>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-extrabold font-mono">
                {archivedCases.length} ملف
              </span>
            </div>
            <h3 className="text-md font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">مجلد القضايا المؤرشفة</h3>
            <p className="text-stone-500 text-xs mt-2 font-medium leading-relaxed">
              يحتوي على كافة القضايا التي تم الحكم فيها نهائياً وصدر بها صك التنفيذ وتم ترحيل ملفاتها من الجدول اليومي لسرية البيانات وأمان المحكمة.
            </p>
          </div>

          {/* Folder 2: البصائر المؤرشفة */}
          <div 
            onClick={() => {
              setActiveFolder("deeds");
              setSearchQuery("");
            }}
            className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-amber-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-right group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-1 w-full bg-emerald-500" />
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Folder className="h-8 w-8 fill-emerald-100" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-extrabold font-mono">
                {archivedDeeds.length} وثيقة
              </span>
            </div>
            <h3 className="text-md font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">مجلد البصائر المؤرشفة</h3>
            <p className="text-stone-500 text-xs mt-2 font-medium leading-relaxed">
              بصائر الشراء، وثائق التمليك الشرعية المعمدة، حصر الإرث العائلي، وفصول القسمة الموثقة قديماً وحديثاً لحفظ الأصول العقارية.
            </p>
          </div>

          {/* Folder 3: العقود المؤرشفة */}
          <div 
            onClick={() => {
              setActiveFolder("contracts");
              setSearchQuery("");
            }}
            className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-amber-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-right group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-1 w-full bg-amber-500" />
            <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Folder className="h-8 w-8 fill-amber-100" />
              </div>
              <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-extrabold font-mono">
                {archivedContracts.length} عقد
              </span>
            </div>
            <h3 className="text-md font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">مجلد العقود المؤرشفة</h3>
            <p className="text-stone-500 text-xs mt-2 font-medium leading-relaxed">
              عقود الإيجار المنتهية، اتفاقيات الشراكة التجارية المغلقة، ومذكرات التفاهم المحسومة ودياً مع التوقيع والشهود والتوثيق المالي.
            </p>
          </div>

        </div>
      )}

      {/* 3. Folder Explorer View */}
      {activeFolder !== "none" && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Explorer Toolbar / Breadcrumbs */}
          <div className="bg-slate-50 p-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setActiveFolder("none");
                  setShowAddDocForm(false);
                }}
                className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors flex items-center gap-1 text-xs font-bold border border-stone-200 bg-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>الرجوع للمجلدات الرئيسية</span>
              </button>
              <div className="h-4 w-px bg-stone-300" />
              <div className="flex items-center gap-1.5">
                <FolderOpen className={`h-5 w-5 ${
                  activeFolder === "cases" ? "text-blue-500" : activeFolder === "deeds" ? "text-emerald-500" : "text-amber-500"
                }`} />
                <span className="text-sm font-extrabold text-slate-900">
                  {activeFolder === "cases" && "مجلد القضايا المؤرشفة"}
                  {activeFolder === "deeds" && "مجلد البصائر المؤرشفة (السجل العقاري)"}
                  {activeFolder === "contracts" && "مجلد العقود والاتفاقيات المؤرشفة"}
                </span>
              </div>
            </div>

            {/* Folder Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، الرقم، أو الموكل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-200 pr-9 pl-4 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              
              {activeFolder !== "cases" && (
                <button
                  onClick={() => setShowAddDocForm(prev => !prev)}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>أرشفة مستند جديد</span>
                </button>
              )}
            </div>
          </div>

          {/* Add Archived Doc Form */}
          {showAddDocForm && activeFolder !== "cases" && (
            <form onSubmit={handleCreateArchivedDoc} className="p-6 bg-amber-50/40 border-b border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Archive className="h-4 w-4 text-amber-600" />
                  <span>تعبئة بطاقة مستند جديد للأرشيف الحصين</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowAddDocForm(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">اسم أو عنوان المستند (مثال: بصيرة شراء بقعة جدر للموكل اليماني)</label>
                  <input
                    type="text"
                    required
                    placeholder="العنوان التعريفي للوثيقة..."
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="w-full bg-white border border-stone-200 p-2.5 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">إلحاق ملف ممسوح ضوئياً (صورة أو PDF للأرشيف)</label>
                  <div className="flex items-center gap-2">
                    <label className="bg-white border border-stone-200 px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-stone-50 font-bold text-[11px] border-dashed">
                      <Upload className="h-4 w-4 text-stone-500" />
                      <span>{uploadedFile ? "تغيير الملف المختار" : "اختر ملف وثيقة"}</span>
                      <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                    </label>
                    {uploadedFile && (
                      <span className="text-[10px] text-emerald-600 font-bold truncate flex-1">
                        ✔️ {uploadedFile.name} ({uploadedFile.size})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-stone-700">تفريغ محتوى الوثيقة أو الملاحظات الجوهرية عليها</label>
                <textarea
                  placeholder="اكتب هنا كامل النص الشرعي المكتوب في البصيرة أو بنود العقد، والشهود والحدود..."
                  rows={4}
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="w-full bg-white border border-stone-200 p-2.5 rounded-xl font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocForm(false)}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploadProgress}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-extrabold"
                >
                  {uploadProgress ? "جاري المعالجة..." : "إيداع وتوثيق في الأرشيف"}
                </button>
              </div>
            </form>
          )}

          {/* List Section of Folder items */}
          <div className="flex-1 p-6">
            
            {/* Folder 1 View: CASES */}
            {activeFolder === "cases" && (
              <div className="space-y-4">
                {archivedCases.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <Briefcase className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-stone-500">مجلد القضايا المؤرشفة فارغ حالياً.</p>
                    <p className="text-xs text-stone-400 mt-1">تظهر هنا القضايا بعد تغيير حالتها إلى "مؤرشفة" من قسم إدارة القضايا.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-stone-200 rounded-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold">
                        <tr>
                          <th className="p-3">رقم القضية</th>
                          <th className="p-3">موضوع وملف الخصومة القضائية</th>
                          <th className="p-3">المحكمة المختصة</th>
                          <th className="p-3">الموكل الخصم</th>
                          <th className="p-3">المرفقات المؤرشفة</th>
                          <th className="p-3 text-center">العمليات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
                        {archivedCases
                          .filter(c => c.title.includes(searchQuery) || c.caseNumber.includes(searchQuery) || c.clientName.includes(searchQuery))
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono text-blue-600 font-bold">{c.caseNumber}</td>
                              <td className="p-3 max-w-xs">
                                <span className="block font-bold text-slate-900 truncate">{c.title}</span>
                                <span className="text-[10px] text-stone-400 block mt-0.5">النوع: {c.type}</span>
                              </td>
                              <td className="p-3 text-stone-500">{c.court}</td>
                              <td className="p-3">
                                <span className="block font-bold text-slate-800">{c.clientName}</span>
                                <span className="text-[10px] text-red-500">ضد: {c.opponentName}</span>
                              </td>
                              <td className="p-3 text-stone-500 font-mono text-center">
                                <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                  {c.attachments?.length || 0} ملف
                                </span>
                              </td>
                              <td className="p-3 text-center flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedCase(c)}
                                  className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                                  title="عرض ملف القضية والمستندات الملحقة"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>عرض الخرائط والملفات</span>
                                </button>
                                <button
                                  onClick={() => handleUnarchiveCase(c)}
                                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                                  title="إلغاء أرشفة القضية وإعادتها للجدول النشط"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  <span>إخراج من الأرشيف</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Folder 2 View: DEEDS (البصائر) */}
            {activeFolder === "deeds" && (
              <div className="space-y-6">
                
                {/* Section 1: Archived Deeds */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <FileCheck className="h-4 w-4 text-emerald-600" />
                    <span>البصائر الشرعية ووثائق الأصول المؤرشفة ({archivedDeeds.length})</span>
                  </h4>
                  
                  {archivedDeeds.length === 0 ? (
                    <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
                      لا توجد بصائر مؤرشفة في الأرشيف حالياً. يمكنك أرشفة مستند جديد أعلاه.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {archivedDeeds
                        .filter(d => d.title.includes(searchQuery) || d.content.includes(searchQuery))
                        .map((doc) => (
                          <div key={doc.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500 transition-colors">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-extrabold">بصيرة شرعية</span>
                                <span className="text-[10px] text-stone-400 font-mono font-bold">تاريخ التعديل: {doc.lastModified.split("T")[0]}</span>
                              </div>
                              <h5 className="font-extrabold text-slate-900 text-xs truncate mt-2">{doc.title}</h5>
                              <p className="text-[11px] text-stone-500 line-clamp-3 leading-relaxed mt-1 font-mono">{doc.content}</p>
                            </div>

                            <div className="border-t border-stone-200/60 mt-4 pt-3 flex justify-between items-center">
                              <span className="text-[10px] text-stone-400 font-mono font-bold flex items-center gap-1">
                                📎 {doc.attachments?.length || 0} مرفقات ممسوحة ضوئياً
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedDoc(doc)}
                                  className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 p-1.5 rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer font-bold"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>مراجعة</span>
                                </button>
                                <button
                                  onClick={() => downloadDocAsWord(doc)}
                                  className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 p-1.5 rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer font-bold"
                                  title="تصدير المستند كملف وورد (.doc)"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>وورد</span>
                                </button>
                                <button
                                  onClick={() => handleUnarchiveDoc(doc)}
                                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 p-1.5 rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer font-bold"
                                  title="فك الأرشفة"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  <span>فك الأرشفة</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Active Deeds that can be archived */}
                {unarchivedDeeds.length > 0 && (
                  <div className="border-t border-stone-200 pt-6 space-y-3">
                    <h4 className="text-xs font-bold text-stone-500 flex items-center gap-1">
                      <Archive className="h-4 w-4 text-stone-400" />
                      <span>بصائر مسجلة بالمكتب غير مؤرشفة يمكن إيداعها بالأرشيف ({unarchivedDeeds.length})</span>
                    </h4>
                    
                    <div className="bg-stone-50 rounded-xl p-3 divide-y divide-stone-200/50">
                      {unarchivedDeeds.map(doc => (
                        <div key={doc.id} className="py-2.5 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 truncate max-w-md">{doc.title}</span>
                          <button
                            onClick={() => handleArchiveExistingDoc(doc)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-3 py-1 rounded-lg text-[10px] flex items-center gap-1"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            <span>أرشفة وإيداع بالخزنة الآن</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Folder 3 View: CONTRACTS (العقود) */}
            {activeFolder === "contracts" && (
              <div className="space-y-6">
                
                {/* Section 1: Archived Contracts */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <FileCheck className="h-4 w-4 text-amber-600" />
                    <span>عقود واتفاقيات شراكة مؤرشفة بالأرشيف الحصين ({archivedContracts.length})</span>
                  </h4>
                  
                  {archivedContracts.length === 0 ? (
                    <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
                      لا توجد عقود مغلقة مؤرشفة بالأرشيف حالياً. يمكنك أرشفة مستند جديد أو إيداع عقد ساري أعلاه.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {archivedContracts
                        .filter(d => d.title.includes(searchQuery) || d.content.includes(searchQuery))
                        .map((doc) => (
                          <div key={doc.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500 transition-colors">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded text-[9px] font-extrabold">عقد / اتفاق مؤرشف</span>
                                <span className="text-[10px] text-stone-400 font-mono font-bold">مؤرشف منذ: {doc.archivedAt || doc.lastModified.split("T")[0]}</span>
                              </div>
                              <h5 className="font-extrabold text-slate-900 text-xs truncate mt-2">{doc.title}</h5>
                              <p className="text-[11px] text-stone-500 line-clamp-3 leading-relaxed mt-1 font-mono">{doc.content}</p>
                            </div>

                            <div className="border-t border-stone-200/60 mt-4 pt-3 flex justify-between items-center">
                              <span className="text-[10px] text-stone-400 font-mono font-bold flex items-center gap-1">
                                📎 {doc.attachments?.length || 0} ملف مرفق
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedDoc(doc)}
                                  className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 p-1.5 rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer font-bold"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>مراجعة</span>
                                </button>
                                <button
                                  onClick={() => downloadDocAsWord(doc)}
                                  className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 p-1.5 rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer font-bold"
                                  title="تصدير العقد كملف وورد (.doc)"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>وورد</span>
                                </button>
                                <button
                                  onClick={() => handleUnarchiveDoc(doc)}
                                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 p-1.5 rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer font-bold"
                                  title="إخراج من الأرشيف"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  <span>فك الأرشفة</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Active Contracts that can be archived */}
                {unarchivedContracts.length > 0 && (
                  <div className="border-t border-stone-200 pt-6 space-y-3">
                    <h4 className="text-xs font-bold text-stone-500 flex items-center gap-1">
                      <Archive className="h-4 w-4 text-stone-400" />
                      <span>عقود جارية بالمكتب يمكن ترحيلها وأرشفتها عند إتمام الغرض ({unarchivedContracts.length})</span>
                    </h4>
                    
                    <div className="bg-stone-50 rounded-xl p-3 divide-y divide-stone-200/50">
                      {unarchivedContracts.map(doc => (
                        <div key={doc.id} className="py-2.5 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 truncate max-w-md">{doc.title}</span>
                          <button
                            onClick={() => handleArchiveExistingDoc(doc)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3 py-1 rounded-lg text-[10px] flex items-center gap-1"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            <span>ترحيل للأرشيف الآن</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. DETAILS MODAL / DRAWER FOR SELECTED CASE */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col text-right shadow-2xl">
            <div className="bg-slate-900 text-white p-4 border-b border-amber-500/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold ml-2">قضية مؤرشفة</span>
                <span className="font-mono text-xs font-bold text-slate-300">رقم القضية: {selectedCase.caseNumber}</span>
              </div>
              <button onClick={() => setSelectedCase(null)} className="p-1 hover:bg-white/15 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{selectedCase.title}</h3>
              <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">الموكل وموقعه القضائي</span>
                  <span className="font-bold text-slate-800">{selectedCase.clientName} ({selectedCase.clientRole})</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">الخصم والمحامي المقابل</span>
                  <span className="font-bold text-red-600">{selectedCase.opponentName}</span>
                  <span className="text-[10px] block text-stone-400">{selectedCase.opponentLawyer || "لا يوجد وكيل معروف"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">المحكمة ناظرة الخصومة</span>
                  <span className="font-bold text-stone-700">{selectedCase.court}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">اسم القاضي المسجل</span>
                  <span className="font-bold text-stone-700">{selectedCase.judgeName || "غير محدد"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-stone-800">تفاصيل وسياق القضية القانونية:</h4>
                <p className="text-stone-600 leading-relaxed font-medium bg-stone-50 p-3 rounded-lg border border-stone-200/50">{selectedCase.description}</p>
              </div>

              {/* Attachments Section in Modal */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>المرفقات ووثائق الإثبات المودعة بالأرشيف ({selectedCase.attachments?.length || 0})</span>
                </h4>
                
                {selectedCase.attachments?.length === 0 ? (
                  <p className="text-[10px] text-stone-400 bg-stone-50 p-4 rounded text-center">لا توجد ملفات أو فصول ممسوحة ضوئياً مرفقة بهذه القضية.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCase.attachments?.map((att) => (
                      <div key={att.id} className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg flex justify-between items-center">
                        <div className="space-y-0.5 truncate flex-1 pl-2">
                          <span className="font-bold text-slate-800 text-[11px] block truncate" title={att.name}>{att.name}</span>
                          <span className="text-[9px] text-stone-400 font-mono block">الحجم: {att.size} • المرفق: {att.uploadDate}</span>
                        </div>
                        {att.base64Data ? (
                          <a 
                            href={att.base64Data} 
                            download={att.name} 
                            className="bg-white hover:bg-stone-100 border border-stone-200 p-1.5 rounded-lg text-stone-600 text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>تحميل</span>
                          </a>
                        ) : (
                          <span className="text-[9px] text-stone-400 italic">محفوظ سحابياً</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCase(null)}
                className="bg-slate-900 hover:bg-slate-950 text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DETAILS MODAL FOR SELECTED DOCUMENT (Deed / Contract) */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col text-right shadow-2xl">
            <div className="bg-slate-900 text-white p-4 border-b border-amber-500/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold ml-2">
                  {selectedDoc.docType === "بصيرة" ? "بصيرة مؤرشفة" : "عقد مؤرشف"}
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">أرشيف المحامي الوتيحي</span>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 hover:bg-white/15 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{selectedDoc.title}</h3>
              
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 block font-bold">النص والبيان الشرعي الموثق:</span>
                <div className="bg-amber-50/20 border border-stone-200 p-4 rounded-xl font-mono text-stone-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-text text-justify">
                  {selectedDoc.content}
                </div>
              </div>

              {/* Attachments Section in Modal */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  <span>النسخ المصورة والمرفقات بالأرشيف ({selectedDoc.attachments?.length || 0})</span>
                </h4>
                
                {selectedDoc.attachments?.length === 0 ? (
                  <p className="text-[10px] text-stone-400 bg-stone-50 p-4 rounded text-center">لا توجد صور أو ملفات ممسوحة ضوئياً مرفقة.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDoc.attachments?.map((att) => (
                      <div key={att.id} className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg flex justify-between items-center">
                        <div className="space-y-0.5 truncate flex-1 pl-2">
                          <span className="font-bold text-slate-800 text-[11px] block truncate" title={att.name}>{att.name}</span>
                          <span className="text-[9px] text-stone-400 font-mono block">الحجم: {att.size} • المرفق: {att.uploadDate}</span>
                        </div>
                        {att.base64Data ? (
                          <div className="flex items-center gap-1">
                            <a 
                              href={att.base64Data} 
                              download={att.name} 
                              className="bg-white hover:bg-stone-100 border border-stone-200 p-1 rounded text-[9px] font-bold"
                            >
                              تحميل
                            </a>
                          </div>
                        ) : (
                          <span className="text-[9px] text-stone-400 italic">محفوظ سحابياً</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-between items-center">
              <button
                onClick={() => downloadDocAsWord(selectedDoc)}
                className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span>تحميل ملف Word (.doc)</span>
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="bg-slate-900 hover:bg-slate-950 text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. JUDICIAL ARCHIVE REPORTS MODAL */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col text-right shadow-2xl transition-all duration-300">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-4 border-b border-amber-500/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-slate-100">نظام إصدار التقارير العدلية للأرشيف المغلق</h3>
              </div>
              <button 
                onClick={() => {
                  setShowReportDialog(false);
                  setSelectedReportType("none");
                }} 
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
              
              {/* Option Selection View */}
              {selectedReportType === "none" ? (
                <div className="space-y-6">
                  <div className="text-center max-w-lg mx-auto space-y-2">
                    <h4 className="text-slate-900 font-extrabold text-sm sm:text-base">يرجى تحديد نوع التقرير المطلوب تصديره من الأرشيف:</h4>
                    <p className="text-stone-500 text-xs font-semibold">
                      سيقوم النظام بتوليد بطاقات وتقارير رسمية مفصلة تحتوي على بيانات الملفات وتاريخ أرشفتها لتسهيل طباعتها أو حفظها.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    
                    {/* Option 1: Archived Cases */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReportType("cases");
                        triggerVoiceNotification("تم توليد تقرير القضايا المؤرشفة بنجاح.");
                      }}
                      className="bg-white hover:bg-amber-50/40 border border-stone-200 hover:border-amber-400 rounded-2xl p-5 text-right shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:scale-105 transition-transform">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">١. هل تريد تقرير بلغاريا (القضايا) التي تم ارشفتها؟</h5>
                        <p className="text-stone-500 text-[11px] leading-relaxed font-semibold">
                          تقرير تفصيلي بالقضايا المحكومة والمرحلة للأرشيف شاملة الأطراف، المحكمة، والرسوم وتاريخ الأرشفة.
                        </p>
                        <span className="inline-block bg-blue-50 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-2">
                          {archivedCases.length} قضية مؤرشفة
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Archived Deeds */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReportType("deeds");
                        triggerVoiceNotification("تم توليد تقرير البصائر الشرعية المؤرشفة.");
                      }}
                      className="bg-white hover:bg-amber-50/40 border border-stone-200 hover:border-amber-400 rounded-2xl p-5 text-right shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl group-hover:scale-105 transition-transform">
                        <Folder className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">٢. هل تريد تقرير بلبصائر التي تم ارشفتها؟</h5>
                        <p className="text-stone-500 text-[11px] leading-relaxed font-semibold">
                          تقرير تفصيلي ببصائر البيع والشراء ووثائق الأصول الشرعية وسندات التمليك العقاري وأرشيفها الملحق.
                        </p>
                        <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-2">
                          {archivedDeeds.length} وثيقة وبصيرة
                        </span>
                      </div>
                    </button>

                    {/* Option 3: Archived Contracts */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReportType("contracts");
                        triggerVoiceNotification("تم توليد تقرير العقود والاتفاقيات المؤرشفة.");
                      }}
                      className="bg-white hover:bg-amber-50/40 border border-stone-200 hover:border-amber-400 rounded-2xl p-5 text-right shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="bg-amber-50 text-amber-600 p-3 rounded-xl group-hover:scale-105 transition-transform">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">٣. هل تريد تقرير بالعقود التي تم ارشفتها؟</h5>
                        <p className="text-stone-500 text-[11px] leading-relaxed font-semibold">
                          سجل وتعداد عقود الإيجار، التنازلات، مذكرات الاتفاق المصادقة والمسح الضوئي المرفق لها.
                        </p>
                        <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-2">
                          {archivedContracts.length} عقد مؤرشف
                        </span>
                      </div>
                    </button>

                    {/* Option 4: Comprehensive Report */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReportType("all");
                        triggerVoiceNotification("تم توليد التقرير العدلي الشامل للأرشيف الحصين.");
                      }}
                      className="bg-white hover:bg-amber-50/40 border border-stone-200 hover:border-amber-400 rounded-2xl p-5 text-right shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="bg-slate-900 text-amber-400 p-3 rounded-xl group-hover:scale-105 transition-transform">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">٤. هل تريد تقرير شامل لجميع الملفات والوثائق المؤرشفة؟</h5>
                        <p className="text-stone-500 text-[11px] leading-relaxed font-semibold">
                          تقرير متكامل يجمع القضايا والبصائر والعقود والوثائق المودعة في الخزنة الحديدية للبحث والمراجعة والفرز السنوي.
                        </p>
                        <span className="inline-block bg-slate-900 text-amber-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-2">
                          {totalArchivedCount} ملف مؤرشف كلي
                        </span>
                      </div>
                    </button>

                  </div>
                </div>
              ) : (
                
                /* Printable Preview Sheets */
                <div className="space-y-6">
                  
                  {/* The A4 Sheet */}
                  <div id="printable-archive-report-sheet" className="bg-white border-2 border-slate-950 p-8 sm:p-10 shadow-lg rounded-xl text-slate-900 font-sans relative">
                    
                    {/* Traditional Border Accents */}
                    <div className="absolute inset-2 border border-slate-300 pointer-events-none" />
                    <div className="absolute inset-3 border-2 border-double border-slate-950 pointer-events-none" />

                    {/* Yemen/Judicial Header style */}
                    <div className="flex justify-between items-center border-b-2 border-slate-950 pb-6 mb-6">
                      <div className="text-right space-y-1 text-[10px] sm:text-xs">
                        <h4 className="font-extrabold text-slate-950">الجمهورية اليمنية</h4>
                        <p className="font-semibold text-stone-600">وزارة العدل / السجل العقاري والتوثيق</p>
                        <p className="font-semibold text-slate-900 font-bold">مكتب المحاماة وصنعاء</p>
                        <p className="font-mono text-[9px] text-stone-400">تاريخ الطباعة: {new Date().toLocaleDateString("ar-YE")} {new Date().toLocaleTimeString("ar-YE")}</p>
                      </div>

                      {/* Traditional Shield emblem */}
                      <div className="text-center shrink-0">
                        <div className="border border-slate-950 rounded-full p-2 bg-stone-50 inline-block mb-1">
                          <Scale className="h-8 w-8 text-slate-950" />
                        </div>
                        <h3 className="text-[10px] font-black tracking-widest text-slate-950">الأرشيف العدلي المغلق</h3>
                        <span className="text-[9px] bg-slate-950 text-white px-2 py-0.5 rounded font-bold">تقرير رسمي</span>
                      </div>

                      <div className="text-left space-y-1 text-[10px] sm:text-xs">
                        <h4 className="font-extrabold text-slate-950">تقرير أرشفة وتوثيق</h4>
                        <p className="font-bold text-amber-850">النوع: {
                          selectedReportType === "cases" ? "ملفات القضايا المحكومة" :
                          selectedReportType === "deeds" ? "البصائر العقارية والأصول" :
                          selectedReportType === "contracts" ? "العقود والاتفاقيات المصادقة" : "أرشيف عام شامل"
                        }</p>
                        <p className="font-bold text-slate-900">المرجع: {selectedReportType.toUpperCase()}-{Date.now().toString().slice(-6)}</p>
                      </div>
                    </div>

                    {/* Report Title */}
                    <div className="text-center my-6">
                      <h2 className="text-sm sm:text-base font-black underline underline-offset-8 decoration-double decoration-slate-950">
                        {selectedReportType === "cases" && "كشف تفصيلي بالقضايا والمحاكمات المؤرشفة والمنتهية"}
                        {selectedReportType === "deeds" && "سجل حصر البصائر العقارية الشرعية ووثائق الأصول المودعة سحابياً"}
                        {selectedReportType === "contracts" && "سجل الاتفاقيات وعقود التراضي المبرمة والمؤرشفة بالخزنة"}
                        {selectedReportType === "all" && "السجل العام الشامل لجميع موجودات الأرشيف العدلي المغلق"}
                      </h2>
                      <p className="text-[10px] text-stone-600 font-semibold mt-2">
                        صادر عن مجمع المحاضر والوثائق بمكتب المحامي الوتيحي كمرجع معتمد ومثبت لتواريخ التوثيق.
                      </p>
                    </div>

                    {/* 1. SECTION: CASES (when cases or all is selected) */}
                    {(selectedReportType === "cases" || selectedReportType === "all") && (
                      <div className="space-y-4 my-6">
                        <h3 className="text-xs font-black bg-slate-950 text-white px-3 py-1.5 rounded flex justify-between items-center">
                          <span>📊 قسم ملفات القضايا المحكومة والمؤرشفة</span>
                          <span className="text-[10px] font-mono">{archivedCases.length} قضية</span>
                        </h3>

                        {archivedCases.length === 0 ? (
                          <p className="text-center py-4 text-xs text-stone-400 bg-stone-50 border border-stone-200 border-dashed rounded-lg">لا توجد قضايا مؤرشفة حالياً في السجلات.</p>
                        ) : (
                          <table className="w-full text-right text-xs border-collapse border border-slate-900">
                            <thead>
                              <tr className="bg-stone-100 text-slate-900 font-bold border-b border-slate-900 text-[10px] sm:text-[11px]">
                                <th className="p-2 border border-slate-900 text-center w-12">م</th>
                                <th className="p-2 border border-slate-900 w-24">رقم القضية</th>
                                <th className="p-2 border border-slate-900">موضوع ملف النزاع القضائي</th>
                                <th className="p-2 border border-slate-900 w-24">الموكل / الخصم</th>
                                <th className="p-2 border border-slate-900 w-32">المحكمة المختصة</th>
                                <th className="p-2 border border-slate-900 text-center w-24">تاريخ الأرشفة والتوثيق</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-400 text-stone-800 text-[10px] sm:text-[11px] font-medium">
                              {archivedCases.map((c, idx) => (
                                <tr key={c.id}>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{idx + 1}</td>
                                  <td className="p-2 border border-slate-900 font-mono text-blue-800 font-bold">{c.caseNumber}</td>
                                  <td className="p-2 border border-slate-900 font-bold text-slate-900">{c.title}</td>
                                  <td className="p-2 border border-slate-900">
                                    <span className="font-bold block">{c.clientName}</span>
                                    <span className="text-[9px] text-red-600 block">ضد: {c.opponentName}</span>
                                  </td>
                                  <td className="p-2 border border-slate-900">{c.court}</td>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{c.startDate || "2026-07-03"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {/* 2. SECTION: DEEDS (when deeds or all is selected) */}
                    {(selectedReportType === "deeds" || selectedReportType === "all") && (
                      <div className="space-y-4 my-6">
                        <h3 className="text-xs font-black bg-slate-950 text-white px-3 py-1.5 rounded flex justify-between items-center">
                          <span>📜 قسم البصائر الشرعية وسندات ملكية العقارات والأصول</span>
                          <span className="text-[10px] font-mono">{archivedDeeds.length} وثيقة</span>
                        </h3>

                        {archivedDeeds.length === 0 ? (
                          <p className="text-center py-4 text-xs text-stone-400 bg-stone-50 border border-stone-200 border-dashed rounded-lg">لا توجد بصائر عقارية مؤرشفة في السجلات.</p>
                        ) : (
                          <table className="w-full text-right text-xs border-collapse border border-slate-900">
                            <thead>
                              <tr className="bg-stone-100 text-slate-900 font-bold border-b border-slate-900 text-[10px] sm:text-[11px]">
                                <th className="p-2 border border-slate-900 text-center w-12">م</th>
                                <th className="p-2 border border-slate-900">اسم وموضوع البصيرة الشرعية</th>
                                <th className="p-2 border border-slate-900">موجز النص والحدود المكتوبة</th>
                                <th className="p-2 border border-slate-900 text-center w-20">المرفقات</th>
                                <th className="p-2 border border-slate-900 text-center w-28">تاريخ المعالجة والأرشفة</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-400 text-stone-800 text-[10px] sm:text-[11px] font-medium">
                              {archivedDeeds.map((d, idx) => (
                                <tr key={d.id}>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{idx + 1}</td>
                                  <td className="p-2 border border-slate-900 font-bold text-slate-900">{d.title}</td>
                                  <td className="p-2 border border-slate-900 max-w-xs font-mono text-[9px] truncate">{d.content}</td>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{d.attachments?.length || 0} ملف</td>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{d.archivedAt || d.lastModified}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {/* 3. SECTION: CONTRACTS (when contracts or all is selected) */}
                    {(selectedReportType === "contracts" || selectedReportType === "all") && (
                      <div className="space-y-4 my-6">
                        <h3 className="text-xs font-black bg-slate-950 text-white px-3 py-1.5 rounded flex justify-between items-center">
                          <span>✍️ قسم العقود التجارية وعقود الإيجار والاتفاقيات المؤرشفة</span>
                          <span className="text-[10px] font-mono">{archivedContracts.length} عقد</span>
                        </h3>

                        {archivedContracts.length === 0 ? (
                          <p className="text-center py-4 text-xs text-stone-400 bg-stone-50 border border-stone-200 border-dashed rounded-lg">لا توجد عقود مغلقة مؤرشفة حالياً.</p>
                        ) : (
                          <table className="w-full text-right text-xs border-collapse border border-slate-900">
                            <thead>
                              <tr className="bg-stone-100 text-slate-900 font-bold border-b border-slate-900 text-[10px] sm:text-[11px]">
                                <th className="p-2 border border-slate-900 text-center w-12">م</th>
                                <th className="p-2 border border-slate-900">عنوان وموضوع الاتفاقية أو العقد</th>
                                <th className="p-2 border border-slate-900">ملخص البنود والتفريغ الشرعي</th>
                                <th className="p-2 border border-slate-900 text-center w-20">المرفقات</th>
                                <th className="p-2 border border-slate-900 text-center w-28">تاريخ الإغلاق والأرشفة</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-400 text-stone-800 text-[10px] sm:text-[11px] font-medium">
                              {archivedContracts.map((c, idx) => (
                                <tr key={c.id}>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{idx + 1}</td>
                                  <td className="p-2 border border-slate-900 font-bold text-slate-900">{c.title}</td>
                                  <td className="p-2 border border-slate-900 max-w-xs font-mono text-[9px] truncate">{c.content}</td>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{c.attachments?.length || 0} ملف</td>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{c.archivedAt || c.lastModified}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {/* Official Signatures Section */}
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-950 mt-12 pt-8 text-center text-[10px] sm:text-xs text-slate-950">
                      <div>
                        <h5 className="font-extrabold mb-12">معد التقرير ومسؤول الأرشيف</h5>
                        <p className="border-t border-dashed border-slate-400 pt-1.5 font-semibold mx-4">التوقيع والختم</p>
                      </div>
                      <div>
                        <h5 className="font-extrabold mb-12">مصادقة مجمع التوثيق والتعميد</h5>
                        <p className="border-t border-dashed border-slate-400 pt-1.5 font-semibold mx-4">توقيع الموثق</p>
                      </div>
                      <div>
                        <h5 className="font-extrabold mb-12">المحامي العام للمكتب</h5>
                        <p className="font-bold mb-12 text-stone-700 text-[10px]">المحامي اسم المحامي/المكتب</p>
                        <p className="border-t border-dashed border-slate-400 pt-1.5 font-semibold mx-4">الختم والمصادقة الشرعية</p>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-between items-center shrink-0">
              {selectedReportType !== "none" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const printContent = document.getElementById("printable-archive-report-sheet")?.innerHTML;
                      if (printContent) {
                        const win = window.open("", "", "width=900,height=600");
                        if (win) {
                          win.document.write(`
                            <html dir="rtl">
                            <head>
                              <title>طباعة تقرير الأرشيف العدلي المغلق</title>
                              <style>
                                body { font-family: 'Arial', sans-serif; direction: rtl; padding: 40px; line-height: 1.5; color: #000; }
                                #printable-archive-report-sheet { border: 2px solid #000; padding: 30px; position: relative; }
                                .absolute { position: absolute; }
                                .inset-2 { top: 8px; right: 8px; bottom: 8px; left: 8px; }
                                .inset-3 { top: 12px; right: 12px; bottom: 12px; left: 12px; }
                                .border { border: 1px solid #000; }
                                .border-2 { border: 2px solid #000; }
                                .border-double { border-style: double; }
                                .border-slate-950 { border-color: #000; }
                                .flex { display: flex; }
                                .justify-between { justify-content: space-between; }
                                .items-center { align-items: center; }
                                .border-b-2 { border-bottom: 2px solid #000; }
                                .pb-6 { padding-bottom: 24px; }
                                .mb-6 { margin-bottom: 24px; }
                                .text-right { text-align: right; }
                                .text-left { text-align: left; }
                                .text-center { text-align: center; }
                                .space-y-1 > * { margin-top: 4px; margin-bottom: 4px; }
                                .font-extrabold { font-weight: bold; }
                                .font-black { font-weight: 900; }
                                .font-mono { font-family: monospace; }
                                .text-xs { font-size: 12px; }
                                .text-[10px] { font-size: 10px; }
                                .text-[9px] { font-size: 9px; }
                                .bg-stone-50 { background-color: #f9f9f9; }
                                .bg-slate-950 { background-color: #000; color: #fff; }
                                .text-white { color: #fff; }
                                .px-2 { padding-left: 8px; padding-right: 8px; }
                                .py-0.5 { padding-top: 2px; padding-bottom: 2px; }
                                .rounded { border-radius: 4px; }
                                .my-6 { margin-top: 24px; margin-bottom: 24px; }
                                .underline { text-decoration: underline; }
                                .underline-offset-8 { text-underline-offset: 8px; }
                                .space-y-4 > * { margin-top: 16px; }
                                .px-3 { padding-left: 12px; padding-right: 12px; }
                                .py-1.5 { padding-top: 6px; padding-bottom: 6px; }
                                .w-full { width: 100%; }
                                .border-collapse { border-collapse: collapse; }
                                .p-2 { padding: 8px; }
                                .w-12 { width: 48px; }
                                .w-24 { width: 96px; }
                                .w-32 { width: 128px; }
                                .w-20 { width: 80px; }
                                .w-28 { width: 112px; }
                                .grid { display: grid; }
                                .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                                .gap-4 { gap: 16px; }
                                .mt-12 { margin-top: 48px; }
                                .pt-8 { padding-top: 32px; }
                                .text-amber-800 { color: #92400e; }
                                .bg-stone-100 { background-color: #f3f4f6; }
                                .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                                .max-w-xs { max-width: 250px; }
                              </style>
                            </head>
                            <body>
                              <div id="printable-archive-report-sheet">
                                ${printContent}
                              </div>
                              <script>
                                setTimeout(() => {
                                  window.print();
                                  window.close();
                                }, 500);
                              </script>
                            </body>
                            </html>
                          `);
                          win.document.close();
                        }
                      }
                      triggerVoiceNotification("تم إرسال مستند التقرير للطباعة.");
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-slate-950" />
                    <span>طباعة التقرير / حفظ بصيغة PDF 🖨️</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReportType("none");
                      triggerVoiceNotification("الرجوع إلى قائمة خيارات التقارير.");
                    }}
                    className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    رجوع للخيارات ↩️
                  </button>
                </div>
              ) : (
                <div />
              )}
              
              <button
                onClick={() => {
                  setShowReportDialog(false);
                  setSelectedReportType("none");
                }}
                className="bg-slate-950 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
