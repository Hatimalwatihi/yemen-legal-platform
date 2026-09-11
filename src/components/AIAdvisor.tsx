import { apiUrl } from "../utils/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Send, Scale, Trash2, Clock, HelpCircle, AlertTriangle, 
  HelpCircle as QuestionIcon, CornerDownLeft, CircleAlert, Copy, Check,
  Paperclip, FileText, X, Upload, Eye, Shield, Search, Printer, FileDown
} from "lucide-react";
import { triggerVoiceNotification } from "../utils/audioNotifier";
import { formatCleanArabicText } from "../utils/textFormatter";

interface Message {
  role: "user" | "model" | "assistant";
  text: string;
}

interface AIAdvisorProps {
  quickAiPrompt: string;
  setQuickAiPrompt: (prompt: string) => void;
  attorneyName: string;
}

export default function AIAdvisor({ quickAiPrompt, setQuickAiPrompt, attorneyName }: AIAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "model",
          text: `مرحباً بك في مجلس المستشار القانوني الذكي للمحامي ${attorneyName}. أنا هنا لمساعدتك مرافعةً ومدافعةً صقلاً للقانون اليمني، وصياغة عرائض الادعاء ومطابقة البنود. تفضل بطرح طِلبك أو استشارتك.`
        }
      ]);
    }
  }, [attorneyName, messages.length]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; mimeType: string; url?: string; base64Data?: string; sizeStr?: string; isSliced?: boolean } | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Helper to export specific AI advice formatted for Microsoft Word (.doc) with official Al-Watihi Letterhead
  const downloadMessageAsWord = (text: string, index: number) => {
    const today = new Date().toLocaleDateString("ar-YE", { year: "numeric", month: "long", day: "numeric" });
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>استشارة_قانونية_${index}</title>
        <style>
          body {
            font-family: 'Arial', 'Simplified Arabic', sans-serif;
            direction: rtl;
            unicode-bidi: embed;
            padding: 30px;
            line-height: 1.6;
          }
          h1, h2, h3 {
            color: #0b1e36;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <!-- Official Yemen Republic Letterhead Card -->
        <div style="direction: rtl; border: 1px solid #cbd5e1; padding: 20px; margin-bottom: 25px;">
          <!-- Top Row Table (Left, Logo, Right) -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <tr>
              <!-- Right: Arabic Office Details -->
              <td style="width: 35%; text-align: right; vertical-align: top; font-size: 11px; line-height: 1.4; color: #0f172a; font-family: 'Arial', sans-serif;">
                <strong style="font-size: 14px; font-weight: bold; color: #0f172a;">الجمهورية اليمنية</strong><br/>
                <span style="font-size: 12px; font-weight: bold; color: #b58a3c;">المكتب الاستشاري</span><br/>
                <span style="font-size: 8.5px; color: #475569;">محاماة - تحكيم - استشارات قانونية - إعداد الدراسات والعقود التجارية - مرافعة أمام المحكمة العليا</span>
              </td>
              <!-- Center: Logo -->
              <td style="width: 30%; text-align: center; vertical-align: top;">
                <span style="font-size: 20px; color: #0b1e36; display: block;">⚖️</span>
                <span style="font-size: 11px; font-weight: bold; color: #0f172a; display: block; margin-top: 4px;">مكتب المحاماة</span>
              </td>
              <!-- Left: English Office Details -->
              <td style="width: 35%; text-align: left; vertical-align: top; font-size: 11px; line-height: 1.4; color: #0f172a; direction: ltr; font-family: 'Arial', sans-serif;">
                <strong style="font-size: 12px; font-weight: bold;">Republic of Yemen</strong><br/>
                <span style="font-size: 10px; font-weight: bold;">Consultation office</span><br/>
                <span style="font-size: 8px; color: #475569;">Lawyer - Arbitration - Legal advice - Studies & Contracts<br/>Pleaded before the Supreme Court</span>
              </td>
            </tr>
          </table>

          <!-- Double line separator and Metadata lines -->
          <div style="border-top: 3px double #b58a3c; margin-top: 10px; padding-top: 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-weight: bold; color: #0f172a;">
              <tr>
                <td style="width: 33%; text-align: right;">الرقم: استشارة قضائية #${index}</td>
                <td style="width: 34%; text-align: center;">التاريخ: ${today}</td>
                <td style="width: 33%; text-align: left; direction: rtl;">المرفقات: آلي وموثق</td>
              </tr>
            </table>
          </div>
        </div>

        <h2 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 25px; border-bottom: 2px solid #b58a3c; padding-bottom: 8px; display: inline-block;">رأي قانوني واستشارة فقهية فورية</h2>
        <div style="white-space: pre-wrap; direction: rtl; text-align: justify; font-size: 13px; margin-top: 10px; line-height: 1.8;">
          ${text.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}
        </div>

        <!-- Official Letterhead Footer in Word -->
        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin-top: 50px; margin-bottom: 15px;"/>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; font-weight: bold; color: #475569; direction: rtl;">
          <tr>
            <td style="text-align: right; width: 45%;">📍 الأصبحي - شارع الأربعين - تقاطع شارع المقالح - فوق مفروشات الصرمي مقابل الكريمي</td>
            <td style="text-align: center; width: 25%;">📱 هاتف: 771673276 / 715375198</td>
            <td style="text-align: left; width: 30%;">✉️ البريد: abduiiahalwutayhi7716@gmail.com</td>
          </tr>
        </table>
        <div style="text-align: center; font-size: 8.5px; color: #94a3b8; margin-top: 15px;">
          <span>تم توليد وتحرير هذا المستند عبر المنصة العدلية المتكاملة بالجمهورية اليمنية بمكتب مكتب المحاماة</span>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `استشارة_قانونية_${index}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to print specific AI advice inside the official Al-Watihi Letterhead frame
  const printMessage = (text: string, index: number) => {
    const today = new Date().toLocaleDateString("ar-YE", { year: "numeric", month: "long", day: "numeric" });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>طباعة استشارة قانونية #${index}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 30px;
            direction: rtl;
            background-color: #ffffff;
            color: #1e293b;
            line-height: 1.8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
          .letterhead {
            border: 1px solid #cbd5e1;
            padding: 20px;
            margin-bottom: 25px;
          }
          .logo-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
          }
          .logo-side {
            width: 35%;
            font-size: 11px;
            line-height: 1.4;
          }
          .logo-side.left {
            text-align: left;
            direction: ltr;
          }
          .logo-center {
            width: 30%;
            text-align: center;
          }
          .divider {
            border-top: 3px double #b58a3c;
            margin-top: 10px;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: bold;
          }
          .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 25px 0;
            border-bottom: 2px solid #b58a3c;
            padding-bottom: 8px;
            display: inline-block;
          }
          .content {
            white-space: pre-wrap;
            text-align: justify;
            font-size: 14px;
            margin-top: 10px;
          }
          .footer {
            border-top: 1px solid #cbd5e1;
            margin-top: 50px;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: bold;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="logo-container">
            <div class="logo-side">
              <strong>الجمهورية اليمنية</strong><br/>
              <span style="color: #b58a3c; font-weight: bold; font-size: 12px;">المكتب الاستشاري</span><br/>
              <span style="font-size: 9px; color: #475569;">محاماة - تحكيم - استشارات قانونية - إعداد الدراسات والعقود التجارية - مرافعة أمام المحكمة العليا</span>
            </div>
            <div class="logo-center">
              <span style="font-size: 24px;">⚖️</span><br/>
              <strong style="font-size: 13px;">مكتب المحاماة</strong>
            </div>
            <div class="logo-side left">
              <strong>Republic of Yemen</strong><br/>
              <span style="font-weight: bold; font-size: 10px;">Consultation office</span><br/>
              <span style="font-size: 8px; color: #475569;">Lawyer - Arbitration - Legal advice - Studies & Contracts</span>
            </div>
          </div>
          <div class="divider">
            <div>الرقم: استشارة قضائية #${index}</div>
            <div>التاريخ: ${today}</div>
            <div>المرفقات: آلي وموثق</div>
          </div>
        </div>
        <center><div class="title">استشارة قانونية فورية معتمدة</div></center>
        <div class="content">${formatCleanArabicText(text)}</div>
        <div class="footer">
          <div>📍 الأصبحي - شارع الأربعين - تقاطع شارع المقالح</div>
          <div>📱 هاتف: 771673276 / 715375198</div>
          <div>✉️ البريد: abduiiahalwutayhi7716@gmail.com</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  // Incremental chunk/slice state trackers for large documents (e.g. 107MB+)
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [chunkStart, setChunkStart] = useState<number>(0);
  const [analyzedChunksCount, setAnalyzedChunksCount] = useState<number>(0);
  const [isUploadingNextChunk, setIsUploadingNextChunk] = useState<boolean>(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndSetFile = (file: File) => {
    setDocumentError(null);
    setIsReadingFile(true);
    setUploadProgress(0);

    const MAX_ALLOWABLE_UPLOAD_MB = 500; 
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت`
      : `${(file.size / 1024).toFixed(1)} كيلوبايت`;

    // Save initial state for sequential tracking
    setOriginalFile(file);
    setChunkStart(0);
    setAnalyzedChunksCount(1);

    if (file.size > MAX_ALLOWABLE_UPLOAD_MB * 1024 * 1024) {
      const originalMB = (file.size / (1024 * 1024)).toFixed(1);
      setDocumentError(`⚠️ حجم الملف كبير جداً (${originalMB} ميجابايت). الحد الأقصى للرفع هو ${MAX_ALLOWABLE_UPLOAD_MB} ميجابايت لحماية موارد السيرفر ومساحتك.`);
      triggerVoiceNotification("عذراً، المستند يتجاوز الحد الأقصى المسموح به.");
      setIsReadingFile(false);
      setUploadProgress(null);
      return;
    }

    try {
      // Upload using XMLHttpRequest to monitor real-time progress events
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append("file", file, file.name);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        setIsReadingFile(false);
        setUploadProgress(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success && data.url) {
              setAttachedFile({
                name: file.name,
                mimeType: file.type || "application/octet-stream",
                url: data.url,
                sizeStr: sizeStr,
                isSliced: false
              });
              triggerVoiceNotification("تم رفع وتجهيز كامل المستند بنجاح للمستشار وبدون أي اقتطاع!");
            } else {
              throw new Error(data.error || "لم يتم الحصول على مسار الملف.");
            }
          } catch (err: any) {
            setDocumentError(`❌ فشل معالجة الملف بعد الرفع: ${err.message || "حدث خطأ غير متوقع."}`);
          }
        } else {
          setDocumentError(`❌ فشل رفع المستند. كود الخطأ من السيرفر: ${xhr.status}`);
        }
      });

      xhr.addEventListener("error", () => {
        setIsReadingFile(false);
        setUploadProgress(null);
        setDocumentError("❌ حدث خطأ في الاتصال أثناء رفع الملف.");
      });

      xhr.open("POST", apiUrl("/api/upload-file"));
      try {
        const saved = localStorage.getItem("watihi_current_user");
        const parsed = saved ? JSON.parse(saved) : null;
        xhr.setRequestHeader("x-session-token", parsed?.sessionToken || "");
      } catch {}
      xhr.send(fd);
    } catch (err: any) {
      console.warn("Direct upload failed, attempting small file fallback:", err);
      // Fallback to local Base64 ONLY for very small files (< 8MB) to protect the browser
      if (file.size < 8 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedFile({
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            base64Data: reader.result as string,
            sizeStr: sizeStr,
            isSliced: false
          });
          setUploadProgress(null);
          triggerVoiceNotification("تم إرفاق المستند المحلي بنجاح!");
        };
        reader.onerror = () => {
          setUploadProgress(null);
          setDocumentError("❌ فشل فحص وقراءة ملف المستند محلياً في المتصفح.");
        };
        reader.readAsDataURL(file);
      } else {
        setUploadProgress(null);
        setDocumentError(`❌ فشل رفع المستند (${sizeStr}) للتحليل السحابي. يرجى مراجعة اتصال الشبكة أو تجربة ملف أصغر.`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndSetFile(file);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  // Fast suggestions
  const SUGGESTIONS = [
    { label: "شروط إخلاء العقار باليمن", q: "ما هي شروط وحالات الإخلاء القانوني للعين المؤجرة في القانون المدني اليمني؟" },
    { label: "مواعيد الطعن بالاستئناف", q: "ما هي المواعيد والمواقيت القانونية لتقديم استئناف حكم ابتدائي مدني وجنائي في محاكم الجمهورية اليمنية؟" },
    { label: "حجية الورقة العرفية", q: "ما هي القوة القانونية للورقة العرفية (غير المصادق عليها من أمين شرعي) في قانون الإثبات اليمني؟" },
    { label: "دعوى التعويض للضرر المادي", q: "أريد صياغة صحيفة دعوى تعويض عن ضرر ناتج عن مخالفة التزام تعاقدي بموجب القانون المدني اليمني." }
  ];

  // React to quick prompt triggers from other pages
  useEffect(() => {
    if (quickAiPrompt) {
      setInputVal(quickAiPrompt);
      // Clear after triggering
      setQuickAiPrompt("");
    }
  }, [quickAiPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customPrompt?: string, overrideFile?: typeof attachedFile) => {
    const textToSend = customPrompt || inputVal;
    const fileToUpload = overrideFile !== undefined ? overrideFile : attachedFile;
    if (!textToSend.trim() && !fileToUpload) return;

    setErrorText(null);
    
    // Choose what text to display in the user message bubble
    let displayMessage = textToSend;
    if (!textToSend.trim() && fileToUpload) {
      displayMessage = `📋 الرجاء مراجعة وتلخيص المستند المرفق: ${fileToUpload.name}`;
    }

    const newHistory = [...messages, { role: "user" as const, text: displayMessage }];
    setMessages(newHistory);
    setInputVal("");
    
    setAttachedFile(null); // Clear visually immediately for smooth UI progression
    setLoading(true);

    // Retrieve active session token from local storage for backend security verification
    let sessionToken = "";
    let username = "Guest";
    try {
      const savedUser = localStorage.getItem("watihi_current_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        sessionToken = parsed?.sessionToken || "";
        username = parsed?.username || "Guest";
      }
    } catch (e) {
      console.error("Failed to parse user session in AI advisor:", e);
    }

    try {
      const response = await fetch(apiUrl("/api/gemini/chat"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-session-token": sessionToken
        },
        body: JSON.stringify({
          username: username,
          sessionToken: sessionToken,
          message: textToSend.trim() || "الرجاء مراجعة المستند المرفق وتلخيصه وتحليله قانونياً.",
          fileAttachment: fileToUpload || undefined,
          // Extract only user and model roles for standard API history
          history: messages.slice(1).map(m => ({
            role: m.role === "assistant" ? "model" as const : m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        let errMsg = "فشل الاتصال بالخادم الذكي. تأكد من إعداد Secrets لمفتاح GEMINI_API_KEY.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            if (errData.error.toLowerCase().includes("quota") || errData.error.toLowerCase().includes("exhausted")) {
              errMsg = "⚠️ لقد تم تجاوز الحصة المجانية المؤقتة لمفتاح الذكاء الاصطناعي (Quota Exceeded).\n\nيرجى الانتظار دقيقة واحدة فقط حتى يتم إعادة تعيين العداد التلقائي للطلبات مجاناً، أو استخدام مفتاح API مخصص من Google AI Studio لتجنب أي انقطاع.";
            } else {
              errMsg = `❌ خطأ في معالجة الاستشارة: ${errData.error}`;
            }
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      const cleanedText = (data.text || "").replace(/[*#]/g, "");
      setMessages([...newHistory, { role: "model" as const, text: cleanedText }]);
    } catch (err: any) {
      const detail = err.message || "حدث خطأ غير متوقع أثناء معالجة الاستشارة.";
      setErrorText(detail);
      const isQuotaError = detail.includes("تجاوز الحصة المجانية");
      const fallbackText = isQuotaError 
        ? detail
        : `عذراً، لم أستطع مراجعة المستشار الافتراضي حالياً بسبب خطأ في اتصال الخدمة:\n\n${detail}\n\nيرجى التأكد من إضافة مفتاح GEMINI_API_KEY صالح في "الإعدادات (Settings) -> Secrets" من واجهة AI Studio.`;
      setMessages([...newHistory, { role: "model" as const, text: fallbackText }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeNextChunk = async () => {
    if (!originalFile) return;
    const CHUNK_SIZE_BYTES = 20 * 1024 * 1024;
    const nextStart = chunkStart + CHUNK_SIZE_BYTES;
    if (nextStart >= originalFile.size) return;

    setIsUploadingNextChunk(true);
    setDocumentError(null);

    const chunkIndex = Math.floor(nextStart / CHUNK_SIZE_BYTES) + 1;
    const totalChunks = Math.ceil(originalFile.size / CHUNK_SIZE_BYTES);
    
    // Slice next chunk bytes
    const nextChunkBlob = originalFile.slice(nextStart, nextStart + CHUNK_SIZE_BYTES, originalFile.type);
    
    const nextSizeStr = nextChunkBlob.size > 1024 * 1024 
      ? `${(nextChunkBlob.size / (1024 * 1012)).toFixed(1)} ميجابايت` // Safe calculation
      : `${(nextChunkBlob.size / 1024).toFixed(1)} كيلوبايت`;

    const displaySizeStr = `الجزء رقم ${chunkIndex} من ${totalChunks} (${nextSizeStr})`;

    try {
      // Upload using multipart stream
      const fd = new FormData();
      fd.append("file", nextChunkBlob, originalFile.name);

      const response = await fetch(apiUrl("/api/upload-file"), {
        method: "POST",
        headers: { "x-session-token": (() => { try { const u = JSON.parse(localStorage.getItem("watihi_current_user") || "null"); return u?.sessionToken || ""; } catch { return ""; } })() },
        body: fd
      });

      if (!response.ok) {
        throw new Error("فشل السيرفر في رفع الجزء التالي من هذا المستند.");
      }

      const data = await response.json();
      if (data.success && data.url) {
        const nextAttached = {
          name: originalFile.name,
          mimeType: originalFile.type || "application/octet-stream",
          url: data.url,
          sizeStr: displaySizeStr,
          isSliced: true
        };
        
        setAttachedFile(nextAttached);
        setChunkStart(nextStart);
        setAnalyzedChunksCount(prev => prev + 1);

        triggerVoiceNotification(`جاري مراجعة وتحليل الجزء رقم ${chunkIndex} حالياً!`);

        // Automatically trigger continuation request
        const nextPrompt = `الرجاء مواصلة مراجعة وتحليل الجزء رقم ${chunkIndex} (من أصل ${totalChunks} أجزاء) من هذا المستند القانوني "${originalFile.name}"، مع ربطه وتكامله مع التحليلات والنقاط الجوهرية المستخلصة سابقاً مستنداً لقواعد القانون اليمني.`;
        
        await handleSend(nextPrompt, nextAttached);
      } else {
        throw new Error("لم يتم الحصول على مسار الملف المرفوع.");
      }
    } catch (err: any) {
      console.error("Failed to upload incremental chunk:", err);
      setDocumentError(`❌ فشل رفع الجزء التالي (${displaySizeStr}). يرجى مراجعة اتصال الشبكة والمحاولة مرة أخرى.`);
    } finally {
      setIsUploadingNextChunk(false);
    }
  };

  const clearChat = () => {
    if (confirm("هل تريد تفريغ جلسة التشاور الحالية والبدء من جديد؟")) {
      setMessages([
        {
          role: "model",
          text: "مرحباً بك مجدداً. مجلس القانون مفتوح للاستشارة وصياغة المرافعات بموجب القانون اليمني."
        }
      ]);
      setErrorText(null);
      setAttachedFile(null);
      setOriginalFile(null);
      setChunkStart(0);
      setAnalyzedChunksCount(0);
    }
  };

  const handleAnalyzeWithMode = (modeType: "extract" | "loopholes" | "proofread") => {
    if (!attachedFile) return;
    
    let specialPrompt = "";
    if (modeType === "extract") {
      specialPrompt = "الرجاء مراجعة الوثيقة المرفقة وتلخيصها واستخراج النقاط الجوهرية فيها بدقة متناهية (مثل الأطراف الرئيسية، المطالب، التواريخ، البنود والتزامات الأطراف) وتنسيقها في شكل نقاط مرتبة وواضحة جداً مستنداً للقانون اليمني.";
    } else if (modeType === "loopholes") {
      specialPrompt = `بصفتك المستشار القانوني اليمني ${attorneyName}، حلل هذه الوثيقة المرفقة بصرياً ولغوياً واستخرج كافة الثغرات القانونية (Loopholes)، نقاط الضعف، غموض الصياغات، أو أي مجازفة ائتمانية قد تضر بمركز موكلنا، ودلّنا على كيفية تحصينها بمواد القانون النافذ باليمن ومقترحات بديلة.`;
    } else {
      specialPrompt = "قم بمراجعة وتدقيق هذا المستند لغوياً ونحوياً وقانونياً (Legal Proofreading)، واقترح صياغات بديلة رصينة ترفع من شأنه وقوته القضائية ومناسبته للمحاكم اليمنية العريقة.";
    }

    handleSend(specialPrompt);
  };

  return (
    <div 
      className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] text-right font-sans" 
      id="ai-advisor-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Full-screen Glass Drag overlay when file is floating over */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md border-4 border-dashed border-amber-400 rounded-2xl flex flex-col items-center justify-center text-white pointer-events-none transition-all duration-300">
          <div className="p-6 bg-slate-900 rounded-full text-amber-400 animate-bounce shadow-xl border border-amber-500/20 mb-4">
            <Upload className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-extrabold text-amber-400 tracking-wide mb-1">أفلت المستند القانوني اليمني هنا!</h2>
          <p className="text-xs text-stone-300 max-w-sm text-center leading-relaxed">
            سيقوم المستشار {attorneyName} باستلام ملف الـ PDF أو الصورة فوراً وقراءته بالذكاء الفقهي ورؤية Gemini العميقة.
          </p>
        </div>
      )}
      
      {/* 1. Left Sidebar: Interactive instructions and custom Drag/Drop Document analysis workspace */}
      <aside className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between overflow-y-auto max-h-full">
        <div className="space-y-4">
          <div className="border-b border-stone-150 pb-2.5">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              <span>مجلس المستشار {attorneyName}</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
              حلل مستنداتك القانونية وصكوك الاستئناف والعقود فورياً بسحبها وإلقائها واستدعاء قوة الرؤية الحاسوبية القانونية.
            </p>
          </div>

          {/* Luxury Custom Drag & Drop PDF / Image Document Workspace */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3.5">
            <span className="text-[10px] text-slate-800 font-extrabold block">
              📁 معمل تحليل الوثائق الذكي (رؤية Gemini)
            </span>

            {documentError && (
              <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl space-y-1 text-[10.5px] text-red-700 leading-relaxed font-sans relative">
                <p>{documentError}</p>
                <button 
                  type="button"
                  onClick={() => setDocumentError(null)} 
                  className="absolute top-1 left-1.5 text-red-400 hover:text-red-700 p-1"
                  title="إغلاق التنبيه"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {!attachedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-amber-400 bg-white hover:bg-amber-50/20 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group"
                title="اضغط أو اسحب وأفلت ملف PDF أو صورة لعقد/مسودة هنا"
              >
                <Upload className="h-7 w-7 text-stone-400 group-hover:text-amber-500 transition-colors mb-2 animate-pulse" />
                <span className="text-xs font-bold text-stone-700 block">اسحب ملف المستند هنا</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">يدعم أوراق الـ PDF والصور والمسودات</span>
                <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded mt-2 group-hover:bg-amber-100 group-hover:text-amber-800 font-sans transition-colors">تصفح الجهاز الخاص بك</span>
              </div>
            ) : (
              <div className="bg-white border border-amber-300/60 rounded-xl p-3.5 space-y-3 shadow-inner">
                {/* File Details with nice tag */}
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-amber-400 text-slate-900 rounded-lg shadow-sm">
                    <FileText className="h-5 w-5 shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-[11px] font-extrabold text-stone-800 truncate" title={attachedFile.name}>
                      {attachedFile.name}
                    </h5>
                    <p className="text-[10px] text-stone-500 font-sans mt-0.5">الحجم المفحوص: {attachedFile.sizeStr || "غير محدد"}</p>
                    <span className="inline-block mt-1 text-[8px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ جاهز للتحليل البصري
                    </span>
                    {attachedFile.isSliced && (
                      <div className="mt-1.5 p-1 px-2 bg-amber-50 border border-amber-200/60 rounded text-[9px] text-amber-800 leading-relaxed font-sans">
                        ⚠️ تم اقتطاع أول 20 ميجابايت من الملف تلقائياً لضمان سرعة معالجة الرؤية وتنسيق البيانات بنجاح!
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors bg-stone-50 hover:bg-red-50 rounded"
                    title="حذف وحذف الملف"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Instant Analysis Action Capabilities */}
                <div className="space-y-1.5 border-t border-stone-100 pt-2.5">
                  <span className="text-[9px] text-stone-400 font-bold block mb-1">اختر نمط التحليل الفوري للمستند:</span>
                  
                  <button
                    onClick={() => handleAnalyzeWithMode("extract")}
                    disabled={loading}
                    className="w-full p-2 bg-stone-900 border border-slate-800 text-white hover:bg-amber-400 hover:text-slate-900 text-[10px] font-bold rounded-lg flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      <span>تلخيص واستخراج النقاط الجوهرية</span>
                    </span>
                    <CornerDownLeft className="h-3 w-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleAnalyzeWithMode("loopholes")}
                    disabled={loading}
                    className="w-full p-2 bg-stone-900 border border-slate-800 text-white hover:bg-amber-400 hover:text-slate-900 text-[10px] font-bold rounded-lg flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      <span>كشف الثغرات والعيوب القانونية</span>
                    </span>
                    <CornerDownLeft className="h-3 w-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleAnalyzeWithMode("proofread")}
                    disabled={loading}
                    className="w-full p-2 bg-stone-900 border border-slate-800 text-white hover:bg-amber-400 hover:text-slate-900 text-[10px] font-bold rounded-lg flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5" />
                      <span>تدقيق قضائي وصياغة مصطلحات</span>
                    </span>
                    <CornerDownLeft className="h-3 w-3 opacity-60" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-stone-400 font-bold block">استشارات قضائية مقترحة مسبقاً</span>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.q)}
                  disabled={loading}
                  className="p-2.5 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-stone-700 font-semibold text-right text-[11px] transition-colors flex justify-between items-start gap-1 w-full"
                >
                  <span>{s.label}</span>
                  <CornerDownLeft className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Warning caution about AI under yemeni law jurisdiction */}
        <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl space-y-1 text-[9.5px] text-stone-600 mt-3 leading-relaxed shrink-0">
          <div className="flex items-center gap-1 font-bold text-amber-800 mb-0.5">
            <CircleAlert className="h-3.5 w-3.5 shrink-0" />
            <span>تنبيه عدلي تنظيمي:</span>
          </div>
          <p>
            تُصاغ الاستشارات وتُراجع آلياً وفق أحدث لوائح التشريعات بالجمهورية اليمنية، ويعتبر الرد استرشاداً تحضيرياً يعضد خطة مرافعة المحاماة.
          </p>
        </div>

      </aside>

      {/* 2. Main Chat Room: Dialogue box */}
      <main className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
        
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4.5 border-b border-amber-500 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <Sparkles className="h-4.5 w-4.5 font-bold" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs">حلقة التشاور الفوري والبحث الفقهي</h3>
              <p className="text-[9px] text-slate-400">{attorneyName} - مستشارك الذكي الشخصي</p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="p-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-red-400 text-xs rounded-xl font-bold flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>تصفير الجلسة</span>
          </button>
        </div>

        {/* Messages list bubble box */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/40">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div 
                key={idx}
                className={`flex gap-3 max-w-4xl text-xs leading-relaxed ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="p-2 bg-slate-900 rounded-xl text-amber-400 shrink-0 h-9 w-9 flex items-center justify-center font-extrabold shadow-sm border border-amber-500/20">
                    ع
                  </div>
                )}
                
                <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"} w-full max-w-[85%]`}>
                  {!isUser ? (
                    <div className="bg-white border-2 border-[#E2DDD1] rounded-2xl shadow-md text-stone-850 p-5 md:p-7 font-sans leading-loose w-full flex flex-col relative transition-all duration-300" dir="rtl">
                      {/* Yemeni Legal Letterhead Header on Screen */}
                      <div className="mb-4 border-b border-stone-200 pb-3 select-none shrink-0 text-right" dir="rtl">
                        <div className="flex justify-between items-start gap-4">
                          {/* Right details */}
                          <div className="text-[10px] sm:text-[11px] leading-relaxed text-slate-800 font-bold">
                            <p className="font-extrabold text-stone-950 text-xs">الجمهورية اليمنية</p>
                            <p className="text-amber-600 font-extrabold text-[10px]">المكتب الاستشاري</p>
                            <p className="text-[8px] text-stone-400 font-medium leading-tight">محاماة - تحكيم - استشارات قانونية - صياغة العقود</p>
                          </div>
                          {/* Center scales */}
                          <div className="text-center">
                            <div className="text-lg">⚖️</div>
                            <span className="text-[10px] font-extrabold text-slate-800">مكتب المحاماة</span>
                          </div>
                          {/* Left details */}
                          <div className="text-[9px] leading-relaxed text-slate-500 font-medium text-left font-sans" dir="ltr">
                            <p className="font-bold text-stone-950">Republic of Yemen</p>
                            <p className="text-amber-600 font-bold text-[8px]">Legal Office</p>
                          </div>
                        </div>
                        
                        {/* Metadata row under double line separator */}
                        <div className="border-t-2 border-double border-amber-500/30 mt-2.5 pt-1.5 flex justify-between text-[9px] text-slate-500 font-bold px-1">
                          <span>الرقم: استشارة قضائية #{idx}</span>
                          <span>التاريخ: {new Date().toLocaleDateString("ar-YE")}</span>
                          <span>المرفقات: آلي وموثق</span>
                        </div>
                      </div>

                      {/* Consultation Response text */}
                      <div 
                        className="text-xs text-justify font-sans text-stone-800 leading-relaxed space-y-2.5"
                        dangerouslySetInnerHTML={{ __html: formatCleanArabicText(m.text) }}
                      />

                      {/* Legal Letterhead Footer on Screen */}
                      <div className="mt-6 border-t border-stone-200 pt-2 text-[9px] text-stone-500 font-bold flex flex-col sm:flex-row justify-between items-center gap-1.5" dir="rtl">
                        <span className="truncate">📍 الأصبحي - شارع الأربعين - تقاطع شارع المقالح</span>
                        <div className="flex gap-2.5">
                          <span>📱 771673276 / 715375198</span>
                          <span>✉️ abduiiahalwutayhi7716@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl prose max-w-none text-xs text-justify font-sans whitespace-pre-wrap bg-amber-400 text-slate-950 rounded-br-none font-semibold shadow-sm">
                      {m.text}
                    </div>
                  )}

                  {!isUser && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCopy(m.text, idx)}
                        className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-600 hover:text-white bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 p-1 px-3 rounded-xl transition-all font-extrabold cursor-pointer font-sans shadow-sm"
                        title="نسخ نص الاستشارة كاملاً إلى الحافظة"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500 hover:text-white" />
                            <span className="text-emerald-500 font-extrabold">تم نسخ الاستشارة القضائية! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-amber-500" />
                            <span>نسخ الاستشارة</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => printMessage(m.text, idx)}
                        className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-600 hover:text-white bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 p-1 px-3 rounded-xl transition-all font-extrabold cursor-pointer font-sans shadow-sm"
                        title="طباعة الاستشارة مباشرة بالكليشة الرسمية"
                      >
                        <Printer className="h-3.5 w-3.5 text-amber-500" />
                        <span>طباعة بالكليشة</span>
                      </button>

                      <button
                        onClick={() => downloadMessageAsWord(m.text, idx)}
                        className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-600 hover:text-white bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 p-1 px-3 rounded-xl transition-all font-extrabold cursor-pointer font-sans shadow-sm"
                        title="تصدير الاستشارة إلى ملف وورد بالكليشة الرسمية"
                      >
                        <FileDown className="h-3.5 w-3.5 text-amber-500" />
                        <span>تصدير لوورد .doc</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="p-2 bg-amber-200 rounded-xl text-slate-950 shrink-0 h-9 w-9 flex items-center justify-center font-extrabold font-mono shadow-sm">
                    أنا
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="p-2 bg-slate-900 rounded-xl text-amber-500 shrink-0 h-9 w-9 flex items-center justify-center animate-pulse">
                ⏳
              </div>
              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl rounded-bl-none shadow-sm text-stone-500 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce delay-100"></span>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce delay-200"></span>
                <span>المستشار {attorneyName} يقوم بتحضير السند القانوني وكتابة التوجيهات...</span>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-650 font-semibold">
              <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h5>فشل الاتصال: {errorText}</h5>
                <p className="text-[10px] text-red-600 font-normal mt-0.5">يرجى التأكد من أن مفتاح GEMINI_API_KEY قد تم تهيئته وإدخاله بشكل صحيح وصالح عبر الإعدادات.</p>
              </div>
            </div>
          )}

          {uploadProgress !== null && (
            <div className="mx-auto max-w-xs bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-center space-y-3 shadow-sm my-3" id="advisor-upload-progress">
              <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="text-stone-200"
                    strokeWidth="4.5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="text-amber-600 transition-all duration-150"
                    strokeWidth="4.5"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - (uploadProgress ?? 0) / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute font-mono text-xs font-black text-stone-850">
                  {uploadProgress}%
                </div>
              </div>
              <div className="text-center text-xs space-y-1">
                <p className="font-bold text-stone-700">جاري رفع الملف كاملاً للمكتب السحابي...</p>
                <p className="text-[10px] text-stone-500 font-sans">مشفر ومحمي بالدرجة العدلية</p>
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>

        {/* Custom prompt composer inputs */}
        <div className="bg-white border-t border-stone-200 p-4">
          {attachedFile && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-2.5 px-4 text-xs text-amber-900 mb-2.5 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-400 text-slate-900 rounded-lg">
                  <FileText className="h-4 w-4 shrink-0" />
                </div>
                <div>
                  <span className="font-bold block truncate max-w-[220px] sm:max-w-md">{attachedFile.name}</span>
                  <span className="text-[10px] text-amber-700 font-sans">جاهز للتحليل بواسطة المستشار {attorneyName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 px-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="إزالة هذا الملف"
              >
                <X className="h-3 w-3" />
                <span>إزالة</span>
              </button>
            </div>
          )}

          {isReadingFile && (
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-2.5 px-1 font-semibold">
              <span className="w-2.5 h-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
              <span>جاري فحص وقراءة بيانات المستند محلياً...</span>
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 relative items-center"
          >
            {/* Hidden native file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />

            {/* Upload attachment trigger button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isReadingFile}
              className={`p-3.5 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 border duration-200 ${
                attachedFile 
                ? "bg-amber-400 text-slate-900 border-amber-500 hover:bg-amber-500 animate-pulse" 
                : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
              }`}
              title="إرفاق مستند لقراءة وتحليل الذكاء الاصطناعي للملف"
            >
              <Paperclip className="h-4 w-4 shrink-0" />
            </button>

            <input
              type="text"
              required={!attachedFile}
              disabled={loading || isReadingFile}
              placeholder={attachedFile ? "اطرح سؤالك أو اترك فارغاً للتحليل التلقائي الفوري للملف..." : `اكتب استشارتك للمحامي ${attorneyName}؛ مثلاً: صغ عريضة استئناف، ما حكم الشفعة باليمن؟`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:ring-1 focus:ring-amber-500 rounded-xl pr-4 pl-12 py-3.5 text-xs outline-none focus:bg-white transition-all text-right"
            />
            
            <button
              type="submit"
              disabled={loading || isReadingFile || (!inputVal.trim() && !attachedFile)}
              className={`p-3.5 rounded-xl flex items-center gap-1.5 transition-colors shadow shrink-0 font-bold ${
                loading || isReadingFile || (!inputVal.trim() && !attachedFile)
                ? "bg-stone-100 text-stone-400 cursor-not-allowed border"
                : "bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500"
              }`}
            >
              <Send className="h-4 w-4 transform rotate-180" />
              <span className="text-xs">تحليل وإرسال</span>
            </button>
          </form>
        </div>

      </main>

    </div>
  );
}
