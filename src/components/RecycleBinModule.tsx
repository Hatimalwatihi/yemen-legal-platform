/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Trash2, RotateCcw, AlertTriangle, Search, Briefcase, Calendar, 
  FileText, ShieldAlert, CheckCircle2, Trash, Info
} from "lucide-react";
import { RecycleBinItem } from "../types";
import { speakArabicText } from "../utils/audioNotifier";

interface RecycleBinModuleProps {
  recycleBin: RecycleBinItem[];
  onRestoreItem: (item: RecycleBinItem) => void;
  onPermanentlyDeleteItem: (itemId: string) => void;
  onEmptyRecycleBin: () => void;
}

export default function RecycleBinModule({
  recycleBin,
  onRestoreItem,
  onPermanentlyDeleteItem,
  onEmptyRecycleBin
}: RecycleBinModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "case" | "session" | "document">("all");
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter items based on search and type
  const filteredItems = recycleBin.filter(item => {
    // Filter by type
    if (filterType !== "all" && item.type !== filterType) {
      return false;
    }

    // Filter by search query
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const title = item.itemData.title || item.itemData.caseTitle || item.itemData.courtName || "";
    const caseNumber = item.itemData.caseNumber || "";
    const clientName = item.itemData.clientName || "";
    const description = item.itemData.description || item.itemData.notes || "";

    return (
      title.toLowerCase().includes(query) ||
      caseNumber.toLowerCase().includes(query) ||
      clientName.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query)
    );
  });

  const handleRestore = (item: RecycleBinItem) => {
    onRestoreItem(item);
    let message = "";
    if (item.type === "case") {
      message = `تم استعادة القضية بنجاح، بالإضافة إلى ${item.associatedSessions?.length || 0} جلسات مرتبطة بها`;
    } else if (item.type === "session") {
      message = "تم استعادة الجلسة القضائية بنجاح إلى جدول الجلسات";
    } else if (item.type === "document") {
      message = "تم استعادة المستند والوثيقة بنجاح";
    }
    speakArabicText(message);
  };

  const handlePermanentDelete = (id: string, type: string) => {
    onPermanentlyDeleteItem(id);
    setConfirmDeleteId(null);
    let label = type === "case" ? "القضية" : type === "session" ? "الجلسة" : "الوثيقة";
    speakArabicText(`تم حذف ${label} نهائياً وبشكل قطعي من خوادم الحفظ`);
  };

  const handleEmptyBin = () => {
    onEmptyRecycleBin();
    setShowConfirmEmpty(false);
    speakArabicText("تم إفراغ سلة المحذوفات بالكامل وتطهير الذاكرة المؤقتة");
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("ar-YE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6" dir="rtl" id="recycle-bin-module-root">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-red-900/10 via-amber-900/5 to-transparent border border-red-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-red-600 animate-bounce" />
            <span>سلة المحذوفات الرقمية (الحفظ الاحتياطي المؤقت)</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            هنا تجد كافة القضايا والجلسات والوثائق التي قمت بحذفها بالخطأ. يمكنك استعادتها بكافة تفصيلاتها أو تصفيتها وتدميرها نهائياً. يتم الاحتفاظ بها في خزانة الحماية المؤقتة لحين اتخاذ قرارك.
          </p>
        </div>

        {recycleBin.length > 0 && (
          <button
            onClick={() => setShowConfirmEmpty(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-[0.98]"
            title="تفريغ كافة العناصر المحذوفة نهائياً"
            id="empty-recycle-bin-btn"
          >
            <Trash className="h-4 w-4" />
            <span>تفريغ السلة بالكامل ({recycleBin.length})</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal - Empty Bin */}
      {showConfirmEmpty && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert className="h-10 w-10 shrink-0" />
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">تنبيه أمني: تدمير قطعي للمحذوفات!</h3>
                <p className="text-xs text-slate-600">هذا الإجراء غير قابل للتراجع أبداً.</p>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              أنت على وشك مسح <span className="font-bold text-red-600">{recycleBin.length} عناصر</span> من سلة المحذوفات بشكل نهائي وقطعي. لن تتمكن أنت أو أي مستشار من استعادة هذه القضايا أو الوثائق مستقبلاً.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmEmpty(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
              >
                تراجع وإلغاء
              </button>
              <button
                onClick={handleEmptyBin}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                نعم، احذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {recycleBin.length === 0 ? (
        <div className="bg-white border border-stone-200 p-12 rounded-2xl text-center space-y-4 shadow-sm flex flex-col items-center justify-center">
          <div className="bg-stone-50 p-4 rounded-full border border-stone-150">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">سلة المحذوفات فارغة تماماً</h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              لم يتم حذف أي ملفات أو قضايا مؤخراً. ملفاتك وقضاياك العدلية نشطة ومنظمة بأمان في أقسامها المخصصة.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Controls Panel */}
          <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="البحث في سلة المحذوفات بـ (الاسم، العنوان، الرقم، نوع الوثيقة)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                الكل ({recycleBin.length})
              </button>
              <button
                onClick={() => setFilterType("case")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === "case"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-amber-500/10 text-amber-900 hover:bg-amber-500/20"
                }`}
              >
                <Briefcase className="h-3 w-3" />
                <span>القضايا ({recycleBin.filter(i => i.type === "case").length})</span>
              </button>
              <button
                onClick={() => setFilterType("session")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === "session"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-600/10 text-emerald-900 hover:bg-emerald-600/20"
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>الجلسات ({recycleBin.filter(i => i.type === "session").length})</span>
              </button>
              <button
                onClick={() => setFilterType("document")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === "document"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-600/10 text-indigo-900 hover:bg-indigo-600/20"
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>المستندات ({recycleBin.filter(i => i.type === "document").length})</span>
              </button>
            </div>
          </div>

          {/* List of items */}
          <div className="grid grid-cols-1 gap-4" id="recycle-bin-items-grid">
            {filteredItems.length === 0 ? (
              <div className="bg-stone-50 border border-stone-200/60 p-8 rounded-2xl text-center text-slate-500 text-xs">
                لا توجد نتائج مطابقة لبحثك في سلة المحذوفات.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isCase = item.type === "case";
                const isSession = item.type === "session";
                const isDoc = item.type === "document";

                return (
                  <div 
                    key={item.id} 
                    className="bg-white border border-stone-200 hover:border-stone-350 p-5 rounded-2xl shadow-sm hover:shadow transition-all flex flex-col md:flex-row justify-between md:items-center gap-4"
                  >
                    {/* Item Description Card */}
                    <div className="flex gap-4 items-start">
                      <div className={`p-3 rounded-xl shrink-0 ${
                        isCase ? "bg-amber-100 text-amber-700" :
                        isSession ? "bg-emerald-100 text-emerald-700" :
                        "bg-indigo-100 text-indigo-700"
                      }`}>
                        {isCase && <Briefcase className="h-5 w-5" />}
                        {isSession && <Calendar className="h-5 w-5" />}
                        {isDoc && <FileText className="h-5 w-5" />}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCase ? "bg-amber-50 text-amber-800 border border-amber-200" :
                            isSession ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                            "bg-indigo-50 text-indigo-800 border border-indigo-200"
                          }`}>
                            {isCase ? "قضية قضائية" : isSession ? "جلسة محاكمة" : "مستند/وثيقة"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            حُذِف في: {formatDate(item.deletedAt)}
                          </span>
                        </div>

                        {/* Title & Info */}
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {isCase && `${item.itemData.title} (${item.itemData.caseNumber || "بدون رقم"})`}
                          {isSession && `جلسة بـ: ${item.itemData.courtName} - ${item.itemData.caseTitle}`}
                          {isDoc && `${item.itemData.title} (${item.itemData.docType})`}
                        </h4>

                        {/* Sub information depending on type */}
                        <div className="text-[11px] text-slate-500 leading-relaxed">
                          {isCase && (
                            <p>
                              📍 المحكمة: <span className="font-bold">{item.itemData.court}</span> • 
                              العميل: <span className="font-bold">{item.itemData.clientName} ({item.itemData.clientRole})</span> • 
                              أتعاب القضية: <span className="font-bold text-slate-700">{item.itemData.feesTotal} ر.ي</span>
                              {item.associatedSessions && item.associatedSessions.length > 0 && (
                                <span className="mr-2 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                                  🗳️ سيتم استعادة {item.associatedSessions.length} جلسات مرتبطة تلقائياً!
                                </span>
                              )}
                            </p>
                          )}
                          {isSession && (
                            <p>
                              📅 التاريخ: <span className="font-bold">{item.itemData.sessionDateGregorian} م ({item.itemData.sessionDateHijri} هـ)</span> • 
                              الخصومة: <span className="font-bold">{item.itemData.caseTitle}</span> • 
                              القاضي الناظر: <span className="font-bold">{item.itemData.judgeName || "غير محدد"}</span>
                            </p>
                          )}
                          {isDoc && (
                            <p>
                              📄 نوع الوثيقة: <span className="font-bold">{item.itemData.docType}</span> • 
                              مرفقات مستندية: <span className="font-bold">{item.itemData.attachments?.length || 0} ملفات</span>
                              {item.itemData.content && (
                                <span className="block mt-1 text-stone-400 line-clamp-1 italic text-[10px]">
                                  مقتطف: "{item.itemData.content.substring(0, 100)}..."
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-2 md:self-center">
                      <button
                        onClick={() => handleRestore(item)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95"
                        title="استعادة هذا العنصر بالكامل"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                        <span>استعادة</span>
                      </button>

                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-1 rounded-xl animate-scale-in">
                          <span className="text-[10px] text-red-700 font-bold px-1.5">حذف نهائي؟</span>
                          <button
                            onClick={() => handlePermanentDelete(item.id, item.type)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors"
                          >
                            نعم
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-bold rounded-lg transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-95 border border-red-100"
                          title="حذف نهائي قطعي"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}
