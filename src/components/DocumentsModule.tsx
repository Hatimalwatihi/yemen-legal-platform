import { apiUrl } from "../utils/api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FolderGit2, FileText, Plus, BookOpen, Sparkles, Check, 
  Trash2, Copy, FilePlus, Eye, AlertCircle, Edit3, Printer, CheckCircle,
  Download, Maximize2, Minimize2, Type, Table, Bold, Underline,
  ArrowRightLeft, Camera, Upload, RefreshCw, FileImage
} from "lucide-react";
import { Document, Attachment } from "../types";
import { triggerVoiceNotification } from "../utils/audioNotifier";

interface DocumentsModuleProps {
  documents: Document[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onAddDoc: (doc: Document) => void;
  onUpdateDoc: (doc: Document) => void;
  onDeleteDoc: (id: string) => void;
  currentUser: { username: string; isAdmin?: boolean; subscriptionStatus?: string } | null;
}

export default function DocumentsModule({
  documents,
  selectedDocId,
  setSelectedDocId,
  onAddDoc,
  onUpdateDoc,
  onDeleteDoc,
  currentUser
}: DocumentsModuleProps) {
  const getSecureUrl = (url: string) => {
    if (!url) return "";
    const token = (currentUser as any)?.sessionToken || "";
    if (!token) return apiUrl(url);
    if (url.includes("?")) {
      return `${apiUrl(url)}&token=${encodeURIComponent(token)}`;
    }
    return `${apiUrl(url)}?token=${encodeURIComponent(token)}`;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorDocType, setEditorDocType] = useState("عقد");
  
  // Word Workspace Custom States
  const [fontSize, setFontSize] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showClicheOnScreen, setShowClicheOnScreen] = useState(true);

  // Pass-to-Pass share states
  const [isDocP2POpen, setIsDocP2POpen] = useState(false);
  const [p2pUserField, setP2pUserField] = useState("");
  const [p2pLoading, setP2pLoading] = useState(false);
  const [p2pError, setP2pError] = useState("");
  const [p2pSuccess, setP2pSuccess] = useState("");
  
  // AI assist states
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiFeedbackType, setAiFeedbackType] = useState<"loopholes" | "proofreading" | null>(null);
  
  // AI Generator Parameters Popup
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [genDocType, setGenDocType] = useState("عقد إيجار شقة سكنية يمني");
  const [genDetails, setGenDetails] = useState("");

  // Right side panel tabs and OCR states
  const [rightActiveTab, setRightActiveTab] = useState<"ai" | "ocr" | "storage">("ai");
  const [storageStatus, setStorageStatus] = useState<{
    usedBytes: number;
    totalBytes: number;
    usedFormatted: string;
    totalFormatted: string;
  } | null>(null);
  const [generalUploading, setGeneralUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchStorageStatus = async () => {
    try {
      const res = await fetch(apiUrl("/api/storage/status"));
      if (res.ok) {
        const data = await res.json();
        setStorageStatus(data);
      } else {
        setStorageStatus({
          usedBytes: 0,
          totalBytes: 5 * 1024 * 1024 * 1024,
          usedFormatted: "0.00 ميجابايت",
          totalFormatted: "5 جيجابايت"
        });
      }
    } catch (err) {
      console.warn("Soft fallback for storage status:", err);
      setStorageStatus({
        usedBytes: 0,
        totalBytes: 5 * 1024 * 1024 * 1024,
        usedFormatted: "0.00 ميجابايت",
        totalFormatted: "5 جيجابايت"
      });
    }
  };

  useEffect(() => {
    fetchStorageStatus();
  }, [documents, selectedDocId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadGeneralFile(e.dataTransfer.files[0]);
    }
  };

  const uploadGeneralFile = async (file: File) => {
    if (!selectedDoc) {
      alert("⚠️ يرجى اختيار أو إنشاء مستند أولاً من القائمة الجانبية لربط الملف المرفوع به.");
      return;
    }

    const MAX_SIZE_MB = 500;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`⚠️ عذراً، حجم هذا الملف كبير جداً (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت). الحد الأقصى للرفع هو ${MAX_SIZE_MB} ميجابايت.`);
      return;
    }

    setGeneralUploading(true);
    setUploadPercent(0);
    triggerVoiceNotification("جاري بدء رفع الملف إلى السحابة المحمية...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await new Promise<{ success: boolean; url?: string; error?: string }>((resolve, reject) => {
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
              const resJson = JSON.parse(xhr.responseText);
              resolve(resJson);
            } catch (err) {
              reject(new Error("فشل معالجة استجابة السيرفر."));
            }
          } else {
            reject(new Error(`فشل رفع الملف. كود السيرفر: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("حدث خطأ في الاتصال أثناء الرفع."));
        });

        xhr.open("POST", apiUrl("/api/upload-file"));
        xhr.setRequestHeader("x-session-token", (currentUser as any)?.sessionToken || "");
        xhr.send(formData);
      });

      if (data.success && data.url) {
        const newAtt: Attachment = {
          id: "att_" + Date.now(),
          name: file.name,
          size: file.size > 1024 * 1024 
            ? (file.size / (1024 * 1024)).toFixed(2) + " MB" 
            : (file.size / 1024).toFixed(1) + " KB",
          mimeType: file.type || "application/octet-stream",
          url: data.url,
          uploadDate: new Date().toISOString().split("T")[0]
        };

        const updatedDoc: Document = {
          ...selectedDoc,
          attachments: [newAtt, ...(selectedDoc.attachments || [])]
        };

        onUpdateDoc(updatedDoc);
        triggerVoiceNotification("تم رفع وحفظ الملف سحابياً بنجاح كجزء من المرفقات!");
        fetchStorageStatus();
      } else {
        throw new Error(data.error || "استجابة غير صالحة من السيرفر.");
      }
    } catch (err: any) {
      console.error("General file upload error:", err);
      alert(`⚠️ حدث خطأ أثناء رفع الملف: ${err.message || "يرجى التحقق من اتصال السيرفر."}`);
    } finally {
      setGeneralUploading(false);
      setUploadPercent(null);
    }
  };
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Helper to insert legal tags at cursor or append
  const insertTextAtCursor = (insertedText: string) => {
    const textarea = document.getElementById("legal-word-textarea") as HTMLTextAreaElement;
    if (textarea) {
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      const text = textarea.value;
      const newContent = text.substring(0, startPos) + insertedText + text.substring(endPos, text.length);
      setEditorContent(newContent);
      setIsEditing(true);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = startPos + insertedText.length;
        textarea.selectionEnd = startPos + insertedText.length;
      }, 50);
    } else {
      setEditorContent(prev => prev + insertedText);
      setIsEditing(true);
    }
  };

  // Helper to export document styled for Microsoft Word (.doc) with official Sharaf Al-Deen Law Office Letterhead
  const downloadAsWord = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${editorTitle}</title>
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
                <span style="font-size: 8.5px; color: #475569;">محاماة - تحكيم - استشارات قانونية - إعداد الدراسات والعقود التجارية - مترافع أمام المحكمة العليا</span>
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
                <td style="width: 33%; text-align: right;">الرقم: .......................................</td>
                <td style="width: 34%; text-align: center;">التاريخ: ...... / ...... / ...........٢٠٢م</td>
                <td style="width: 33%; text-align: left; direction: rtl;">المرفقات: ...................................</td>
              </tr>
            </table>
          </div>
        </div>

        <h2 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 25px; border-bottom: 2px solid #b58a3c; padding-bottom: 8px; display: inline-block;">${editorTitle}</h2>
        <div style="white-space: pre-wrap; direction: rtl; text-align: justify; font-size: 14px; margin-top: 10px;">
          ${editorContent.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}
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
    a.download = `${editorTitle || 'مستند_قانوني'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Image & Document OCR methods
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من حجم الصورة لضمان أداء مستقر في المتصفح والتعرف السريع
    const MAX_SIZE_MB = 3.5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`⚠️ عذراً، حجم هذه الصورة كبير جداً لتمريرها لمحرك التعرف الضوئي (OCR) (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت).\n\nيرجى استخدام صورة بحجم أقل من 3.5 ميجابايت لضمان سرعة المعالجة واستخراج النصوص بنجاح بدون التأثير على ذاكرة المتصفح.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedImage(reader.result);
        setOcrResult(null);
        setOcrError(null);
        triggerVoiceNotification("تم تحميل صورة الوثيقة بنجاح. جاهزة للاستخراج.");
      }
    };
    reader.onerror = () => {
      alert("فشل قراءة ملف الصورة المحدد.");
    };
    reader.readAsDataURL(file);
  };

  const runOcrOnImage = async (base64Str: string) => {
    if (!base64Str) return;
    setOcrLoading(true);
    setOcrResult(null);
    setOcrError(null);

    try {
      const response = await fetch(apiUrl("/api/gemini/ocr"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": (currentUser as any)?.sessionToken || ""
        },
        body: JSON.stringify({
          base64Image: base64Str,
          mimeType: "image/jpeg"
        })
      });

      if (!response.ok) throw new Error("فشلت عملية استخراج النصوص بالذكاء الاصطناعي.");
      const data = await response.json();
      setOcrResult(data.text || "لم نتمكن من استخراج أي نص مكتوب من الصورة المرفقة.");
      triggerVoiceNotification("اكتمل التعرف الضوئي! تظهر النتائج في اللوحة الجانبية.");
    } catch (err: any) {
      console.error("OCR API error:", err);
      setOcrError(err.message || "حدث خطأ أثناء الاتصال بالخادم الذكي لاستخراج النصوص.");
    } finally {
      setOcrLoading(false);
    }
  };

  const saveCapturedAsAttachment = () => {
    if (!uploadedImage || !selectedDoc) return;

    const approxSizeKb = Math.ceil((uploadedImage.length * 3) / 4 / 1024);
    const newAtt: Attachment = {
      id: "att_" + Date.now(),
      name: `مسح_ضوئي_${new Date().toISOString().split("T")[0]}_${Math.floor(Math.random() * 1000)}.jpg`,
      size: `${approxSizeKb} KB`,
      mimeType: "image/jpeg",
      base64Data: uploadedImage,
      uploadDate: new Date().toISOString().split("T")[0]
    };

    const updatedDoc: Document = {
      ...selectedDoc,
      attachments: [newAtt, ...(selectedDoc.attachments || [])]
    };

    onUpdateDoc(updatedDoc);
    setUploadedImage(null);
    setOcrResult(null);
    triggerVoiceNotification("تم إدراج وحفظ المستند المصور بنجاح في مرفقات المحرر!");
  };

  const deleteAttachment = (attId: string) => {
    if (!selectedDoc) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المستند المرفق المصور نهائياً؟")) return;

    const updatedDoc: Document = {
      ...selectedDoc,
      attachments: (selectedDoc.attachments || []).filter(a => a.id !== attId)
    };

    onUpdateDoc(updatedDoc);
    triggerVoiceNotification("تم حذف المستند المرفق بالنجاح.");
  };

  const insertOcrIntoEditor = () => {
    if (!ocrResult) return;
    setEditorContent(prev => prev + (prev ? "\n\n" : "") + ocrResult);
    setIsEditing(true);
    triggerVoiceNotification("تم إدراج النص المستخرج في محرر Word بنجاح.");
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId) || null;

  // Embedded Legal Templates in Arabic
  const TEMPLATES = [
    {
      title: "عريضة دعوى مطالبة مالية يمنية",
      docType: "عريضة دعوى",
      content: `أمام محكمة: ................... الابتدائية الموقرة.
موضوع الدعوى: مطالبة بأداء دين مالي مستحق قدره (...................) ريال يمني.
المدعي: ................... وموطنه المختار مكتب مكتب المحاماة والاستشارات القانونية.
المدعى عليه: ................... وعنوانه ...................

فضيلة القاضي ناظر الخصومة الموقر،
تحية طيبة وبعد، وبموجب هذا يتقدم موكلي برفع هذه الدعوى مفيداً بالحقائق الآلية:
1. يثبت بموجب السند المحرر المؤرخ في .../ .../ ......م بذمة المدعى عليه مبلغ مالي وقدره (...................) ريال يمني لصالح موكلي الوفاء به فوراً.
2. تكررت وعود المدعى عليه بالوفاء والسداد دون جدوى ومطالب عينية مستمرة مما ألجأ المدعي للمطالبة بطلب قضائي رسمي.
وحيث أن الامتناع عن سداد الدين مخالف لنص المادتين (110 - 114) من القانون المدني اليمني،

الطلبات:
نلتمس من فضيلتكم إصدار حكم قضائي يلزم المدعى عليه بـ:
أولاً: الوفاء بكامل المبلغ المستحق للمدعي وقدره ................... ريال يمني.
ثانياً: إلزامه بدفع كامل مخاسير التقاضي وأتعاب المحاماة البالغة ................... ريال يمني.

وتقبلوا فائق الاحترام والتقدير،
وكيل المدعي/ مكتب مكتب المحاماة`
    },
    {
      title: "عقد إيجار شقة سكني - القانون المدني",
      docType: "عقد",
      content: `إنه في يوم ................... الموافق .../ .../ ......م بالجمهورية اليمنية، تراضى الطرفان على الشروط والالتزامات الآتية:
الطرف الأول (المؤجر): ................... بطاقة شخصية رقم ...................
الطرف الثاني (المستأجر): ................... بطاقة شخصية رقم ...................

البند الأول: موضوع الإجارة:
أجر المؤجر للمستأجر القابل لذلك الشقة السكنية الواقعة في حي ................... بمدينة ................... محافظة ................... بغرض السكن العائلي فقط.

البند الثاني: مدة الإيجار والأجرة:
1. مدة هذا العقد هي (...................) تبدأ من تاريخ .../ .../ ......م وتنتهي تلقائياً في .../ .../ ......م.
2. الأجرة الشهرية المتفق عليها هي (...................) ريال يمني، تدفع مقدماً في بداية كل شهر هجري/ميلادي دون تأخير.

البند الثالث: شروط الإنهاء والترميم:
يخضع هذا العقد لأحكام القانون المدني اليمني ولائحة الإيجارات المنظمة، ويلتزم المستأجر بالمحافظة التامة على العين المؤجرة، وتسليمها عند نهاية العقد بنفس الحالة المستلمة بها.

توقيع المؤجر: ...................     توقيع المستأجر: ...................
شاهد أول: ...................         شاهد ثانٍ: ...................`
    },
    {
      title: "توكيل خاص لمرافعة ومدافعة لدى المحاكم",
      docType: "توكيل",
      content: `أنا الموقع أدناه: ................... الجنسية: يمني، بطاقة رقم ...................
قد وكلت بموجب هذا التوكيل المكتب الاستشاري - مكتب المحاماة، ليمثلني مرافعة ومدافعة والرد أمام جميع المحاكم الابتدائية والاستئنافية والمحكمة العليا وهيئات التحكيم بالجمهورية اليمنية، في القضية المتعلقة بـ ...................

الحقوق المفوضة بالتوكيل:
للوكيل الحق في تقديم وصحائف الدعاوى، حضور الجلسات، التوقيع على محاضر الصلح والتحكيم، توجيه ورصد الطعون والاستئنافات، طلب شهادة الشهود والمعاينة واستجواب الخصوم والرد، وقبض المبالغ واستلام الأحكام والقرارات وصكوك التنفيذ مع حلف اليمين من قبل الموكل إذا اقتضى الأمر.

وهذا تفويض مني وتوكيل تام وخاص بالتقاضي لا رجعة فيه إلا بموافقة خطية من الطرفين.

الموكل: ...................             التوقيع والـبـصمة:`
    }
  ];

  const handleOpenDoc = (doc: Document) => {
    setSelectedDocId(doc.id);
    setEditorTitle(doc.title);
    setEditorContent(doc.content);
    setEditorDocType(doc.docType);
    setIsEditing(false);
    setAiFeedback(null);
  };

  const handleCreateNewFile = () => {
    setSelectedDocId(null);
    setEditorTitle("مستند جديد غير معنون");
    setEditorContent("");
    setEditorDocType("عقد");
    setIsEditing(true);
    setAiFeedback(null);
  };

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setEditorTitle(tpl.title);
    setEditorContent(tpl.content);
    setEditorDocType(tpl.docType);
    setIsEditing(true);
  };

  const handleSaveEditor = () => {
    if (!editorTitle) return;

    if (selectedDocId) {
      // Update existing
      const updated: Document = {
        ...documents.find(d => d.id === selectedDocId)!,
        title: editorTitle,
        content: editorContent,
        docType: editorDocType,
        lastModified: new Date().toISOString().split("T")[0]
      };
      onUpdateDoc(updated);
    } else {
      // Add new
      const newDoc: Document = {
        id: "doc_" + Date.now(),
        title: editorTitle,
        content: editorContent,
        docType: editorDocType,
        lastModified: new Date().toISOString().split("T")[0],
        attachments: []
      };
      onAddDoc(newDoc);
      setSelectedDocId(newDoc.id);
    }
    setIsEditing(false);
  };

  // AI Assistant Integrations: Loopholes Analyzer & Legal Proofreader
  const callAiConsultation = async (type: "loopholes" | "proofreading") => {
    if (!editorContent) return;
    setAiGenerating(true);
    setAiFeedbackType(type);
    
    try {
      const response = await fetch(apiUrl("/api/gemini/analyze"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-session-token": (currentUser as any)?.sessionToken || ""
        },
        body: JSON.stringify({
          username: currentUser?.username,
          sessionToken: (currentUser as any)?.sessionToken || "",
          documentText: editorContent,
          analysisType: type
        })
      });

      if (!response.ok) throw new Error("فشل الاتصال بالخادم الذكي");
      const data = await response.json();
      const cleanedFeedback = (data.text || "").replace(/[*#]/g, "");
      setAiFeedback(cleanedFeedback);
    } catch (error: any) {
      setAiFeedback(`حدث خطأ أثناء الاتصال ومحاورة الذكاء الاصطناعي: ${error.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  // AI Intelligent Template Creator generator
  const handleAiGenerateFullDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genDetails) return;
    setAiGenerating(true);
    setShowAiGenerator(false);

    try {
      const response = await fetch(apiUrl("/api/gemini/draft"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-session-token": (currentUser as any)?.sessionToken || ""
        },
        body: JSON.stringify({
          username: currentUser?.username,
          sessionToken: (currentUser as any)?.sessionToken || "",
          docType: genDocType,
          parameters: {
            details: genDetails,
            lawFirm: "مكتب المحاماة"
          }
        })
      });

      if (!response.ok) throw new Error("تعذر توليد المستند بالكامل.");
      const data = await response.json();
      const cleanedDraft = (data.text || "").replace(/[*#]/g, "");
      
      setEditorTitle(`صيغة ذكية - ${genDocType}`);
      setEditorContent(cleanedDraft);
      setEditorDocType("عقد");
      setIsEditing(true);
    } catch (error: any) {
      alert(`خطأ: ${error.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editorContent);
    alert("تم نسخ محتوى المستند القانوني الحالي إلى الحافظة بنجاح!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[780px]" id="documents-module-root">
      
      {/* 1. Left Sidebar: Document browser and templates list */}
      <aside className="lg:col-span-3 bg-white border border-stone-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
        
        {/* Navigation & file creators */}
        <div className="mb-4 pb-3 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
            <FolderGit2 className="h-4.5 w-4.5 text-amber-500" />
            <span>المجموعة والمحررات</span>
          </h3>
          <button
            onClick={handleCreateNewFile}
            className="p-1.5 text-slate-950 bg-amber-400 hover:bg-amber-500 font-bold rounded-lg flex items-center gap-0.5 text-[10px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>جديد</span>
          </button>
        </div>

        {/* Existing Legal docs lists */}
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin max-h-[300px]">
          <span className="text-[10px] text-stone-400 font-bold block mb-1">المستندات المحفوظة بالمكتب ({documents.length})</span>
          {documents.length === 0 ? (
            <p className="text-[10px] text-stone-400 bg-stone-50 p-3 rounded text-center">لا توجد محررات سابقة.</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleOpenDoc(doc)}
                className={`p-2 rounded-lg cursor-pointer transition-colors text-right flex items-center gap-2 border ${
                  selectedDocId === doc.id
                    ? "bg-slate-900 border-amber-500 text-amber-400 font-semibold"
                    : "bg-stone-50 border-stone-100 hover:bg-stone-100 text-stone-700 text-xs"
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1 text-xs">{doc.title}</span>
              </div>
            ))
          )}
        </div>

        {/* Interactive Case templates section */}
        <div className="border-t border-stone-100 mt-4 pt-3 flex-1 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-400 font-bold">قوالب الصياغة القضائية اليمنية</span>
            <button
              onClick={() => setShowAiGenerator(true)}
              className="text-[10px] text-amber-600 bg-amber-50 p-1 rounded font-bold hover:underline border border-amber-200"
            >
              🪄 صياغة ذكية بالكامل
            </button>
          </div>

          <div className="space-y-1.5">
            {TEMPLATES.map((tpl, i) => (
              <div 
                key={i}
                onClick={() => handleApplyTemplate(tpl)}
                className="p-2 bg-stone-50 hover:bg-amber-50 rounded-lg text-right border border-stone-200 cursor-pointer transition-colors text-[11px] font-semibold text-stone-700 flex justify-between items-center group"
              >
                <span className="group-hover:text-amber-700">{tpl.title}</span>
                <span className="text-[8px] bg-stone-200 text-slate-800 px-1 py-0.5 rounded font-mono shrink-0">{tpl.docType}</span>
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* Backdrop for Fullscreen Word Workspace */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsFullscreen(false)} 
        />
      )}

      {/* 2. Middle Panel: Interactive Text Editor in a Dedicated Word Workspace */}
      <main className={`bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col bg-stone-50/20 transition-all duration-300 ${
        isFullscreen 
          ? "fixed inset-0 m-auto max-w-5xl h-[90vh] w-[92vw] shadow-2xl border-2 border-amber-500 z-50 bg-white" 
          : "lg:col-span-6 h-full"
      }`}>
        
        {/* Editor Controls bar */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs text-slate-200 font-extrabold flex items-center gap-1">
              <span>بيئة معالجة وتحرير ملفات Word</span>
              {isFullscreen && <span className="bg-amber-400/15 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">ملء الشاشة</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Download Word Document Button (Extremely reliable .doc exporter) */}
            <button
              onClick={downloadAsWord}
              disabled={!editorContent}
              className="p-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 shadow-md cursor-pointer"
              title="تحميل مباشر ومصادق بصيغة وورد DOC"
            >
              <Download className="h-3.5 w-3.5" />
              <span>تحميل Word (DOC.)</span>
            </button>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 px-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>تحرير النص</span>
              </button>
            ) : (
              <button
                onClick={handleSaveEditor}
                className="p-1.5 px-3.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-extrabold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <Check className="h-4 w-4" />
                <span>حفظ التعديلات</span>
              </button>
            )}

            <button
              onClick={copyToClipboard}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
              title="نسخ محتوى المستند"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            {/* P2P Pass-to-Pass share button for documents */}
            {selectedDocId && (
              <button
                onClick={() => setIsDocP2POpen(true)}
                className="p-1.5 bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.03]"
                title="تمرير هذا المستند فورا بالخط السريع لزميل قانوني"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span className="hidden leading-none font-bold sm:inline pb-0.5">تمرير Pass-to-Pass</span>
              </button>
            )}

            <button
              onClick={() => {
                const w = window.open();
                if (w) {
                  w.document.write(`
                    <html>
                    <head>
                      <title>${editorTitle}</title>
                      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
                      <style>
                        @page {
                          size: A4;
                          margin: 15mm;
                        }
                        body {
                          font-family: 'Cairo', 'Amiri', 'Times New Roman', serif;
                          direction: rtl;
                          padding: 0;
                          margin: 0;
                          line-height: 1.8;
                          text-align: justify;
                          color: #0f172a;
                          position: relative;
                          min-height: 100%;
                          box-sizing: border-box;
                        }
                        /* Header Styles */
                        .cliche-header {
                          display: flex;
                          justify-content: space-between;
                          align-items: flex-start;
                          padding-bottom: 12px;
                          border-bottom: 3px double #b58a3c;
                          margin-bottom: 15px;
                        }
                        .header-right {
                          width: 35%;
                          text-align: right;
                          font-size: 11px;
                          line-height: 1.4;
                        }
                        .header-center {
                          width: 30%;
                          text-align: center;
                        }
                        .header-left {
                          width: 35%;
                          text-align: left;
                          direction: ltr;
                          font-size: 11px;
                          line-height: 1.4;
                        }
                        /* Metadata row */
                        .metadata-row {
                          display: flex;
                          justify-content: space-between;
                          font-size: 12px;
                          font-weight: bold;
                          color: #0f172a;
                          margin-bottom: 30px;
                        }
                        /* Watermark */
                        .watermark {
                          position: absolute;
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                          opacity: 0.04;
                          width: 450px;
                          height: 450px;
                          pointer-events: none;
                          z-index: -1;
                        }
                        /* Main content area */
                        .content-body {
                          font-size: 15px;
                          line-height: 1.9;
                          color: #1e293b;
                          white-space: pre-wrap;
                          min-height: 450px;
                          z-index: 10;
                          position: relative;
                        }
                        .document-title {
                          text-align: center;
                          font-size: 20px;
                          font-weight: 900;
                          color: #0b1e36;
                          margin-bottom: 25px;
                          border-bottom: 2px solid #b58a3c;
                          display: inline-block;
                          padding-bottom: 6px;
                          margin-left: auto;
                          margin-right: auto;
                        }
                        /* Footer */
                        .cliche-footer {
                          position: fixed;
                          bottom: 0;
                          left: 0;
                          right: 0;
                          border-top: 1.5px solid #cbd5e1;
                          padding-top: 10px;
                          text-align: center;
                          font-size: 10.5px;
                          font-weight: bold;
                          color: #475569;
                          display: flex;
                          justify-content: center;
                          gap: 15px;
                          background: white;
                        }
                      </style>
                    </head>
                    <body>
                      <!-- Watermark -->
                      <div class="watermark">
                        <svg width="100%" height="100%" viewBox="0 0 100 100">
                          <line x1="50" y1="10" x2="50" y2="75" stroke="#0f172a" stroke-width="2"/>
                          <path d="M35 75 L65 75 M40 75 L45 70 L55 70 L60 75" fill="none" stroke="#0f172a" stroke-width="2"/>
                          <line x1="20" y1="25" x2="80" y2="25" stroke="#0f172a" stroke-width="3"/>
                          <circle cx="50" cy="10" r="3" fill="#0f172a"/>
                          <circle cx="20" cy="25" r="2.5" fill="#0f172a"/>
                          <circle cx="80" cy="25" r="2.5" fill="#0f172a"/>
                          <line x1="20" y1="25" x2="12" y2="45" stroke="#0f172a" stroke-width="1"/>
                          <line x1="20" y1="25" x2="28" y2="45" stroke="#0f172a" stroke-width="1"/>
                          <path d="M10 45 Q20 50 30 45" fill="none" stroke="#0f172a" stroke-width="1.5"/>
                          <line x1="80" y1="25" x2="72" y2="45" stroke="#0f172a" stroke-width="1"/>
                          <line x1="80" y1="25" x2="88" y2="45" stroke="#0f172a" stroke-width="1"/>
                          <path d="M70 45 Q80 50 90 45" fill="none" stroke="#0f172a" stroke-width="1.5"/>
                          <path d="M35 65 Q50 60 50 68 Q50 60 65 65 L65 53 Q50 48 50 56 Q50 48 35 53 Z" fill="none" stroke="#0f172a" stroke-width="1.5"/>
                          <path id="wmTextPath" d="M 15,70 A 38,38 0 0,0 85,70" fill="none" stroke="none"/>
                          <text font-size="7.5" font-weight="bold" fill="#0f172a" letter-spacing="0.5">
                            <textPath href="#wmTextPath" startOffset="50%" text-anchor="middle">مكتب المحاماة</textPath>
                          </text>
                          <text x="20" y="58" font-size="7" font-weight="extrabold" fill="#475569" text-anchor="middle">العدل</text>
                          <text x="80" y="58" font-size="7" font-weight="extrabold" fill="#475569" text-anchor="middle">الحق</text>
                        </svg>
                      </div>

                      <!-- Header Cliche -->
                      <div class="cliche-header">
                        <!-- Right -->
                        <div class="header-right">
                          <strong style="font-size: 13.5px; font-weight: 900; color: #0f172a; display: block; margin-bottom: 2px;">الجمهورية اليمنية</strong>
                          <span style="font-size: 11.5px; font-weight: bold; color: #b58a3c; display: block; margin-bottom: 2px;">المكتب الاستشاري</span>
                          <span style="font-size: 8px; font-weight: bold; color: #475569; display: block; line-height: 1.3;">محاماة - تحكيم - استشارات قانونية - إعداد الدراسات والعقود التجارية - مترافع أمام المحكمة العليا</span>
                        </div>

                        <!-- Center Logo -->
                        <div class="header-center">
                          <svg width="70" height="70" viewBox="0 0 100 100" style="display: inline-block;">
                            <line x1="50" y1="10" x2="50" y2="75" stroke="#0f172a" stroke-width="2"/>
                            <path d="M35 75 L65 75 M40 75 L45 70 L55 70 L60 75" fill="none" stroke="#0f172a" stroke-width="2"/>
                            <line x1="20" y1="25" x2="80" y2="25" stroke="#0f172a" stroke-width="3"/>
                            <circle cx="50" cy="10" r="3" fill="#0f172a"/>
                            <circle cx="20" cy="25" r="2.5" fill="#0f172a"/>
                            <circle cx="80" cy="25" r="2.5" fill="#0f172a"/>
                            <line x1="20" y1="25" x2="12" y2="45" stroke="#0f172a" stroke-width="1"/>
                            <line x1="20" y1="25" x2="28" y2="45" stroke="#0f172a" stroke-width="1"/>
                            <path d="M10 45 Q20 50 30 45" fill="none" stroke="#0f172a" stroke-width="1.5"/>
                            <line x1="80" y1="25" x2="72" y2="45" stroke="#0f172a" stroke-width="1"/>
                            <line x1="80" y1="25" x2="88" y2="45" stroke="#0f172a" stroke-width="1"/>
                            <path d="M70 45 Q80 50 90 45" fill="none" stroke="#0f172a" stroke-width="1.5"/>
                            <path d="M35 65 Q50 60 50 68 Q50 60 65 65 L65 53 Q50 48 50 56 Q50 48 35 53 Z" fill="none" stroke="#0f172a" stroke-width="1.5"/>
                            <path id="hdrTextPath" d="M 15,70 A 38,38 0 0,0 85,70" fill="none" stroke="none"/>
                            <text font-size="7.5" font-weight="bold" fill="#0f172a" letter-spacing="0.5">
                              <textPath href="#hdrTextPath" startOffset="50%" text-anchor="middle">مكتب المحاماة</textPath>
                            </text>
                            <text x="20" y="58" font-size="7" font-weight="extrabold" fill="#475569" text-anchor="middle">العدل</text>
                            <text x="80" y="58" font-size="7" font-weight="extrabold" fill="#475569" text-anchor="middle">الحق</text>
                          </svg>
                        </div>

                        <!-- Left -->
                        <div class="header-left">
                          <strong style="font-size: 11px; font-weight: bold; color: #0f172a; display: block; margin-bottom: 2px;">Republic of Yemen</strong>
                          <span style="font-size: 10px; font-weight: bold; color: #475569; display: block; margin-bottom: 2px;">Consultation office</span>
                          <span style="font-size: 7px; color: #64748b; display: block; line-height: 1.3;">Lawyer - Arbitration - Legal advice - Studies & Contracts<br>Pleaded before the Supreme Court</span>
                        </div>
                      </div>

                      <!-- Metadata Row -->
                      <div class="metadata-row">
                        <div>الرقم: .......................................</div>
                        <div>التاريخ: ...... / ...... / ...........٢٠٢م</div>
                        <div>المرفقات: ...................................</div>
                      </div>

                      <!-- Title -->
                      <div style="text-align: center;">
                        <h2 class="document-title">${editorTitle}</h2>
                      </div>

                      <!-- Content Body -->
                      <div class="content-body">${editorContent}</div>

                      <!-- Footer -->
                      <div class="cliche-footer">
                        <span>📍 الأصبحي - شارع الأربعين - تقاطع شارع المقالح - فوق مفروشات الصرمي مقابل الكريمي</span>
                        <span>📱 هاتف: 771673276 / 715375198 967+</span>
                        <span>✉️ البريد: abduiiahalwutayhi7716@gmail.com</span>
                      </div>
                    </body>
                    </html>
                  `);
                  w.print();
                } else {
                  alert("يرجى إعطاء تصريح لفتح النوافذ المنبثقة للطباعة أو استخدام متصفح يدعم ذلك.");
                }
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg"
              title="معاينة وطباعة"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>

            {/* Fullscreen focused toggle button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs"
              title={isFullscreen ? "تصغير شاشة تحرير وورد" : "وضع ملء الشاشة الفخم للكتابة"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 text-amber-400" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Real Editor Layout Input forms */}
        <div className="flex-1 p-5 flex flex-col space-y-3.5 overflow-y-auto bg-[#FBFBFA]">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div className="md:col-span-2 space-y-1">
              <label className="font-bold text-stone-500">عنوان المستند أو القضية</label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="مثال: عقد إيجار شقة، لائحة دعوى مالية..."
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
                className="w-full bg-white border border-stone-200 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-500">تصنيف وورد وموضوع المحرر</label>
              <select
                disabled={!isEditing}
                value={editorDocType}
                onChange={(e) => setEditorDocType(e.target.value)}
                className="w-full bg-white border border-stone-200 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5"
              >
                <option value="عقد">عقد توثيق مالي</option>
                <option value="بصيرة">بصيرة شرعية (وثيقة ملكية)</option>
                <option value="عريضة دعوى">عريضة دعوى قضائية</option>
                <option value="مذكرة دفاع">مذكرة دفاع أو رد موضوعي</option>
                <option value="توكيل">صيغة توكيل مخصص</option>
              </select>
            </div>
          </div>

          {/* Quick Word-style formatting toolbar */}
          <div className="bg-stone-100 p-2 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              
              {/* Size helper widget */}
              <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1 gap-1">
                <Type className="h-3.5 w-3.5 text-stone-400" />
                <button
                  type="button"
                  onClick={() => setFontSize(prev => Math.max(11, prev - 1))}
                  className="w-5 h-5 flex items-center justify-center bg-stone-50 hover:bg-stone-200 rounded font-black text-slate-900 cursor-pointer"
                  title="تصغير خط الكتابة"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold px-1 text-slate-800">{fontSize}px</span>
                <button
                  type="button"
                  onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                  className="w-5 h-5 flex items-center justify-center bg-stone-50 hover:bg-stone-200 rounded font-black text-slate-900 cursor-pointer"
                  title="تكبير خط الكتابة"
                >
                  +
                </button>
              </div>

              {/* Tag Injector Helpers */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("**نص عريض**")}
                className="p-1 px-2.5 bg-white hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-lg font-bold flex items-center gap-1 text-[10px]"
                title="تغميق الخط المحدد أو موضع المؤشر"
              >
                <Bold className="h-3.5 w-3.5 text-slate-900" />
                <span className="hidden sm:inline">عريض</span>
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor("<u>نص مسطر</u>")}
                className="p-1 px-2.5 bg-white hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-lg font-bold flex items-center gap-1 text-[10px]"
                title="تسطير أسفل الخط"
              >
                <Underline className="h-3.5 w-3.5 text-slate-900" />
                <span className="hidden sm:inline">مسطر</span>
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor(`\n| الطرف الأول | الطرف الثاني | موضوع الالتزام | المبلغ المقرر |\n| :--- | :--- | :--- | :--- |\n| ................... | ................... | ................... | ................... |\n`)}
                className="p-1 px-2.5 bg-white hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-lg font-bold flex items-center gap-1 text-[10px]"
                title="إدراج جدول بيانات متناسق"
              >
                <Table className="h-3.5 w-3.5 text-slate-900" />
                <span className="hidden sm:inline">جدول</span>
              </button>
            </div>

            {/* Core Legal Yemeni Clauses shortcuts */}
            <div className="flex flex-wrap items-center gap-1 text-[10px]">
              <span className="text-stone-400 font-bold ml-1 text-[9px] hidden md:inline">إدخالات وورد سريعة:</span>
              <button
                type="button"
                onClick={() => insertTextAtCursor("\nبِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ\n")}
                className="bg-slate-900 text-amber-400 px-1.5 py-1 rounded hover:bg-slate-800 font-extrabold"
              >
                البسملة
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("\nالجمهورية اليمنية\nالمكتب الاستشاري\nمكتب المحاماة والاستشارات القانونية - هاتف: 771673276\n----------------\n")}
                className="bg-white hover:bg-amber-50 text-slate-800 border border-stone-200 px-1.5 py-1 rounded font-bold"
              >
                تروّيسة المكتب
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("\nالبند الأول (تمهيد عقدي):\nيعتبر التمهيد المذكور أعلاه جزءاً لا يتجزأ من هذا العقد وبنداً أساسياً من بنوده التفسيرية والملزمة للطرفين.\n")}
                className="bg-white hover:bg-amber-50 text-slate-800 border border-stone-200 px-1.5 py-1 rounded font-bold"
              >
                التمهيد
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("\nبند فض النزاعات والاختصاص القضائي:\nتخضع كافة بنود هذا العقد وتفسيرها لأحكام القانون المدني اليمني وقانون الإثبات وقوانين المرافعات بالجمهورية اليمنية، وفي حال نشوء أي نزاع يكون الفصل فيه حصرياً من اختصاص المحاكم اليمنية الموقرة.\n")}
                className="bg-white hover:bg-amber-50 text-slate-800 border border-stone-200 px-1.5 py-1 rounded font-bold"
              >
                بند التحكيم والقانون
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("\nتوقيع وبصمة الطرف الأول: ...................\nتوقيع وبصمة الطرف الثاني: ...................\nشاهد أول: ...................\tشاهد ثانٍ: ...................\nصودق بمكتب مكتب المحاماة في تاريخ: .../ .../ ......م\n")}
                className="bg-white hover:bg-amber-50 text-slate-800 border border-stone-200 px-1.5 py-1 rounded font-bold"
              >
                التوقيعات والبصمة
              </button>
            </div>
          </div>

          {/* Interactive Document Area Styled as White Legal Paper */}
          <div className="flex-1 flex flex-col bg-white border-[#E2DDD1] border-2 rounded-2xl shadow-inner overflow-hidden">
            {/* Header Cliche Preview on Screen Toggle */}
            <div className="bg-stone-50 border-b border-stone-100 p-4 flex flex-col md:flex-row justify-between gap-4 text-right shrink-0" dir="rtl">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="show-cliche-screen" 
                  checked={showClicheOnScreen}
                  onChange={(e) => setShowClicheOnScreen(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <label htmlFor="show-cliche-screen" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                  <span>تفعيل وعرض الكليشة الرسمية للوتيحي على الشاشة</span>
                </label>
              </div>
              <div className="text-[10px] text-stone-500 font-bold">
                * الكليشة والترويسة مدمجة تلقائياً عند الطباعة والتصدير لوورد (.doc)
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto relative p-6 bg-stone-50">
              <div className={`w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-stone-200 p-6 md:p-10 min-h-[600px] flex flex-col relative transition-all duration-300 ${showClicheOnScreen ? "ring-2 ring-amber-500/10" : ""}`}>
                
                {showClicheOnScreen && (
                  <div className="mb-6 border-b-2 border-double border-amber-500/40 pb-5 select-none shrink-0" dir="rtl">
                    {/* Header Row */}
                    <div className="grid grid-cols-3 gap-2 items-start text-right">
                      {/* Right (Arabic) */}
                      <div className="text-[10px] sm:text-[11px] leading-relaxed text-slate-900 font-bold">
                        <p className="font-extrabold text-xs text-slate-950">الجمهورية اليمنية</p>
                        <p className="text-amber-600 font-extrabold">المكتب الاستشاري</p>
                        <p className="text-[8px] text-slate-500 font-medium leading-tight">محاماة - تحكيم - استشارات قانونية - إعداد الدراسات والعقود التجارية - مرافعة أمام المحكمة العليا</p>
                      </div>

                      {/* Center Logo */}
                      <div className="flex justify-center items-center">
                        <div className="text-center">
                          <svg width="65" height="65" viewBox="0 0 100 100" className="mx-auto text-slate-900">
                            <line x1="50" y1="10" x2="50" y2="75" stroke="currentColor" strokeWidth="2.5"/>
                            <path d="M35 75 L65 75 M40 75 L45 70 L55 70 L60 75" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                            <line x1="20" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="3.5"/>
                            <circle cx="50" cy="10" r="3.5" fill="currentColor"/>
                            <circle cx="20" cy="25" r="3" fill="currentColor"/>
                            <circle cx="80" cy="25" r="3" fill="currentColor"/>
                            <line x1="20" y1="25" x2="12" y2="45" stroke="currentColor" strokeWidth="1"/>
                            <line x1="20" y1="25" x2="28" y2="45" stroke="currentColor" strokeWidth="1"/>
                            <path d="M10 45 Q20 50 30 45" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                            <line x1="80" y1="25" x2="72" y2="45" stroke="currentColor" strokeWidth="1"/>
                            <line x1="80" y1="25" x2="88" y2="45" stroke="currentColor" strokeWidth="1"/>
                            <path d="M70 45 Q80 50 90 45" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M35 65 Q50 60 50 68 Q50 60 65 65 L65 53 Q50 48 50 56 Q50 48 35 53 Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                            <path id="scrTextPath" d="M 15,70 A 38,38 0 0,0 85,70" fill="none" stroke="none" />
                            <text fontSize="7.5" fontWeight="bold" fill="currentColor" letterSpacing="0.5">
                              <textPath href="#scrTextPath" startOffset="50%" textAnchor="middle">مكتب المحاماة</textPath>
                            </text>
                            <text x="21" y="58" fontSize="7" fontWeight="extrabold" fill="#b58a3c" textAnchor="middle">العدل</text>
                            <text x="79" y="58" fontSize="7" fontWeight="extrabold" fill="#b58a3c" textAnchor="middle">الحق</text>
                          </svg>
                        </div>
                      </div>

                      {/* Left (English) */}
                      <div className="text-left text-[9px] sm:text-[10px] leading-relaxed text-slate-800 font-bold" dir="ltr">
                        <p className="font-extrabold text-slate-950">Republic of Yemen</p>
                        <p className="font-extrabold">Consultation office</p>
                        <p className="text-[7.5px] text-slate-500 font-medium leading-tight">Lawyer - Arbitration - Legal advice - Studies & Contracts<br/>Pleaded before the Supreme Court</p>
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="mt-4 flex justify-between items-center text-[10px] font-extrabold text-slate-900 border-t border-amber-500/10 pt-3">
                      <div>الرقم: <span className="text-stone-400 font-normal font-mono">.......................</span></div>
                      <div>التاريخ: <span className="text-stone-400 font-normal font-mono">.... / .... / .......٢٠٢م</span></div>
                      <div>المرفقات: <span className="text-stone-400 font-normal font-mono">.......................</span></div>
                    </div>
                  </div>
                )}

                {/* Watermark in background if enabled */}
                {showClicheOnScreen && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
                    <svg width="280" height="280" viewBox="0 0 100 100" className="text-slate-950">
                      <line x1="50" y1="10" x2="50" y2="75" stroke="currentColor" strokeWidth="2"/>
                      <path d="M35 75 L65 75 M40 75 L45 70 L55 70 L60 75" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <line x1="20" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="3"/>
                      <circle cx="50" cy="10" r="3.5" fill="currentColor"/>
                      <circle cx="20" cy="25" r="3" fill="currentColor"/>
                      <circle cx="80" cy="25" r="3" fill="currentColor"/>
                      <line x1="20" y1="25" x2="12" y2="45" stroke="currentColor" strokeWidth="1"/>
                      <line x1="20" y1="25" x2="28" y2="45" stroke="currentColor" strokeWidth="1"/>
                      <path d="M10 45 Q20 50 30 45" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <line x1="80" y1="25" x2="72" y2="45" stroke="currentColor" strokeWidth="1"/>
                      <line x1="80" y1="25" x2="88" y2="45" stroke="currentColor" strokeWidth="1"/>
                      <path d="M70 45 Q80 50 90 45" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M35 65 Q50 60 50 68 Q50 60 65 65 L65 53 Q50 48 50 56 Q50 48 35 53 Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                )}

                {/* Textarea container */}
                <textarea
                  id="legal-word-textarea"
                  disabled={!isEditing}
                  style={{ fontSize: `${fontSize}px` }}
                  placeholder="ابدأ بكتابة مستندك وصياغة العقود أو اللوائح هنا... استعن بأدوات التنسيق والقوالب وصانع الصيغ الذكي المدمج."
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full flex-1 bg-transparent border-none resize-none outline-none text-right font-serif leading-relaxed min-h-[300px] z-10 relative focus:ring-0 focus:outline-none p-0"
                />

                {showClicheOnScreen && (
                  <div className="mt-8 border-t border-stone-200 pt-3 select-none text-[8.5px] sm:text-[9.5px] text-stone-500 font-bold flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0" dir="rtl">
                    <span className="truncate text-center sm:text-right">📍 الأصبحي - شارع الأربعين - تقاطع شارع المقالح - فوق مفروشات الصرمي مقابل الكريمي</span>
                    <div className="flex gap-3 justify-center">
                      <span>📱 هاتف: 771673276 / 715375198 967+</span>
                      <span>✉️ البريد: abduiiahalwutayhi7716@gmail.com</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Microsoft Word Status Indicator bar */}
          <div className="bg-stone-100/85 border border-stone-200 rounded-xl p-2.5 flex flex-wrap justify-between items-center text-[10px] font-sans text-stone-500 gap-2">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span><b>الصفحات التقريبية بوورد:</b> {Math.ceil(editorContent.split(/\s+/).filter(Boolean).length / 320) || 1} صفحة</span>
              <span className="text-stone-300">|</span>
              <span><b>عدد الكلمات الإجمالي:</b> {editorContent.split(/\s+/).filter(Boolean).length} كلمة</span>
              <span className="text-stone-300">|</span>
              <span><b>الأحرف والمسافات:</b> {editorContent.length} حرفاً</span>
            </div>
            
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>جاهز للتصدير لملف وورد (.doc)</span>
            </div>
          </div>

        </div>

        {/* AI quick bar inside the bottom wrapper block */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex flex-wrap justify-between items-center gap-3">
          <span className="text-[10px] text-stone-600 font-extrabold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>المعاون القانوني الذكي: دقق لغوياً واكتشف الثغرات على ضوء المذهب والمدونة القضائية اليمنية</span>
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => callAiConsultation("proofreading")}
              disabled={!editorContent || aiGenerating}
              className="px-3.5 py-1.5 bg-slate-900 text-amber-400 hover:bg-slate-800 text-[10px] font-extrabold rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>تحسين وتدقيق مصلطحات</span>
            </button>
            <button
              onClick={() => callAiConsultation("loopholes")}
              disabled={!editorContent || aiGenerating}
              className="px-3.5 py-1.5 bg-stone-200 text-stone-800 hover:bg-amber-100 hover:text-amber-800 text-[10px] font-extrabold rounded-lg border border-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>اكتشاف الثغرات العقدية</span>
            </button>
          </div>
        </div>

      </main>

      {/* 3. Right Panel: Custom AI feedback and Document Scanner OCR */}
      <aside className="lg:col-span-3 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
        
        <div className="bg-slate-900 border-b border-slate-800 text-white flex flex-col">
          <div className="p-4 pb-2 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-amber-400" />
            <h3 className="font-extrabold text-xs">المستشار العدلي الرقمي الذكي</h3>
          </div>
          
          {/* Elegant top tabs */}
          <div className="flex border-t border-slate-800/85">
            <button
              onClick={() => setRightActiveTab("ai")}
              className={`flex-1 py-2 text-center text-[10px] font-bold transition-all border-b-2 ${
                rightActiveTab === "ai"
                  ? "border-amber-400 text-amber-400 bg-slate-950/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🪄 المستشار الذكي
            </button>
            <button
              onClick={() => setRightActiveTab("ocr")}
              className={`flex-1 py-2 text-center text-[10px] font-bold transition-all border-b-2 ${
                rightActiveTab === "ocr"
                  ? "border-amber-400 text-amber-400 bg-slate-950/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              📄 استخراج النصوص (OCR)
            </button>
            <button
              onClick={() => setRightActiveTab("storage")}
              className={`flex-1 py-2 text-center text-[10px] font-bold transition-all border-b-2 ${
                rightActiveTab === "storage"
                  ? "border-amber-400 text-amber-400 bg-slate-950/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              💾 التخزين السحابي (5GB)
            </button>
          </div>
        </div>

        {rightActiveTab === "ai" && (
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4">
            {aiGenerating ? (
              <div className="text-center py-20 space-y-3">
                <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs text-amber-700 animate-pulse font-bold">يقوم المستشار العدلي الرقمي بدراسة مستندك الآن...</p>
                <p className="text-[9px] text-stone-400 line-clamp-1">يطابق نصوص القانون والفقرات النافذة في اليمن</p>
              </div>
            ) : aiFeedback ? (
              <div className="space-y-4 animate-fade-in text-justify leading-relaxed">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-[10px]">
                  <span className="font-extrabold text-amber-800">
                    {aiFeedbackType === "loopholes" ? "🔍 نتائج فحص الثغرات" : "📝 التدقيق اللغوي والمقترحات"}
                  </span>
                  <button
                    onClick={() => {
                      if (aiFeedbackType === "proofreading" && confirm("هل تود اعتماد الصياغة المقترحة وكتابتها فوق النص الحالي في المحرر؟")) {
                        setEditorContent(aiFeedback);
                        setIsEditing(true);
                      }
                    }}
                    className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-md hover:bg-amber-600 truncate"
                  >
                    {aiFeedbackType === "proofreading" ? "اعتماد النص المصلّح" : "دراسة مكتملة"}
                  </button>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 prose max-w-none text-xs leading-loose whitespace-pre-wrap font-sans">
                  {aiFeedback}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-stone-400 space-y-3">
                <AlertCircle className="h-10 w-10 text-stone-300 mx-auto" />
                <p className="text-xs font-semibold text-stone-500">لائحة الردود والاستشارات فارغة</p>
                <p className="text-[10px] text-stone-400 max-w-xs leading-relaxed">
                  اكتب مستنداً بالمحرر الأوسط أو حدد نموذجاً من اليسار، ثم اضغط على "اكتشاف الثغرات العقدية" أو "تحسين ومراجعة" بالأسفل لترى التوصيات والدراسة القضائية هنا في الحال بليغة ومقنعة!
                </p>
              </div>
            )}
          </div>
        )}

        {rightActiveTab === "ocr" && (
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4">
            {!selectedDocId ? (
              <div className="text-center py-20 text-stone-400 space-y-3">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-stone-600">الرجاء اختيار مستند أولاً</p>
                <p className="text-[10px] text-stone-400 leading-normal max-w-xs mx-auto">
                  اختر أحد المستندات المحفوظة من اليمين أو اضغط "جديد" للربط والتحميل عليه ومسح الصور الخاصة به.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Image Picker */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-3">
                  <span className="font-extrabold text-stone-700 block border-b pb-1">📄 استخراج النصوص من الصور (OCR)</span>
                  
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <div className="relative overflow-hidden rounded-lg border border-stone-300 aspect-video bg-stone-100 flex items-center justify-center">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded Document" 
                          className="max-w-full max-h-full object-contain" 
                        />
                        <button
                          type="button"
                          onClick={() => { setUploadedImage(null); setOcrResult(null); }}
                          className="absolute top-1.5 right-1.5 bg-red-600/80 hover:bg-red-700 text-white p-1 rounded-full text-xs shadow-md"
                          title="تجاهل الصورة"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => runOcrOnImage(uploadedImage)}
                          disabled={ocrLoading}
                          className="col-span-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-sm font-sans"
                        >
                          {ocrLoading ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>جاري التعرف على الكلمات...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>🤖 استخراج النص بالصورة (OCR)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={saveCapturedAsAttachment}
                          className="bg-slate-900 hover:bg-slate-850 text-white font-bold py-1.5 rounded-lg text-[9px] flex items-center justify-center gap-1 border border-stone-700"
                        >
                          <FilePlus className="h-3 w-3" />
                          <span>📁 حفظ كمرفق دائـم</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setUploadedImage(null); setOcrResult(null); }}
                          className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-1.5 rounded-lg text-[10px]"
                        >
                          تجاهل
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-stone-500 leading-normal">
                        ارفع ملفاً من الأستوديو أو جهازك هنا وسيقوم الذكاء الاصطناعي باستخراج الكلمات بدقة بالغة.
                      </p>
                      
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-stone-300 border-dashed rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors p-3 text-center">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <Upload className="h-6 w-6 text-stone-400 mb-1" />
                            <p className="text-[10px] text-stone-500 font-bold">اضغط هنا لرفع صورة المستند</p>
                            <p className="text-[8px] text-stone-450 mt-0.5">يدعم JPG, PNG بجودة عالية</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* OCR Output Result and usage */}
                {ocrLoading && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                    <RefreshCw className="h-6 w-6 text-amber-600 animate-spin mx-auto" />
                    <p className="text-[10px] text-amber-800 font-extrabold animate-pulse">
                      يقوم المستشار العدلي الرقمي بمسح الوثيقة وتحليل الخطوط وتطبيعها...
                    </p>
                  </div>
                )}

                {ocrError && (
                  <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-[10px]">
                    ⚠️ {ocrError}
                  </div>
                )}

                {ocrResult && (
                  <div className="bg-white border-2 border-amber-200 rounded-xl p-3 space-y-2 shadow-inner">
                    <span className="font-extrabold text-[11px] text-amber-800 block border-b pb-1">💡 النص المستخرج بنجاح:</span>
                    <textarea
                      value={ocrResult}
                      onChange={(e) => setOcrResult(e.target.value)}
                      rows={5}
                      className="w-full text-right bg-stone-50 border border-stone-200 rounded-lg p-2 text-[11px] leading-relaxed font-sans outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={insertOcrIntoEditor}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-1.5 rounded-lg text-[10px]"
                      >
                        ✍️ إدراج بمحرر Word
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(ocrResult);
                          alert("تم نسخ النص المستخرج بنجاح!");
                        }}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold p-1.5 rounded-lg text-[10px]"
                      >
                        📋 نسخ النص المستخرج
                      </button>
                    </div>
                  </div>
                )}

                {/* List of Attachments already inside the document */}
                <div className="space-y-2">
                  <span className="font-extrabold text-[10px] text-stone-400 block tracking-wide uppercase">
                    المرفقات المصورة المحفوظة بهذا الملف ({selectedDoc?.attachments?.length || 0})
                  </span>
                  
                  {(!selectedDoc?.attachments || selectedDoc.attachments.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-stone-200 bg-stone-50 text-center text-stone-400">
                      <FileImage className="h-6 w-6 mx-auto mb-1 opacity-40 text-stone-400" />
                      <p className="text-[10px]">لا توجد لوائح ومستندات مصورة محفوظة لهذا الملف.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
                      {selectedDoc.attachments.map((att) => (
                        <div 
                          key={att.id} 
                          className="bg-white border border-stone-200 rounded-lg p-2 text-right flex flex-col gap-1.5"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] text-stone-400 font-mono">{att.size}</span>
                            <span className="font-extrabold text-[11px] text-slate-800 line-clamp-1 truncate flex-1 pl-2">
                              📎 {att.name}
                            </span>
                          </div>

                          <div className="flex justify-between items-center bg-stone-50/60 p-1 rounded text-[9px] text-stone-500">
                            <span>التاريخ: {att.uploadDate}</span>
                            <div className="flex gap-2">
                              {att.base64Data && (
                                <button
                                  type="button"
                                  onClick={() => runOcrOnImage(att.base64Data!)}
                                  className="text-amber-700 hover:underline font-bold"
                                  title="إجراء المسح والتعرف الضوئي (OCR)"
                                >
                                  🤖 إستخراج OCR
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => deleteAttachment(att.id)}
                                className="text-red-650 hover:underline font-bold"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {rightActiveTab === "storage" && (
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4 flex flex-col h-full">
            {/* Storage Quota Header */}
            <div className="bg-stone-50 border border-stone-250 rounded-xl p-3 space-y-2 text-right">
              <span className="font-extrabold text-stone-700 block text-xs">💾 مساحة التخزين السحابية المخصصة</span>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: storageStatus 
                        ? `${Math.min(100, (storageStatus.usedBytes / storageStatus.totalBytes) * 100)}%` 
                        : "0%" 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                  <span>السعة الإجمالية: 5 جيجابايت</span>
                  <span>المستخدم: {storageStatus?.usedFormatted || "0.00 ميجابايت"}</span>
                </div>
              </div>
              <p className="text-[9px] text-stone-400 leading-normal">
                حسابك مزود بمساحة سحابية مشفرة ومؤمنة بالكامل لحفظ لوائح المحكمة، أدلة وقرائن ومستندات الموكلين بدقة بالغة.
              </p>
            </div>

            {/* Upload Area */}
            {!selectedDocId ? (
              <div className="text-center py-12 text-stone-400 space-y-3">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-stone-600">يرجى اختيار مستند لرفع المرفقات</p>
                <p className="text-[10px] text-stone-400 leading-normal max-w-xs mx-auto">
                  اختر مستنداً أو نموذجاً من القائمة الجانبية لتتمكن من رفع وحفظ ملفات القضية أو صور الأدلة وسيعود لك بمسودة سريعة.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors relative cursor-pointer ${
                    dragActive 
                      ? "border-amber-500 bg-amber-50/50" 
                      : "border-stone-300 bg-stone-50 hover:bg-stone-100/60"
                  }`}
                >
                  <input 
                    type="file" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        uploadGeneralFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Upload className="h-7 w-7 text-stone-400" />
                    <p className="text-[11px] font-bold text-stone-600">اسحب وأفلت الملفات واللوائح هنا</p>
                    <p className="text-[9px] text-stone-400">أو اضغط لتصفح الملفات من جهازك</p>
                    <p className="text-[8px] text-stone-450 font-mono">يدعم كافة الملفات (PDF, Word, صور, إلخ) حتى 500MB</p>
                  </div>
                </div>

                {generalUploading && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center shadow-sm">
                    {uploadPercent !== null && (
                      <div className="relative flex items-center justify-center w-14 h-14 bg-white rounded-full p-1 shadow-sm">
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
                    <div className="space-y-1">
                      <p className="text-[10px] text-amber-800 font-bold">جاري رفع وحفظ الملف في السحابة المحمية...</p>
                      <p className="text-[9px] text-stone-500 font-sans">تشفير عدلي فوري</p>
                    </div>
                  </div>
                )}

                {/* Attachments list inside the active document */}
                <div className="space-y-2">
                  <span className="font-extrabold text-[10px] text-stone-400 block tracking-wide uppercase text-right">
                    المستندات والمرفقات السحابية لهذا الملف ({selectedDoc?.attachments?.length || 0})
                  </span>

                  {(!selectedDoc?.attachments || selectedDoc.attachments.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-stone-200 bg-stone-50 text-center text-stone-400">
                      <FileImage className="h-6 w-6 mx-auto mb-1 opacity-45 text-stone-400" />
                      <p className="text-[10px]">لا توجد مرفقات سحابية في هذا المستند حالياً.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
                      {selectedDoc.attachments.map((att) => (
                        <div 
                          key={att.id} 
                          className="bg-white border border-stone-200 rounded-lg p-2.5 text-right flex flex-col gap-1.5 shadow-sm hover:border-stone-300 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] text-stone-400 font-mono">{att.size}</span>
                            <span className="font-extrabold text-[11px] text-slate-800 line-clamp-1 truncate flex-1 pl-2">
                              {att.url ? "☁️ " : "📎 "}{att.name}
                            </span>
                          </div>

                          <div className="flex justify-between items-center bg-stone-50/60 px-2 py-1 rounded text-[9px] text-stone-500 font-sans">
                            <span>التاريخ: {att.uploadDate}</span>
                            <div className="flex gap-2">
                              {att.url && (
                                <a
                                  href={getSecureUrl(att.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-700 hover:underline font-bold flex items-center gap-0.5"
                                  title="فتح أو تنزيل الملف المرفق"
                                >
                                  <Download className="h-3 w-3 inline" /> تنزيل
                                </a>
                              )}
                              {att.base64Data && !att.url && (
                                <button
                                  type="button"
                                  onClick={() => runOcrOnImage(att.base64Data!)}
                                  className="text-amber-700 hover:underline font-bold"
                                >
                                  🤖 إستخراج OCR
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => deleteAttachment(att.id)}
                                className="text-red-650 hover:underline font-bold"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </aside>

      {/* Modal: AI Smart Full Document Generator Form */}
      {showAiGenerator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-300 text-right">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                <span>مولد المستندات القانونية الفوري</span>
              </h4>
              <button 
                onClick={() => setShowAiGenerator(false)}
                className="text-stone-400 font-bold hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAiGenerateFullDoc} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-600">حدد النموذج القانوني المستهدف</label>
                <select
                  value={genDocType}
                  onChange={(e) => setGenDocType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold"
                >
                  <option value="عقد إيجار شقة سكنية يمني">عقد إيجار شقة سكنية يمني مغلظ</option>
                  <option value="عقد بيع نهائي لقطعة أرض باليمن">عقد بيع نهائي لقطعة أرض فضاء</option>
                  <option value="عريضة دعوى مطالبة بإرجاع سيارة ومستحقات">عريضة دعوى مالية وتجارية</option>
                  <option value="لائحة استئناف حكم أحوال شخصية لعدم النفقة">لائحة استئناف حكم الأحوال الشخصية</option>
                  <option value="توكيل خاص ومصادق لدى محكمة غرب الأمانة">توكيل خاص بالخصومة والقبض</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-600">المعطيات وأسماء الأطرف، الشروط والأسعار</label>
                <textarea
                  required
                  rows={4}
                  placeholder="مثال:&#10;الطرف الأول (المؤجر): عادل محمود&#10;الطرف الثاني (المستأجر): عثمان عيسى&#10;المدينة: الأمانة بقيمة 120 ألف ريال شهرياً يبتدئ من الأسبوع المقبل..."
                  value={genDetails}
                  onChange={(e) => setGenDetails(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-amber-400 hover:bg-slate-800 py-2.5 rounded-xl font-bold flex justify-center items-center gap-1 border border-amber-500 animate-pulse"
              >
                <span>ابدأ التوليد الصارم بالذكاء الاصطناعي</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pass-to-Pass Document P2P Sharing Modal */}
      {isDocP2POpen && selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-right text-stone-800" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h4 className="font-extrabold text-sm text-slate-950 flex items-center gap-1.5 justify-start">
                <ArrowRightLeft className="h-4 w-4 text-amber-500 shrink-0" />
                <span>🚀 خدمة تمرير المستند السحابية (Pass-to-Pass)</span>
              </h4>
              <button 
                onClick={() => {
                  setIsDocP2POpen(false);
                  setP2pError("");
                  setP2pSuccess("");
                  setP2pUserField("");
                }}
                className="text-stone-400 hover:text-stone-600 font-extrabold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              قم بتمرير هذا المستند القانوني بالكامل (المسمى: <strong className="text-slate-900">{selectedDoc.title}</strong>) من حسابك السحابي إلى حساب زميل آخر مشترك فوراً في لمحة بصر.
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
                      itemType: "document",
                      itemData: selectedDoc
                    })
                  });
                  const resData = await res.json();
                  if (!res.ok) throw new Error(resData.error || "عذراً، فشل تمرير المستند السحابي.");

                  setP2pSuccess(resData.message);
                  triggerVoiceNotification(`مبروك! تم بنجاح تمرير المستند بالكامل إلى المحامي المستهدف ${p2pUserField}`);
                  setTimeout(() => {
                    setIsDocP2POpen(false);
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
              <span>{p2pLoading ? "جاري الاتصال السريع والتمرير..." : "🚀 تمرير المستند بالكامل الآن"}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
