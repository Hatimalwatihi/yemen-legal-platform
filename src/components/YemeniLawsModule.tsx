import { apiUrl } from "../utils/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { YEMENI_LAWS } from "../data/yemeniLaws";
import { 
  BookOpen, Search, Scale, ShieldAlert, FileText, ChevronLeft, 
  HelpCircle, Printer, Copy, Check, Sparkles, Loader2, RefreshCw 
} from "lucide-react";
import { formatCleanArabicText } from "../utils/textFormatter";

export default function YemeniLawsModule() {
  const [selectedLawIndex, setSelectedLawIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [articleQuery, setArticleQuery] = useState<string>("");
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queriedResult, setQueriedResult] = useState<string | null>(null);
  const [queriedHeader, setQueriedHeader] = useState<{ title: string; subtitle: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const activeLaw = YEMENI_LAWS[selectedLawIndex];

  // Filter local highlights/chapters
  const filteredHighlights = activeLaw.highlights.filter(hl => 
    hl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hl.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hl.articles.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trigger Gemini API to fetch precise article
  const handleRetrieveArticle = async (argArticle?: string, argTitle?: string) => {
    const targetQuery = argArticle || articleQuery.trim();
    if (!targetQuery) return;

    setIsQuerying(true);
    setQueriedResult(null);
    setCopied(false);
    
    const displayTitle = argTitle || `المبحث: ${targetQuery}`;
    setQueriedHeader({
      title: displayTitle,
      subtitle: activeLaw.title
    });

    try {
      const response = await fetch(apiUrl("/api/gemini/get-article"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lawTitle: activeLaw.title,
          articleNumber: isNaN(Number(targetQuery)) ? undefined : `المادة (${targetQuery})`,
          keyword: isNaN(Number(targetQuery)) ? targetQuery : undefined
        })
      });

      if (!response.ok) {
        throw new Error("فشل السيرفر الذكي في استرجاع نص القانون. يرجى مراجعة الاتصال.");
      }

      const data = await response.json();
      setQueriedResult(data.text || "لم يتم العثور على تفسير دقيق لهذه المادة.");
    } catch (err: any) {
      setQueriedResult(`⚠️ تعذر جلب المادة حالياً: ${err.message || "يرجى المحاولة مجدداً."}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCopyResult = () => {
    if (!queriedResult) return;
    navigator.clipboard.writeText(queriedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintResult = () => {
    if (!queriedResult || !queriedHeader) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
      <head>
        <title>طباعة وثيقة قانونية - مكتب الوتيحي للمحاماة</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
          body { 
            font-family: 'Cairo', sans-serif; 
            direction: rtl; 
            padding: 40px; 
            background: white; 
            color: #1e293b;
            line-height: 1.8;
          }
          .letterhead {
            border-bottom: 3px double #d97706;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .lh-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .lh-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
          }
          .lh-side {
            font-size: 11px;
            color: #475569;
          }
          .content-box {
            text-align: justify;
            white-space: pre-wrap;
            font-size: 14px;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 11px;
            color: #64748b;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="lh-header">
            <div class="lh-side">
              <strong>الجمهورية اليمنية</strong><br/>
              وزارة العدل<br/>
              مكتب الوتيحي للمحاماة
            </div>
            <div class="lh-title">
              ⚖️ مكتب الوتيحي للمحاماة<br/>
              <span style="font-size: 13px; color: #b45309;">مستند مرجعي: ${queriedHeader.title}</span>
            </div>
            <div class="lh-side" style="text-align: left;">
              <strong>Republic of Yemen</strong><br/>
              Al-Watihi Law Office<br/>
              تاريخ الطباعة: ${new Date().toLocaleDateString("ar-YE")}
            </div>
          </div>
        </div>
        
        <div class="content-box">${formatCleanArabicText(queriedResult)}</div>

        <div class="footer">
          📍 صنعاء - الأصبحي - شارع الأربعين - تقاطع المقالح • هاتف: 771673276 / 715375198
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-6" id="yemeni-laws-container">
      {/* Upper Information Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                <BookOpen className="h-6 w-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-black">موسوعة التشريع اليمني المعتمدة</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              مرجعك القانوني الرقمي المتكامل لجميع مواد وأحكام القوانين النافذة في الجمهورية اليمنية. مرتبة ومفصلة وموثقة بأرقام المواد لمساعدتك في المرافعة وصياغة الدفوع باحترافية.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
            <Scale className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold">إصدار الموسوعة</div>
              <div className="text-xs font-black text-amber-400">المرجع المحدث 2026</div>
            </div>
          </div>
        </div>

        {/* 5 Law Books selection with beautiful design */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          {YEMENI_LAWS.map((law, idx) => {
            const isSelected = selectedLawIndex === idx;
            return (
              <button
                key={law.id}
                onClick={() => {
                  setSelectedLawIndex(idx);
                  setSearchTerm("");
                  setQueriedResult(null);
                  setArticleQuery("");
                }}
                className={`p-4 rounded-2xl border text-right transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden ${
                  isSelected 
                    ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500 shadow-md transform -translate-y-1" 
                    : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 text-slate-300"
                }`}
              >
                <div className="absolute top-2 left-2 opacity-10">
                  <BookOpen className="h-16 w-16" />
                </div>
                <div className="space-y-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-300"
                  }`}>
                    {law.category}
                  </span>
                  <h3 className={`text-xs font-black leading-snug mt-1.5 ${isSelected ? "text-amber-300" : "text-white"}`}>
                    {law.title}
                  </h3>
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {law.articlesCount} مادة مرتبة
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right Area: Interactive Search & Detailed AI Article Lookup */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Smart AI Lookup Panel */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                <h2 className="font-extrabold text-sm md:text-base text-slate-900">البحث الفوري والاسترجاع الذكي للمواد</h2>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">محاكي للجريدة الرسمية</span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              أدخل رقم المادة التي تبحث عنها (مثال: <span className="font-bold text-slate-800">138</span> أو <span className="font-bold text-slate-800">450</span>) أو موضوعاً قانونياً (مثال: <span className="font-bold text-slate-800">عقد الإيجار</span>) في <span className="font-bold text-amber-600">{activeLaw.title}</span> لاستدعاء النص الحرفي والكامل فوراً.
            </p>

            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={articleQuery}
                  onChange={(e) => setArticleQuery(e.target.value)}
                  placeholder="اكتب رقم المادة (مثل: 153) أو كلمة مفتاحية (مثل: التدليس)..."
                  className="w-full bg-stone-50 border border-stone-200 text-slate-800 pr-9 pl-3 py-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  onKeyDown={(e) => e.key === "Enter" && handleRetrieveArticle()}
                />
              </div>
              <button
                onClick={() => handleRetrieveArticle()}
                disabled={isQuerying || !articleQuery.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs px-6 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isQuerying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>جاري البحث...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>بحث واسترجاع</span>
                  </>
                )}
              </button>
            </div>

            {/* Queried results container */}
            {queriedResult && queriedHeader && (
              <div className="mt-4 border-2 border-amber-200/60 rounded-2xl bg-amber-50/10 p-5 space-y-4 animate-fade-in relative">
                
                {/* Header info of retrieved article */}
                <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                  <div>
                    <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-amber-600" />
                      <span>{queriedHeader.title}</span>
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">{queriedHeader.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyResult}
                      className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      title="نسخ النص"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handlePrintResult}
                      className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      title="طباعة"
                    >
                      <Printer className="h-3 w-3" />
                      <span>طباعة</span>
                    </button>
                  </div>
                </div>

                {/* Article body markdown simulation */}
                <div 
                  className="text-xs text-slate-800 leading-relaxed font-sans text-justify bg-white p-4 rounded-xl border border-stone-100 space-y-2.5"
                  dangerouslySetInnerHTML={{ __html: formatCleanArabicText(queriedResult) }}
                />

                <div className="text-[10px] text-stone-400 text-left pt-2 border-t border-stone-100">
                  * المستند مسترجع تلقائياً ومطابق لنسخة القوانين الرسمية المعتمدة في اليمن
                </div>
              </div>
            )}
          </div>

          {/* Chapters Explorer based on Law Data */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <h2 className="font-extrabold text-sm md:text-base text-slate-900">البنود والفصول المرتبة للموسوعة</h2>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute right-2 top-2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="تصفية الفصول والبنود المحلية..."
                  className="w-full bg-stone-50 border border-stone-200 text-slate-800 pr-7 pl-2.5 py-1.5 rounded-xl text-[10px] outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {filteredHighlights.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                لا توجد بنود مطابقة لتصفيتك في هذا القانون. جرب البحث في مواد أخرى.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHighlights.map((hl, i) => (
                  <div key={i} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl hover:border-amber-400 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-stone-100">
                        <span className="font-black text-xs text-slate-900">{hl.title}</span>
                        <span className="text-[9px] bg-slate-900 text-amber-400 font-mono px-2.5 py-0.5 rounded-lg font-bold">
                          {hl.articles}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed text-justify">{hl.content}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center">
                      <span className="text-[9px] text-stone-400">قانون يمني نافذ</span>
                      <button
                        onClick={() => {
                          setArticleQuery(hl.title);
                          handleRetrieveArticle(hl.articles, hl.title);
                        }}
                        className="text-[10px] text-amber-600 hover:text-amber-700 font-black flex items-center gap-0.5 cursor-pointer bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50"
                      >
                        <span>تصفح كافة مواد هذا الفصل</span>
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Left Area: General Structure / Helper panel */}
        <div className="space-y-6">
          {/* Quick Search Helper cards */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-r-4 border-amber-500 pr-2">توجيهات البحث السريع</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              للوصول المباشر والدقيق لأكثر المواد حساسية وتداولاً في المحاكم اليمنية، يمكنك إدخال أرقام المواد مباشرة في صندوق البحث:
            </p>
            
            <div className="space-y-2 pt-2">
              <button 
                onClick={() => { setArticleQuery("138"); handleRetrieveArticle("138", "القانون المدني - المادة 138 (أركان العقد)"); }}
                className="w-full p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-right text-[11px] font-bold flex justify-between items-center transition-colors cursor-pointer"
              >
                <span className="text-slate-800">المادة (138) المدني - تعريف العقد</span>
                <span className="text-amber-600 text-[10px]">استرجاع فوري ⚡</span>
              </button>

              <button 
                onClick={() => { setArticleQuery("450"); handleRetrieveArticle("450", "القانون المدني - المادة 450 (عقد البيع)"); }}
                className="w-full p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-right text-[11px] font-bold flex justify-between items-center transition-colors cursor-pointer"
              >
                <span className="text-slate-800">المادة (450) المدني - تعريف البيع</span>
                <span className="text-amber-600 text-[10px]">استرجاع فوري ⚡</span>
              </button>

              <button 
                onClick={() => { setArticleQuery("630"); handleRetrieveArticle("630", "القانون المدني - المادة 630 (عقد الإيجار)"); }}
                className="w-full p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-right text-[11px] font-bold flex justify-between items-center transition-colors cursor-pointer"
              >
                <span className="text-slate-800">المادة (630) المدني - عقد الإيجار</span>
                <span className="text-amber-600 text-[10px]">استرجاع فوري ⚡</span>
              </button>

              <button 
                onClick={() => { setArticleQuery("300"); handleRetrieveArticle("300", "القانون المدني - المادة 300 (المسؤولية التقصيرية)"); }}
                className="w-full p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-right text-[11px] font-bold flex justify-between items-center transition-colors cursor-pointer"
              >
                <span className="text-slate-800">المادة (300) المدني - المسؤولية التقصيرية</span>
                <span className="text-amber-600 text-[10px]">استرجاع فوري ⚡</span>
              </button>
            </div>
          </div>

          {/* Quick Legal advice disclaimer panel */}
          <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0" />
              <span>إشعار تنظيم قانوني هام</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed text-justify">
              تستند هذه البوابة القانونية إلى النسخة الرسمية الصادرة عن الجريدة الرسمية للجمهورية اليمنية. إن التفسيرات والشروح الفقهية مخصصة لمساندة الهيئة القضائية والسادة المحامين بمكتب الوتيحي للمحاماة، ولا تغني عن الاجتهاد الفردي أو استشارة المحامي المباشر للملف.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
