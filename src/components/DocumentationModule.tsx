/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ReactNode } from "react";
import { 
  BookOpen, 
  Search, 
  Printer, 
  FileText, 
  Award, 
  Bookmark, 
  ChevronRight, 
  ChevronLeft,
  Scale,
  Compass,
  Database,
  Layers,
  Activity,
  User,
  Users,
  Code,
  CheckCircle,
  HelpCircle,
  FolderOpen,
  Calendar,
  Volume2,
  FileCode,
  Sliders,
  Bell,
  Cpu,
  Copy,
  Check,
  Shield,
  Key,
  Lock,
  Network,
  GitCommit,
  ArrowRightLeft,
  AlertTriangle,
  Tablet,
  CheckSquare,
  TrendingUp,
  BookMarked
} from "lucide-react";

// Local Copier Utility
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border border-stone-200"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          <span className="text-emerald-600 font-extrabold">تم النسخ!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>نسخ الكود</span>
        </>
      )}
    </button>
  );
}

export default function DocumentationModule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("cover");
  const [viewMode, setViewMode] = useState<"book" | "scroll">("scroll");
  const [currentPage, setCurrentPage] = useState(0);

  // Chapters list with detailed academic texts, structures, tables and diagrams of the Security App
  const chapters = useMemo(() => [
    {
      id: "cover",
      title: "صفحة الغلاف الرسمية للمشروع",
      pages: "1 - 2",
      category: "المستندات التمهيدية",
      icon: <Award className="h-4 w-4" />,
      content: (
        <div className="bg-white border-[10px] border-double border-amber-600 p-8 md:p-12 rounded-3xl shadow-md text-center space-y-8 relative overflow-hidden" dir="rtl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-900/5 rounded-full -ml-16 -mb-16"></div>
          
          {/* Header Seals */}
          <div className="flex justify-between items-center border-b border-stone-200 pb-6 text-xs text-stone-600 font-bold">
            <div className="text-right space-y-1">
              <p>الجمهورية اليمنية</p>
              <p>وزارة التعليم العالي والبحث العلمي</p>
              <p>جامعة العلوم والتكنولوجيا - فرع إب</p>
              <p>كلية الحاسبات وتكنولوجيا المعلومات</p>
              <p className="text-amber-700">قسم الأمن السيبراني والشبكات</p>
            </div>
            <div className="w-16 h-16 bg-slate-50 border border-stone-200 rounded-2xl flex items-center justify-center p-2 shadow-sm">
              {/* Fallback elegant representation of University Logo */}
              <div className="text-center font-serif">
                <span className="text-amber-600 block text-xs font-black">UST</span>
                <span className="text-[7px] text-stone-400 block tracking-widest">IBB</span>
              </div>
            </div>
          </div>

          <div className="py-12 space-y-4">
            <h1 className="font-serif text-2xl md:text-3xl text-slate-900 font-black tracking-tight leading-snug">
              تطبيق ذكي لتقييم مستوى أمان الهاتف المحمول
            </h1>
            <h2 className="font-mono text-sm md:text-base text-slate-500 tracking-wide font-bold">
              Smart Mobile Security Assessment Application (MSA)
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full my-4"></div>
            <p className="text-[10px] text-stone-400 font-bold">مشروع تخرج لنيل درجة البكالوريوس في الأمن السيبراني والشبكات</p>
          </div>

          {/* Table of project details */}
          <div className="max-w-md mx-auto bg-stone-50 border border-stone-200 rounded-2xl p-6 text-xs text-stone-700 space-y-3.5 shadow-sm text-right">
            <div className="border-b border-stone-200 pb-2">
              <span className="text-stone-400 font-bold block mb-1">فريق المشروع الباحث:</span>
              <div className="grid grid-cols-2 gap-2 text-right pr-2">
                <span className="font-extrabold text-slate-900">- حاتم بن علي الوتيحي</span>
                <span className="font-extrabold text-slate-900">- أسامة صالح النقيب</span>
                <span className="font-extrabold text-slate-900">- أحمد الدعيس</span>
                <span className="font-extrabold text-slate-900">- فهد الدعيس</span>
                <span className="font-extrabold text-slate-900">- عزالدين البناء</span>
              </div>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-400 font-bold">تحت إشراف الدكتور القدير:</span>
              <span className="font-extrabold text-amber-800">د. إبراهيم النظامي</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-stone-400 font-bold">العام الأكاديمي:</span>
              <span className="font-extrabold text-stone-900 font-mono">2025 - 2026م</span>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-200 flex justify-center gap-6 text-[10px] text-stone-400 font-bold">
            <span>صفحة 1 - 2 من أطروحة الوتيحي وزملائه</span>
            <span>•</span>
            <span>جميع الحقوق العلمية محفوظة للجامعة والباحثين ©</span>
          </div>
        </div>
      )
    },
    {
      id: "quran",
      title: "البسملة والآية الكريمة",
      pages: "3",
      category: "المستندات التمهيدية",
      icon: <Bookmark className="h-4 w-4" />,
      content: (
        <div className="bg-white border-4 border-amber-500/30 p-8 md:p-12 rounded-3xl shadow-md text-center space-y-8 relative" dir="rtl">
          <div className="max-w-xl mx-auto border-2 border-amber-400/20 p-6 md:p-10 rounded-2xl bg-amber-50/5 text-slate-800 space-y-8">
            <h2 className="font-serif text-lg text-amber-700 font-bold">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</h2>
            
            <div className="border border-stone-200 p-6 rounded-xl bg-stone-50 max-w-md mx-auto">
              <p className="text-xs text-amber-800 mb-2 font-bold font-serif">قال تعالى</p>
              <p className="font-serif text-base md:text-xl text-slate-900 leading-loose italic font-extrabold px-4">
                "وَمَا أُوتِيتُمْ مِنَ الْعِلْمِ إِلَّا قَلِيلًا"
              </p>
              <p className="text-xs text-stone-400 mt-2 font-serif">— سورة الإسراء، الآية ٨٥ —</p>
            </div>
          </div>

          <div className="space-y-3 max-w-md mx-auto pt-6 text-xs text-stone-600 text-justify leading-relaxed">
            <p className="font-bold text-center text-slate-900 border-b border-stone-200 pb-2">أثر الآية في فلسفة مشروع التخرج:</p>
            <p>
              تأتي هذه الآية الكريمة كدستور إلهي صارم يضبط التواضع العلمي وأمانة البحث. فمهما ارتقى الإنسان في مدارج المعرفة وبناء المنصات الرقمية الذكية أو معايير الأمن السيبراني المتطورة لحماية العدالة والمحاماة، فإنه يدرك يقيناً أن علمه ضئيل أمام علم الخالق سبحانه وتعالى، مما يدفعه للتحري المستمر، ومطابقة البيانات، ونصرة المظلومين بالحق البين.
            </p>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 3 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "declaration",
      title: "إقرار فريق العمل والوفاء",
      pages: "4",
      category: "المستندات التمهيدية",
      icon: <User className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3">
            <h2 className="text-base font-black text-slate-900">إقرار فريق العمل بالأمانة العلمية والبرمجية</h2>
            <p className="text-[10px] text-stone-500 font-bold">جامعة العلوم والتكنولوجيا - إب • كلية تكنولوجيا المعلومات</p>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed text-justify">
            نحن فريق العمل بمشروع <strong className="text-slate-900 font-extrabold">"المنصة العدلية الرقمية لمكاتب المحاماة والاستشارات القانونية"</strong>، المقيدون بقسم الأمن السيبراني والشبكات بكلية الحاسبات وتكنولوجيا المعلومات، نقر بكامل قوانا المعتبرة قانوناً وعلمياً بأن هذه الأطروحة بشقيها النظري والعملي هي نتاج جهدنا الشخصي الصادق، بالاستعانة بالمراجع والدراسات المسجلة في الفصل الخاص بالمصادر.
          </p>

          <p className="text-xs text-stone-700 leading-relaxed text-justify">
            كما نقر ونعترف بأن كافة الشيفرات والمخططات الهندسية والبرمجية المضمنة في الجانب العملي هي نتاج ابتكارنا البرمجي الخالص، وتم تطويرها لتلبي الاحتياجات الميدانية لرقمنة وتأمين قطاع المحاماة في الجمهورية اليمنية، ولم تسبق تقديمها لأي جهة عملية أخرى.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-10 text-xs text-stone-700 font-bold">
            <div className="border border-stone-200 p-4 rounded-xl space-y-2 bg-stone-50">
              <p className="text-stone-400 text-center font-bold">توقيع فريق العمل البرمجي:</p>
              <ul className="text-slate-900 font-black pt-2 space-y-1 text-right list-decimal pr-4">
                <li>حاتم بن علي الوتيحي</li>
                <li>أسامة صالح النقيب</li>
                <li>أحمد الدعيس</li>
                <li>فهد الدعيس</li>
                <li>عزالدين البناء</li>
              </ul>
            </div>
            <div className="border border-stone-200 p-4 rounded-xl space-y-2 text-center bg-stone-50 flex flex-col justify-center">
              <p className="text-stone-400">مصادقة المشرف الأكاديمي:</p>
              <p className="text-amber-800 font-black pt-4">الدكتور / إبراهيم النظامي</p>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-8">صفحة 4 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "dedication",
      title: "الإهداء الأكاديمي والمهني",
      pages: "5",
      category: "المستندات التمهيدية",
      icon: <Users className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 text-center">
            <h2 className="text-base font-black text-slate-900">إهداء وفاء وعرفان</h2>
          </div>

          <div className="space-y-4 text-xs text-stone-700 leading-relaxed italic max-w-xl mx-auto text-justify py-6">
            <p className="font-bold text-slate-900 text-sm text-center mb-4">نهدي هذا العمل المتواضع والجهد الأكاديمي والعملي الدؤوب إلى:</p>
            
            <p className="text-amber-800 font-black text-sm">
              • إلى والدينا العزيزين اللذين كانا لنا السند والحصن، فمنحانا كل حبهما ودعماها بلا حدود حتى وصلنا إلى بر النجاح والتميز العلمي.
            </p>

            <p className="text-slate-900 font-extrabold">
              • إلى أساتذتنا الأجلاء وقادة الفكر الأكاديمي، الذين سخروا خبراتهم العريضة وعلمهم الغزير ليرشدونا، فكانوا بمثابة مصابيح تضيء طريق دراستنا وتكسبنا مهارات التحليل وحماية البيانات وتطوير النظم.
            </p>

            <p className="text-stone-600">
              • إلى إخوتنا وأصدقائنا الأوفياء، الذين وقفوا كتفاً بكتف إلى جانبنا في أوقات التحدي وتجاوز العقبات البرمجية، وشاركونا بهجة الفوز والإنجاز، فكانوا خير معين ودافع لنا.
            </p>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-8">صفحة 5 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "thanks",
      title: "شكر وتقدير",
      pages: "6",
      category: "المستندات التمهيدية",
      icon: <Award className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3">
            <h2 className="text-base font-black text-slate-900">شكر وتقديـر</h2>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed text-justify font-bold text-slate-900 mb-2">
            الحمد لله رب العالمين والصلاة والسلام على أشرف الأنبياء والمرسلين سيدنا محمد وعلى آله وصحبه ومن تبعهم بإحسان إلى يوم الدين، وبعد..
          </p>

          <p className="text-xs text-stone-700 leading-relaxed text-justify">
            فإننا نشكر الله تعالى على فضله حيث أتاح لنا إنجاز هذا العمل بفضله، فله الحمد أوّلاً وآخراً.
          </p>

          <p className="text-xs text-stone-700 leading-relaxed text-justify font-bold text-amber-800">
            ثم نود ان نتقدم بخالص الشكر والامتنان لجميع الدكاترة والأساتذة في الجامعة الذين لا يدخرون جهداً في تقديم العلم والمعرفة وتقديم يد العون في الأوقات الصعبة.
          </p>

          <p className="text-xs text-stone-700 leading-relaxed text-justify">
            نتقدم بجزيل شكرنا إلى كل من مدوا لنا يد العون والمساعدة في إخراج هذه الدراسة على أكمل وجه، ولا يفوتنا أن نشكر كل من ساعدنا وقدم لنا الدعم، سواء بتوفير المراجع العلمية، أو تسهيل الوصول إلى بيئات العمل والبيئة التجريبية لمكاتب المحاماة في اليمن، أو بإبداء الملاحظات التي ساهمت في تحسين جودة هذا البحث.
          </p>

          <p className="text-xs text-emerald-800 leading-relaxed text-justify font-bold">
            وأخيراً، نعاهد الله أن يكون هذا العمل خطوة في مسيرة خدمة وطننا ومجتمعنا، وأن يكون لبنة في بناء صرح المعرفة والعدالة الرقمية المحمية تقنياً وسيبيرنياً.
          </p>

          <p className="text-[10px] text-stone-400 text-center pt-8">صفحة 6 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "index",
      title: "الفهرس العام للمشروع والأبواب",
      pages: "7 - 8",
      category: "المستندات التمهيدية",
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 flex justify-between items-center">
            <h2 className="text-base font-black text-slate-900">الفهرس العام لتبويب الأطروحة (70 صفحة حقيقية)</h2>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono font-bold">Index Table</span>
          </div>

          <p className="text-xs text-stone-500">
            يوضح هذا الفهرس التقسيمات الهيكلية للأبواب والفصول الأكاديمية والصفحات المقابلة لها في ملف التخرج الرسمي:
          </p>

          <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <th className="p-3">الفصل / البند</th>
                  <th className="p-3">العنوان والمحتوى التفصيلي</th>
                  <th className="p-3 text-center">الصفحة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="p-3 font-bold">الفصل الأول</td>
                  <td className="p-3">الإطار العام للمشروع (المقدمة، المشكلة، الأهداف، الأهمية والحدود)</td>
                  <td className="p-3 text-center font-mono font-bold">13 - 19</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold">الفصل الثاني</td>
                  <td className="p-3">الخلفية النظرية والدراسات السابقة (البرمجيات الضارة، كشف التهديدات، والمقارنات)</td>
                  <td className="p-3 text-center font-mono font-bold">20 - 27</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">الفصل الثالث</td>
                  <td className="p-3">منهجية البحث والنمذجة (بناء الخوارزميات، SMOTE, وتصميم المخططات UML)</td>
                  <td className="p-3 text-center font-mono font-bold">28 - 41</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold">الفصل الرابع</td>
                  <td className="p-3">النتائج والتنفيذ العملي (تدريب نماذج Keras, منحنيات الدقة, وواجهات التطبيق)</td>
                  <td className="p-3 text-center font-mono font-bold">42 - 67</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">الفصل الخامس</td>
                  <td className="p-3">الاستنتاجات والتوصيات (النتائج العامة والخاتمة وأبحاث التطوير المستقبلي)</td>
                  <td className="p-3 text-center font-mono font-bold">68 - 70</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold">المراجع والملاحق</td>
                  <td className="p-3">قائمة 30 مرجعاً علمياً مع الشيفرات البرمجية ومصطلحات البحث للنموذج الذكي</td>
                  <td className="p-3 text-center font-mono font-bold">71 - 85</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-stone-400 text-center">صفحة 7 - 8 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "dictionary",
      title: "فهرس الأشكال ومصطلحات البحث",
      pages: "9 - 12",
      category: "المستندات التمهيدية",
      icon: <Layers className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 flex justify-between items-center">
            <h2 className="text-base font-black text-slate-900">مصطلحات البحث العلمي والأمني (Glossary)</h2>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono font-bold">Terminology</span>
          </div>

          <p className="text-xs text-stone-500">
            يحتوي هذا الباب على قائمة بالمصطلحات والرموز العلمية والأمنية والبرمجية الأساسية المستخدمة في أطروحة التخرج:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs max-h-[400px] overflow-y-auto pr-1">
            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 space-y-1.5">
              <p className="font-bold border-b border-stone-200 pb-1 text-amber-700">مصطلحات الذكاء والتعلم:</p>
              <div className="flex justify-between"><span>الذكاء الاصطناعي (AI)</span><span className="font-mono">Artificial Intelligence</span></div>
              <div className="flex justify-between"><span>تعلم الآلة (ML)</span><span className="font-mono">Machine Learning</span></div>
              <div className="flex justify-between"><span>التعلم العميق (DL)</span><span className="font-mono">Deep Learning</span></div>
              <div className="flex justify-between"><span>الشبكات العصبية (NN)</span><span className="font-mono">Neural Networks</span></div>
              <div className="flex justify-between"><span>الشبكة العصبية العميقة (DNN)</span><span className="font-mono">Deep Neural Network</span></div>
              <div className="flex justify-between"><span>الذاكرة الطويلة قصيرة المدى (LSTM)</span><span className="font-mono">Long Short-Term Memory</span></div>
              <div className="flex justify-between"><span>التعلم الخاضع للإشراف (SL)</span><span className="font-mono">Supervised Learning</span></div>
            </div>

            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 space-y-1.5">
              <p className="font-bold border-b border-stone-200 pb-1 text-amber-700">مصطلحات التهديدات والأمن:</p>
              <div className="flex justify-between"><span>البرمجيات الضارة (MAL)</span><span className="font-mono">Malware / Malicious Software</span></div>
              <div className="flex justify-between"><span>برمجيات الفدية (RANS)</span><span className="font-mono">Ransomware</span></div>
              <div className="flex justify-between"><span>برامج التجسس (SPY)</span><span className="font-mono">Spyware</span></div>
              <div className="flex justify-between"><span>حصان طروادة (TROJ)</span><span className="font-mono">Trojan Horse</span></div>
              <div className="flex justify-between"><span>برامج الاحتيال (SCARE)</span><span className="font-mono">Scareware</span></div>
              <div className="flex justify-between"><span>أدوات الاختراق (EXP)</span><span className="font-mono">Exploits</span></div>
              <div className="flex justify-between"><span>أمن الهواتف المحمولة (MOB-SEC)</span><span className="font-mono">Mobile Security</span></div>
            </div>

            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 space-y-1.5">
              <p className="font-bold border-b border-stone-200 pb-1 text-amber-700">تقنيات الفحص والتحليل:</p>
              <div className="flex justify-between"><span>التحليل الساكن (SA)</span><span className="font-mono">Static Analysis</span></div>
              <div className="flex justify-between"><span>التحليل الديناميكي (DA)</span><span className="font-mono">Dynamic Analysis</span></div>
              <div className="flex justify-between"><span>استخراج الميزات (FE)</span><span className="font-mono">Feature Extraction</span></div>
              <div className="flex justify-between"><span>موازنة فئات البيانات (SMOTE)</span><span className="font-mono">SMOTE Resampling</span></div>
              <div className="flex justify-between"><span>تكامل المنصة للفلاتر (FFI)</span><span className="font-mono">Flutter FFI</span></div>
              <div className="flex justify-between"><span>قاعدة الثغرات الشائعة (CVE)</span><span className="font-mono">Common Vulnerabilities</span></div>
            </div>

            <div className="border border-stone-200 p-4 rounded-xl space-y-2 bg-stone-50">
              <p className="text-stone-400 text-right font-bold">فهرس الأشكال والأدلة:</p>
              <ul className="text-slate-900 font-bold space-y-1 text-right text-[11px] list-disc pr-4">
                <li>شكل 2.1: واجهة Avast Mobile Security لاندرويد</li>
                <li>شكل 2.2: واجهة فحص الخصوصية McAfee Mobile</li>
                <li>شكل 3.1: مخطط الشبكات العصبية العميقة DNN</li>
                <li>شكل 3.3: مخطط العلاقات والكيانات لقاعدة البيانات ERD</li>
                <li>شكل 4.4: مقارنة نتائج أداء TFLite على الأجهزة المختلفة</li>
              </ul>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-2">صفحة 9 - 12 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "chap1",
      title: "الفصل الأول: الإطار العام للمشروع",
      pages: "13 - 19",
      category: "الأبواب الأكاديمية الرئيسية",
      icon: <Compass className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3">
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Chapter One: Project General Background</span>
            <h2 className="text-base font-black text-slate-900">الفصل الأول: الإطار العام والمنهجي للمشروع</h2>
          </div>

          <div className="space-y-4 text-xs text-stone-700 leading-relaxed text-justify">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">1.1 المقدمة (Introduction):</h3>
              <p>
                تشكل التكنولوجيا في عصرنا الحالي العمود الفقري للحياة الحديثة حيث أصبحت الهواتف المحمولة امتداداً للإنسان ورفيقاً لا ينفصل عنه في جميع جوانب حياته اليومية. تحولت هذه الأجهزة من مجرد أدوات اتصال تقليدية إلى منصات متكاملة للعمل والتواصل الاجتماعي والخدمات المالية والبنكية. أدى هذا الاعتماد المتزايد إلى جعل الهاتف مستودعاً للمعلومات الشخصية والبيانات المالية والحساسة، مما يستدعي ضرورة توفير حماية قوية له ضد التهديدات المتطورة.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">2.1 أهمية البحث (Research Importance):</h3>
              <p>
                تنبثق أهمية الأطروحة من ضرورة مواجهة الهجمات السيبرانية المتزايدة على بيئة أندرويد. فالتطبيق المقترح يهدف إلى:
              </p>
              <ul className="list-disc pr-4 space-y-1 mt-1 text-stone-600">
                <li>حماية خصوصية المستخدمين وبياناتهم الشخصية الحساسة مثل الصور والحسابات البنكية.</li>
                <li>رفع مستوى الوعي الأمني لدى المستخدم العادي من خلال توفير تقارير واضحة مبسطة وسهلة الفهم بدلاً من لغة المصطلحات التقنية المعقدة.</li>
                <li>توفير حماية استباقية بالحد من الهجمات من خلال الكشف المبكر عن الثغرات والصلاحيات الخطيرة داخل التطبيقات.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">3.1 مشكلة البحث (Problem Statement):</h3>
              <p>
                تتمثل مشكلة البحث في عجز محركات الفحص التقليدية القائمة على البصمات (Signature-based) عن كشف البرمجيات الخبيثة الحديثة والمشفرة أو هجمات يوم الصفر (Zero-day). كما أن المستخدمين العاديين يفتقرون للخبرة والوعي الكافيين لفهم وتحليل تقارير الأمان المعقدة أو إدراك مخاطر الصلاحيات المطلقة الممنوحة لبعض التطبيقات المشبوهة، بالإضافة إلى انتشار الروابط الاحتيالية المصممة للتصيد وسرقة الهويات والبيانات.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">4.1 أهداف المشروع (Research Objectives):</h3>
              <p>
                تطوير تطبيق ذكي متكامل لتقييم أمان الهواتف العاملة بنظام أندرويد تلقائياً بالاعتماد على خوارزميات الذكاء الاصطناعي والتعلم العميق، وفحص الروابط المشبوهة عبر بوابة VirusTotal، وتقديم تقارير مبسطة للمستخدم مصحوبة بتوصيات حقيقية لرفع مستوى الحماية.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 mt-2">
              <div>
                <span className="font-bold text-amber-700 block mb-1">الحدود التقنية والميدانية:</span>
                <p className="text-[11px] text-stone-600">
                  تستهدف الدراسة نظام تشغيل Android فقط، وتركز الواجهات على دعم اللغة العربية بشكل كامل مع إمكانية التوسع، وتعتمد في الفحص والتحليل على مكتبات Keras المدمجة محلياً عبر TFLite لضمان الكفاءة والسرعة على الأجهزة المتوسطة والضعيفة.
                </p>
              </div>
              <div>
                <span className="font-bold text-amber-700 block mb-1">البيئة المعتمدة والأدوات:</span>
                <p className="text-[11px] text-stone-600">
                  تمت برمجة التطبيق بالكامل باستخدام إطار العمل Flutter (لغة Dart)، وإدارة الحالة بحزمة Provider، مع الاعتماد التام على مكتبة SQLite المحلية لحفظ السجلات، وPython/Google Colab لتدريب وبناء النماذج الذكية.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 13 - 19 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "chap2_theory",
      title: "الفصل الثاني: الخلفية النظرية للأمن والذكاء",
      pages: "20 - 23",
      category: "الأبواب الأكاديمية الرئيسية",
      icon: <Cpu className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3">
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Chapter Two: Theoretical Background</span>
            <h2 className="text-base font-black text-slate-900">الفصل الثاني: الخلفية النظرية للبرمجيات الضارة والذكاء الاصطناعي</h2>
          </div>

          <div className="space-y-4 text-xs text-stone-700 leading-relaxed text-justify">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">1.2.2 أنواع البرمجيات الضارة (Malware Types):</h3>
              <p>
                تم تصنيف البرمجيات الخبيثة المهددة لبيئة المحمول في الأطروحة إلى عدة عوائل بناءً على طبيعة سلوكها التخريبي:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-150">
                  <strong className="text-amber-800">الفيروسات وأحصنة طروادة (Viruses & Trojans):</strong>
                  <p className="text-[11px] text-stone-600 mt-1">تتميز بالقدرة على التكاثر والانتشار أو انتحال هوية تطبيقات موثوقة للوصول إلى النواة وسرقة البيانات الشخصية.</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-150">
                  <strong className="text-amber-800">برمجيات الفدية والتجسس (Ransomware & Spyware):</strong>
                  <p className="text-[11px] text-stone-600 mt-1">تستهدف تشفير الملفات وابتزاز المستخدم مالياً أو تتبع أنشطته اليومية وتسجيل ضربات المفاتيح وكلمات المرور.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">2.2.2 طرق وأجيال الكشف عن البرمجيات الضارة:</h3>
              <p>
                تطورت طرق مكافحة التهديدات على مر السنين إلى أربعة أجيال رئيسية تم توضيحها ومقارنتها في الأطروحة:
              </p>
              <div className="relative border-r-2 border-amber-500 pr-4 mr-2 space-y-3 mt-2">
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">الجيل الأول (البحث عن البصمة):</span>
                  <p className="text-stone-500 text-[10px]">يعتمد على مطابقة قيم الهاش الثابتة للملفات بقاعدة بيانات الفيروسات المعروفة، ولكنه يعجز أمام التعديلات الطفيفة في الشيفرة.</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">الجيل الثاني (الأنماط غير الاعتيادية ومحاكاة الشيفرة):</span>
                  <p className="text-stone-500 text-[10px]">يقوم بتشغيل البرمجيات داخل بيئات افتراضية معزولة (Sandboxing) لتحليل سلوكها التمهيدي ومراقبة استدعاءات النظام.</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">الجيل الثالث (التحليل الديناميكي ومراقبة الشذوذ):</span>
                  <p className="text-stone-500 text-[10px]">يركز على رصد سلوك الفيروسات الفعلي أثناء التنفيذ الحقيقي واستخدام خوارزميات التصنيف لتمييز الأنشطة المشبوهة.</p>
                </div>
                <div>
                  <span className="font-bold text-amber-800 block text-[11px]">الجيل الرابع (تعلم الآلة والذكاء الاصطناعي):</span>
                  <p className="text-emerald-900 text-[10px] font-bold">يركز على بناء نماذج قادرة على التعلم من مجموعات البيانات الكبيرة واستخلاص الأنماط العامة لتحديد هجمات يوم الصفر بدقة ممتازة تفوق 95%.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">3.2.2 التعلم العميق والشبكات العصبية (Deep Learning):</h3>
              <p>
                تم توظيف طراز الشبكات العصبية العميقة (Deep Neural Networks - DNN) في الأطروحة نظراً لقدرتها الفائقة على معالجة البيانات متعددة الأبعاد واستخراج الميزات المخفية والأنماط المعقدة غير الخطية من الصلاحيات واستدعاءات واجهة البرمجة (API Calls) دون تدخل بشري مباشر.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 20 - 23 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "chap2_studies",
      title: "الفصل الثاني: الدراسات السابقة والمقارنات",
      pages: "24 - 27",
      category: "الأبواب الأكاديمية الرئيسية",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 flex justify-between items-end">
            <div>
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Literature Review & Comparisons</span>
              <h2 className="text-base font-black text-slate-900">مقارنة الدراسات السابقة والتطبيقات التجارية</h2>
            </div>
            <span className="text-[9px] bg-slate-150 px-2 py-1 rounded font-mono font-bold">Comparative Matrix</span>
          </div>

          <div className="space-y-4 text-xs text-stone-700 leading-relaxed text-justify">
            <p className="text-stone-500">
              لتحقيق التميز، قامت الأطروحة بمقارنة منهجيتها مع أبرز الدراسات الأكاديمية والتطبيقات التجارية الرائدة في متجر Google Play:
            </p>

            <h3 className="font-bold text-slate-950 border-r-2 border-amber-500 pr-2">أولاً: جدول مقارنة الدراسات الأكاديمية السابقة (Page 35)</h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-right text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2.5">الدراسة (السنة)</th>
                    <th className="p-2">التقنيات المستخدمة</th>
                    <th className="p-2">أبرز المزايا والنتائج</th>
                    <th className="p-2">السلبيات والتحديات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-600">
                  <tr className="hover:bg-stone-50/50">
                    <td className="p-2.5 font-bold text-slate-800">S. Poornima (2023)</td>
                    <td className="p-2">خوارزمية MAD-NET هجينة</td>
                    <td className="p-2">دقة تصنيف بلغت %96.75</td>
                    <td className="p-2">صعوبة التعميم في بيئات برمجية متنوعة</td>
                  </tr>
                  <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                    <td className="p-2.5 font-bold text-slate-800">Zahid Akhtar (2021)</td>
                    <td className="p-2">تحليل ساكن وديناميكي نظري</td>
                    <td className="p-2">خريطة طريق واضحة لأبحاث الإخفاء</td>
                    <td className="p-2">دراسة تشخيصية نظرية فقط دون حلول برمجية</td>
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="p-2.5 font-bold text-slate-800">Jesus Balsa (2024)</td>
                    <td className="p-2">أدوات Mallory و TaintDroid</td>
                    <td className="p-2">تغطية مراحل متعددة وفحص ثغرات حقيقية</td>
                    <td className="p-2">تحتاج خبرة أمنية متقدمة وتستهلك موارد عالية</td>
                  </tr>
                  <tr className="bg-amber-500/10 font-bold hover:bg-amber-500/15 text-slate-900">
                    <td className="p-2.5">المشروع الحالي (2026)</td>
                    <td className="p-2">خوارزميات DNN مدمجة محلياً + TFLite</td>
                    <td className="p-2">دقة 92.68%، خفيف الوزن، متكامل مع واجهة Flutter</td>
                    <td className="p-2">يتطلب تحديثات مستمرة وقواعد بيانات محلية</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-bold text-slate-950 border-r-2 border-amber-500 pr-2 pt-2">ثانياً: مقارنة التطبيقات التجارية الشهيرة (Page 39)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div className="border border-stone-200 p-3 rounded-xl bg-stone-50 space-y-1">
                <h4 className="font-black text-slate-900">Avast Mobile</h4>
                <p className="text-[9px] text-stone-500">حماية شاملة ضد الفيروسات والشبكة بوجود VPN. يعيبه كثرة الإعلانات والتقارير العامة بالنسخة المجانية.</p>
              </div>
              <div className="border border-stone-200 p-3 rounded-xl bg-stone-50 space-y-1">
                <h4 className="font-black text-slate-900">AVG Antivirus</h4>
                <p className="text-[9px] text-stone-500">سهل الاستخدام ويقدم فحصاً دورياً وقفل التطبيقات. يعيبه الإشعارات المستمرة والنسخة الكاملة المدفوعة.</p>
              </div>
              <div className="border border-stone-200 p-3 rounded-xl bg-stone-50 space-y-1">
                <h4 className="font-black text-slate-900">McAfee Mobile</h4>
                <p className="text-[9px] text-stone-500">يركز على أمن الخصوصية وتحليل الأذونات بدقة عالية. يعيبه تأثيره الملحوظ على سرعة وأداء المعالج.</p>
              </div>
              <div className="border border-stone-200 p-3 rounded-xl bg-amber-550 bg-amber-50 space-y-1 border-amber-200">
                <h4 className="font-black text-amber-900">النظام المقترح الحالي</h4>
                <p className="text-[9px] text-amber-850">تحليل ذكي وعميق باستخدام TFLite، فحص فوري بدون تأثير على البطارية، واجهة عربية خالية من الإعلانات.</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 24 - 27 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "chap3_methodology",
      title: "الفصل الثالث: منهجية البحث والنمذجة",
      pages: "28 - 41",
      category: "الأبواب الأكاديمية الرئيسية",
      icon: <Sliders className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3">
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Chapter Three: Research Methodology</span>
            <h2 className="text-base font-black text-slate-900">الفصل الثالث: منهجية جمع ومعالجة البيانات والنمذجة</h2>
          </div>

          <div className="space-y-4 text-xs text-stone-700 leading-relaxed text-justify">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">1.3.3 مصادر وجمع البيانات (Data Collection):</h3>
              <p>
                اعتمدت الأطروحة على قاعدة بيانات أندرويد العالمية الشهيرة <strong className="text-slate-900">AndroMD - Android Malware Dataset</strong> والتي تضم أكثر من 600,298 عينة تطبيقية (397,814 عينة سليمة و202,484 عينة برمجية خبيثة)، تم تقسيمها إلى 3 مجموعات مخصصة:
              </p>
              <ul className="list-disc pr-4 space-y-1 text-stone-600 mt-1">
                <li><strong className="text-slate-800">ZeroOne Dataset:</strong> مصفوفة قيم ثنائية (0/1) تدل على وجود أو غياب ميزات أمنية محددة.</li>
                <li><strong className="text-slate-800">KeyCount Dataset:</strong> قيم رقمية تسجل تكرار استدعاءات واجهات البرمجة (API Calls).</li>
                <li><strong className="text-slate-800">MNF Dataset:</strong> قائمة بالصلاحيات الدقيقة المطلوبة من نظام التشغيل.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">2.3.3 موازنة ومعالجة البيانات (Data Balancing):</h3>
              <p>
                نظراً لعدم التوازن الطبيعي في أعداد عينات البرمجيات الخبيثة مقارنة بالتطبيقات السليمة، تم تطبيق خوارزميات موازنة متقدمة لحماية جودة التدريب ومنع الانحياز (Overfitting):
              </p>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="p-2.5 bg-stone-50 border border-stone-150 rounded-xl text-center">
                  <span className="font-bold text-amber-800 block text-[10px] font-mono">SMOTEENN</span>
                  <p className="text-[9px] text-stone-500 mt-0.5">لمعالجة بيانات ZeroOne لزيادة العينات النادرة وتصفية العشوائية.</p>
                </div>
                <div className="p-2.5 bg-stone-50 border border-stone-150 rounded-xl text-center">
                  <span className="font-bold text-amber-800 block text-[10px] font-mono">ADASYN</span>
                  <p className="text-[9px] text-stone-500 mt-0.5">لمجموعة KeyCount لإنشاء عينات تكيفية مرنة ومخصصة.</p>
                </div>
                <div className="p-2.5 bg-stone-50 border border-stone-150 rounded-xl text-center">
                  <span className="font-bold text-amber-800 block text-[10px] font-mono">BorderlineSMOTE</span>
                  <p className="text-[9px] text-stone-500 mt-0.5">لمجموعة MNF لتعزيز الحدود الفاصلة بدقة بين الفئات الأمنية.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">3.3.3 معمارية وهندسة الشبكة العصبية (DNN Architecture):</h3>
              <p>
                تم بناء نموذج ذكي عميق مكون من 4 طبقات مخفية مرتبة كالتالي: (128، 64، 32، 1) عقدة برمجية. مع تفعيل طبقات الإسقاط (Dropout) بنسبة 30% لتعزيز الاستقرار، واستخدام دالة ReLU في الطبقات الداخلية، ودالة Sigmoid في طبقة الإخراج لإعطاء النتيجة النهائية للتصنيف الثنائي (سليم أو خبيث).
              </p>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 28 - 41 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "chap3_diagrams",
      title: "الفصل الثالث: مخططات وتصميم النظام",
      pages: "34 - 40",
      category: "الأبواب الأكاديمية الرئيسية",
      icon: <Network className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">System Architecture & UML Diagrams</span>
              <h2 className="text-base font-black text-slate-900">المخططات الهندسية وتصميم هيكل التطبيق (UML)</h2>
            </div>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono font-bold">UML Diagrams</span>
          </div>

          <div className="space-y-6 text-xs text-stone-700 leading-relaxed text-justify">
            <p className="text-stone-500">
              يقدم هذا البند تمثيلاً بيانياً ورسوماً هندسية لهيكل قاعدة البيانات ومخطط العلاقات (ERD) ومسار العمليات داخل تطبيق الأمان:
            </p>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-950 border-r-2 border-amber-500 pr-2">1. مخطط الكيانات والعلاقات لقاعدة البيانات (Security Database ERD)</h3>
              <div className="border border-stone-200 rounded-2xl p-6 bg-slate-950 text-amber-400 font-mono text-[10px] space-y-4 overflow-x-auto text-left" dir="ltr">
                <div className="text-center text-slate-400 border-b border-slate-800 pb-2 mb-2 font-bold">DATABASE TABLES REPRESENTATION (SQLite)</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-slate-800 p-3 rounded-lg bg-slate-900/60">
                    <span className="text-emerald-400 font-black block border-b border-slate-800 pb-1">[USERS]</span>
                    <p className="text-stone-400 mt-1">PK | id: INTEGER (AUTO_INC)</p>
                    <p className="text-stone-400">UK | username: TEXT</p>
                    <p className="text-stone-400">   | password: TEXT</p>
                  </div>
                  <div className="border border-slate-800 p-3 rounded-lg bg-slate-900/60">
                    <span className="text-emerald-400 font-black block border-b border-slate-800 pb-1">[SECURITY_SCANS]</span>
                    <p className="text-stone-400 mt-1">PK | id: INTEGER (AUTO_INC)</p>
                    <p className="text-stone-400">   | securityScore: REAL</p>
                    <p className="text-stone-400">   | dangerousAppsCount: INT</p>
                    <p className="text-stone-400">   | networkStatus: TEXT</p>
                    <p className="text-stone-400">   | scanDate: TEXT (ISO8601)</p>
                  </div>
                  <div className="border border-slate-800 p-3 rounded-lg bg-slate-900/60">
                    <span className="text-emerald-400 font-black block border-b border-slate-800 pb-1">[NOTIFICATIONS]</span>
                    <p className="text-stone-400 mt-1">PK | id: INTEGER</p>
                    <p className="text-stone-400">FK | ref_scan_id: INTEGER</p>
                    <p className="text-stone-400">   | title: TEXT</p>
                    <p className="text-stone-400">   | message: TEXT</p>
                    <p className="text-stone-400">   | isRead: INTEGER (0/1)</p>
                  </div>
                </div>
                <div className="text-center text-slate-500 text-[9px] pt-2 border-t border-slate-900">
                  Relationships: [USERS] (1) ------ (M) [SECURITY_SCANS] (1) ------ (M) [NOTIFICATIONS]
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-950 border-r-2 border-amber-500 pr-2">2. مخطط حالات الاستخدام ومسار الفحص (Use Case Model)</h3>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <p className="text-[11px] text-stone-600">
                  يوضح مخطط الكبسولة الهندسية تفاعل المستخدم الرئيسي (User) مع محركات الفحص الأساسية في التطبيق:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-[10px]">
                  <div className="p-2 bg-white border border-stone-200 rounded-lg shadow-sm font-bold">
                    <span className="text-amber-700 block mb-0.5">فحص التطبيقات</span>
                    <span>Scan Installed Apps</span>
                  </div>
                  <div className="p-2 bg-white border border-stone-200 rounded-lg shadow-sm font-bold">
                    <span className="text-amber-700 block mb-0.5">فحص الروابط</span>
                    <span>Scan Suspicious Links</span>
                  </div>
                  <div className="p-2 bg-white border border-stone-200 rounded-lg shadow-sm font-bold">
                    <span className="text-amber-700 block mb-0.5">فحص النظام والـ Root</span>
                    <span>Check Root & SDK</span>
                  </div>
                  <div className="p-2 bg-white border border-stone-200 rounded-lg shadow-sm font-bold">
                    <span className="text-amber-700 block mb-0.5">أمان الشبكة والـ WiFi</span>
                    <span>Network Safety Check</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 34 - 40 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "chap4_results",
      title: "الفصل الرابع: النتائج والتنفيذ العملي",
      pages: "42 - 51",
      category: "الأبواب الأكاديمية الرئيسية",
      icon: <Activity className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Chapter Four: Evaluation & Results</span>
              <h2 className="text-base font-black text-slate-900">الفصل الرابع: نتائج تقييم أداء النماذج الذكية والتحويل</h2>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-mono font-bold">Passed Build</span>
          </div>

          <div className="space-y-4 text-xs text-stone-700 leading-relaxed text-justify">
            <p>
              يقدم هذا الباب الأرقام والنتائج العملية الدقيقة المستخلصة من عملية تدريب النماذج العصبية الذكية بعد موازنتها، وكيف تم تصديرها وتحسين حجمها لتعمل بسلاسة فائقة داخل بيئة الهواتف الذكية:
            </p>

            <h3 className="font-bold text-slate-950 border-r-2 border-amber-500 pr-2">أولاً: جدول تقييم الأداء التفصيلي للنماذج على بيانات الاختبار (Page 45)</h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-right text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2.5">النموذج الذكي</th>
                    <th className="p-2">الدقة (Accuracy)</th>
                    <th className="p-2">الموثوقية (Precision)</th>
                    <th className="p-2">الاستدعاء (Recall)</th>
                    <th className="p-2 text-center">F1-Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-600 font-mono">
                  <tr className="hover:bg-stone-50/50">
                    <td className="p-2.5 font-bold font-sans text-slate-800">ZeroOne Model</td>
                    <td className="p-2">92.95%</td>
                    <td className="p-2">72.44%</td>
                    <td className="p-2 text-amber-800">93.26%</td>
                    <td className="p-2 text-center font-bold">81.54%</td>
                  </tr>
                  <tr className="bg-stone-50/50 hover:bg-stone-50/50">
                    <td className="p-2.5 font-bold font-sans text-slate-800">KeyCount Model</td>
                    <td className="p-2">89.25%</td>
                    <td className="p-2">62.42%</td>
                    <td className="p-2">89.52%</td>
                    <td className="p-2 text-center font-bold">73.55%</td>
                  </tr>
                  <tr className="hover:bg-stone-50/50 bg-emerald-500/5 font-extrabold text-slate-900">
                    <td className="p-2.5 font-sans">MNF (Permissions) Model</td>
                    <td className="p-2 text-emerald-700">95.85%</td>
                    <td className="p-2">80.91%</td>
                    <td className="p-2 text-emerald-700">98.35%</td>
                    <td className="p-2 text-center text-emerald-800">88.78%</td>
                  </tr>
                  <tr className="bg-slate-50 font-black">
                    <td className="p-2.5 font-sans text-slate-950">المتوسط العام للنماذج</td>
                    <td className="p-2">92.68%</td>
                    <td className="p-2">71.92%</td>
                    <td className="p-2">93.71%</td>
                    <td className="p-2 text-center text-amber-900">81.62%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-stone-200 p-3.5 rounded-xl bg-stone-50 space-y-1">
                <span className="font-bold text-slate-900 block text-[11px] border-b border-stone-150 pb-1">ثانياً: نتائج ضغط وتحويل النماذج إلى TFLite:</span>
                <p className="text-[10px] text-stone-500 mt-1">
                  لتسريع عملية الفحص محلياً وتقليص استهلاك الذاكرة والبطارية على الجوال، تم تحويل ملفات Keras الهيكلية إلى تنسيق <strong className="text-slate-900">TensorFlow Lite</strong> بالضغط الأمثل، مما أثمر عن خفض حجم الملفات بنسبة ممتازة:
                </p>
                <div className="text-[9px] font-mono space-y-0.5 mt-2 bg-slate-950 text-emerald-400 p-2 rounded-lg leading-relaxed">
                  <p>• ZeroOne.tflite   : 25.8 KB (Optimized & Pruned)</p>
                  <p>• KeyCount.tflite  : 18.0 KB (RobustScaler normalized)</p>
                  <p>• MNF_Model.tflite : 25.5 KB (Mutual Information selected)</p>
                </div>
              </div>

              <div className="border border-stone-200 p-3.5 rounded-xl bg-stone-50 space-y-1">
                <span className="font-bold text-slate-900 block text-[11px] border-b border-stone-150 pb-1">ثالثاً: مخرجات اختبار الأداء الفعلي (TFLite Inference):</span>
                <p className="text-[10px] text-stone-500 mt-1">
                  أجريت تجارب على عينة اختبارية مكونة من 100 تطبيق على أجهزة اندرويد متنوعة لقياس سرعة الاستجابة وكفاءة استخدام الموارد:
                </p>
                <ul className="list-disc pr-4 text-[10px] text-stone-600 mt-1 space-y-0.5">
                  <li>متوسط دقة كشف البرمجيات الضارة على الواقع: <strong className="text-slate-900">97.0%</strong>.</li>
                  <li>زمن الفحص والاستدلال الفوري لكل تطبيق: <strong className="text-slate-900">أقل من 50 مللي ثانية</strong>.</li>
                  <li>معدل استهلاك الذاكرة العشوائية (RAM): <strong className="text-slate-900">أقل من 50 ميجابايت</strong>.</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 42 - 51 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "chap4_ui",
      title: "الفصل الرابع: دليل الواجهات والمحاكاة",
      pages: "52 - 67",
      category: "الأبواب الأكاديمية الرئيسية",
      icon: <Tablet className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Chapter Four: User Interfaces & Walkthrough</span>
              <h2 className="text-base font-black text-slate-900">الفصل الرابع: دليل واجهات المستخدم والمحاكاة الأمنية للتطبيق</h2>
            </div>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono font-bold">UI Walkthrough</span>
          </div>

          <div className="space-y-4 text-xs text-stone-700 leading-relaxed text-justify">
            <p className="text-stone-500">
              تحتوي الأطروحة على تفصيل دقيق لكافة شاشات وواجهات الاستخدام المصممة باللغة العربية لدعم المستخدم العادي، ممثلة في الأبواب الهيكلية التالية:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-stone-200 p-3 bg-stone-50 rounded-xl space-y-1.5 shadow-sm">
                <span className="font-bold text-amber-800 text-[11px] block border-b border-stone-150 pb-1">1. شاشة الفحص والتحليل الذكي (AI Scan)</span>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  تتميز بزر مركزي تفاعلي لبدء التحليل الساكن والديناميكي للتطبيقات المثبتة باستخدام نموذج الذكاء الاصطناعي، لتعرض عداداً تفاعلياً للحالة وعدادات إحصائية ملونة (آمنة، مشبوهة، خطيرة).
                </p>
              </div>

              <div className="border border-stone-200 p-3 bg-stone-50 rounded-xl space-y-1.5 shadow-sm">
                <span className="font-bold text-amber-800 text-[11px] block border-b border-stone-150 pb-1">2. واجهة فحص الروابط المشبوهة (Links)</span>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  تسمح للمستخدم بإدخال الروابط يدوياً وفحصها فورياً عبر بوابة واجهة برمجة تطبيقات VirusTotal، لحفظ وتخزين قائمة الروابط المفحوصة سابقاً مع تحديد درجة الخطورة من إجمالي أراء المحركات.
                </p>
              </div>

              <div className="border border-stone-200 p-3 bg-stone-50 rounded-xl space-y-1.5 shadow-sm">
                <span className="font-bold text-amber-800 text-[11px] block border-b border-stone-150 pb-1">3. واجهة فحص أمان النظام والشبكة</span>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  تعرض معلومات تفصيلية وافية عن أمان الجوال مثل حالة وضع المطور (Developer Mode)، حالة كسر حماية النظام (Root State)، ونوع شبكة الاتصال والـ WiFi مع توضيح مستوى حمايتها.
                </p>
              </div>
            </div>

            <div className="border border-stone-200 p-4 rounded-2xl bg-amber-50/20">
              <span className="font-bold text-amber-900 block mb-1 text-[11px]">مستويات التحقق الأمنية لمعيار الـ OWASP MASVS:</span>
              <p className="text-[10px] text-stone-600 leading-relaxed">
                يلتزم التطبيق في تصميمه الأمني بمعيار <strong className="text-slate-900">OWASP Mobile Application Security Verification Standard</strong> عبر تطبيق فحص مستويات التشفير ومصادقة البيانات لمنع هجمات الرجل في المنتصف (Man-in-the-Middle) وضمان تشفير قواعد البيانات المحلية SQLite بشكل تام.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 52 - 67 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "chap5",
      title: "الفصل الخامس: الاستنتاجات والتوصيات",
      pages: "68 - 70",
      category: "الأبواب الأكاديمية الرئيسية",
      icon: <CheckSquare className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3">
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Chapter Five: Conclusions & Recommendations</span>
            <h2 className="text-base font-black text-slate-900">الفصل الخامس: الاستنتاجات العامة والتوصيات المستقبلية</h2>
          </div>

          <div className="space-y-4 text-xs text-stone-700 leading-relaxed text-justify">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">1.5 الاستنتاجات (Conclusions):</h3>
              <p>
                بناءً على مراحل الدراسة والتنفيذ والتطبيق العملي لنموذج <strong className="text-slate-900">Secyrity App</strong>، تم استنتاج النقاط الجوهرية التالية:
              </p>
              <ul className="list-disc pr-4 mt-1 text-stone-600 space-y-1">
                <li>نجاح نموذج الذكاء الاصطناعي المطور بالكامل في كشف الأنماط والسلوكيات الخبيثة بدقة عالية وموثوقية تفوق الأساليب التقليدية.</li>
                <li>إمكانية دمج خوارزميات الاستدلال المعقدة محلياً على الهواتف دون التسبب في تباطؤ الجوال أو استنزاف غير مبرر للطاقة وموارد الذاكرة بفضل معالجات TFLite.</li>
                <li>كفاءة تصميم الواجهات المبسطة باللغة العربية في تجسير الهوة المعرفية ورفع مستوى حماية المستخدم وتنبيهه في الوقت الفعلي لأي تهديد محتمل.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">2.5 التوصيات (Recommendations for Future Work):</h3>
              <p>
                بناءً على النتائج والتحديات الميدانية التي واجهت فريق العمل، يوصي الباحثون بالنقاط التطويرية التالية لضمان ديمومة النظام لمواجهة الهجمات السيبرانية المستقبلية:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-[11px] text-stone-600">
                <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl">
                  <strong className="text-slate-900 block mb-1">أولاً: تطوير خوارزميات الذكاء الكامنة:</strong>
                  <span>الاستمرار في توسيع حجم مجموعة البيانات التدريبية ودمج تقنيات التعلم المعزز (Reinforcement Learning) واستكشاف استخدام نماذج Transformers لتحليل الشيفرة المصدرية تلقائياً وكشف تقنيات التمويه (Obfuscation).</span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl">
                  <strong className="text-slate-900 block mb-1">ثانياً: حماية البيانات والخصوصية الفائقة:</strong>
                  <span>تبني نماذج التعلم المتفرق (Federated Learning) لتدريب وتطوير النماذج محلياً على هواتف المستخدمين بشكل آمن ومحمي بالكامل لحفظ الخصوصية ودون الحاجة لنقل وتجميع الملفات في خوادم مركزية.</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">5.5 الخاتمة (Epilogue):</h3>
              <p>
                في الختام، يمثل نظام <strong className="text-slate-900">Secyrity App</strong> المطور خطوة أكاديمية وعملية رائدة تسهم في رقمنة وأمان الهواتف المحمولة في الجمهورية اليمنية بالاعتماد على أحدث الابتكارات السيبرانية لترسيخ بيئة رقمية آمنة خالية من التهديدات.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 68 - 70 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "references",
      title: "قائمة المراجع والمصادر الرسمية للمشروع",
      pages: "71 - 72",
      category: "المراجع والأكواد",
      icon: <BookMarked className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 flex justify-between items-center">
            <h2 className="text-base font-black text-slate-900">قائمة المراجع والمصادر الرسمية للأطروحة</h2>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono font-bold">Academic References</span>
          </div>

          <p className="text-xs text-stone-500">
            تحتوي هذه القائمة على المراجع العلمية والأمنية ومستندات المنظمات العالمية المعتمدة التي تم الاستناد إليها لتوثيق الجوانب النظرية والعملية للمشروع:
          </p>

          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 text-[10px] space-y-3.5 max-h-[400px] overflow-y-auto font-mono text-left select-all" dir="ltr">
            <div><span className="font-bold text-amber-700">[1]</span> National Cybersecurity Authority (NCA) - Mobile Security Guidelines, Saudi Arabia. https://nca.gov.sa/awareness/Pages/default.aspx</div>
            <div><span className="font-bold text-amber-700">[2]</span> CITC - Cyber Awareness and Protection Reports on Smart Devices. https://citc.gov.sa/ar/awareness/Pages/default.aspx</div>
            <div><span className="font-bold text-amber-700">[4]</span> Cisco Systems - Understanding Malicious Software & Mobile Vulnerabilities. https://www.cisco.com/site/us/en/learn/topics/security/what-is-malware.html</div>
            <div><span className="font-bold text-amber-700">[5]</span> IBM Security - Threat Intelligence and Scareware Analysis. https://www.ibm.com/think/topics/scareware</div>
            <div><span className="font-bold text-amber-700">[6]</span> Signature Generation and Detection of Malware Families. ResearchGate Paper.</div>
            <div><span className="font-bold text-amber-700">[8]</span> Artificial Intelligence Principles & Multi-agent Systems. IBM Think.</div>
            <div><span className="font-bold text-amber-700">[12]</span> US Geological Survey (USGS) - Datasets and Database Integrity Differences.</div>
            <div><span className="font-bold text-amber-700">[13]</span> Avast Mobile Security Documentation for Android. https://support.avast.com/</div>
            <div><span className="font-bold text-amber-700">[14]</span> AVG AntiVirus SDK and Security Protocols. https://support.avg.com/</div>
            <div><span className="font-bold text-amber-700">[15]</span> McAfee Mobile Security - Permissions and Deep Scan API. https://www.mcafee.com/</div>
            <div><span className="font-bold text-amber-700">[16]</span> Bitdefender Mobile Security SDK Manual. https://www.bitdefender.com/</div>
            <div><span className="font-bold text-amber-700">[17]</span> S. Poornima (2023) - Automated Malware Detection Using Machine Learning. ResearchGate.</div>
            <div><span className="font-bold text-amber-700">[18]</span> Literature Review on Mobile Phone Cybersecurity Concerns, IEEE Xplore.</div>
            <div><span className="font-bold text-amber-700">[20]</span> Deep Learning Models for Mobile Threat Analysis, arXiv:1205.3062.</div>
            <div><span className="font-bold text-amber-700">[24]</span> OWASP Foundation - Mobile Application Security Verification Standard (MASVS). https://mas.owasp.org/MASVS</div>
            <div><span className="font-bold text-amber-700">[25]</span> VirusTotal API Documentation for Link and File Scanning. https://docs.virustotal.com</div>
            <div><span className="font-bold text-amber-700">[26]</span> Google Colab and TensorFlow Deployment Environment Docs.</div>
            <div><span className="font-bold text-amber-700">[30]</span> AndroMD Public Malware Dataset Repository. https://data.mendeley.com/datasets/bpkksc9v5s/3</div>
          </div>

          <p className="text-[10px] text-stone-400 text-center">صفحة 71 - 72 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    },
    {
      id: "code_snippets",
      title: "ملحق الأكواد والشيفرات البرمجية",
      pages: "73 - 80",
      category: "المراجع والأكواد",
      icon: <Code className="h-4 w-4" />,
      content: (
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
          <div className="border-b-2 border-amber-500 pb-3 flex justify-between items-center">
            <h2 className="text-base font-black text-slate-900">ملحق الشيفرات البرمجية وبناء النموذج الأمني</h2>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono font-bold">Python & Keras Code</span>
          </div>

          <p className="text-xs text-stone-500">
            يحتوي هذا الباب على الشيفرة البرمجية المعتمدة لحقن وتدريب الشبكة العصبية العميقة باستخدام TensorFlow وكيفية تصدير الأوزان إلى Flutter:
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center bg-stone-50 p-2 border border-stone-200 rounded-t-xl">
                <span className="text-xs font-bold text-slate-800 font-mono">1. Python Code: Data Preprocessing (ZeroOne Dataset)</span>
                <CopyButton text={`import pandas as pd
from sklearn.ensemble import RandomForestClassifier

def prepare_zeroone(df):
    # Remove unnecessary columns
    df = df.drop('sha256', axis=1, errors='ignore')
    
    # Encode labels
    df['Label'] = df['Label'].map({'Benign': 0, 'Malware': 1})
    
    # Separate features and labels
    X = df.drop('Label', axis=1)
    y = df['Label']
    
    # Feature selection using Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X, y)
    
    # Select top 78 features based on importance
    important_features = X.columns[rf.feature_importances_ > 0.001].tolist()
    return X[important_features], y`} />
              </div>
              <pre className="bg-slate-950 text-amber-400 p-4 rounded-b-xl text-[10px] font-mono overflow-x-auto text-left leading-relaxed max-h-[220px]">
{`import pandas as pd
from sklearn.ensemble import RandomForestClassifier

def prepare_zeroone(df):
    # Remove unnecessary columns
    df = df.drop('sha256', axis=1, errors='ignore')
    
    # Encode labels
    df['Label'] = df['Label'].map({'Benign': 0, 'Malware': 1})
    
    # Separate features and labels
    X = df.drop('Label', axis=1)
    y = df['Label']
    
    # Feature selection using Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X, y)
    
    # Select top 78 features based on importance
    important_features = X.columns[rf.feature_importances_ > 0.001].tolist()
    return X[important_features], y`}
              </pre>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center bg-stone-50 p-2 border border-stone-200 rounded-t-xl">
                <span className="text-xs font-bold text-slate-800 font-mono">2. Python Code: Keras DNN Model Architecture</span>
                <CopyButton text={`import tensorflow as tf
from tensorflow import keras

def create_model(input_dim):
    """Create a simple DNN model for Android Malware Classification"""
    model = keras.Sequential([
        keras.layers.Dense(128, activation='relu', input_shape=(input_dim,)),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    return model`} />
              </div>
              <pre className="bg-slate-950 text-amber-400 p-4 rounded-b-xl text-[10px] font-mono overflow-x-auto text-left leading-relaxed max-h-[220px]">
{`import tensorflow as tf
from tensorflow import keras

def create_model(input_dim):
    """Create a simple DNN model for Android Malware Classification"""
    model = keras.Sequential([
        keras.layers.Dense(128, activation='relu', input_shape=(input_dim,)),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    return model`}
              </pre>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center pt-4">صفحة 73 - 80 من أطروحة الوتيحي وزملائه</p>
        </div>
      )
    }
  ], []);

  // Filtered chapters based on search text
  const filteredChapters = useMemo(() => {
    return chapters.filter(chap => 
      chap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chap.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chapters, searchTerm]);

  // Page index navigators
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setActiveTab(chapters[currentPage - 1].id);
    }
  };

  const handleNextPage = () => {
    if (currentPage < chapters.length - 1) {
      setCurrentPage(prev => prev + 1);
      setActiveTab(chapters[currentPage + 1].id);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const index = chapters.findIndex(c => c.id === tabId);
    if (index !== -1) {
      setCurrentPage(index);
      if (viewMode === "scroll") {
        const el = document.getElementById(`scroll-sec-${tabId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  // Direct print option for academic review
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6" id="documentation-module-root">
      
      {/* Header bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl border border-slate-800 text-right print:hidden" dir="rtl">
        <div className="space-y-2 text-right w-full md:w-auto">
          <div className="flex items-center gap-2 justify-start md:justify-start">
            <BookOpen className="h-6 w-6 text-amber-400" />
            <span className="text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">الدليل الأكاديمي والتوثيق المرجعي</span>
          </div>
          <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-100">
            أطروحة تخرج: تطبيق ذكي لتقييم أمان الهاتف المحمول
          </h1>
          <p className="text-[11px] text-slate-400">
            عرض وتصفح أوراق تخرج قسم الأمن السيبراني والشبكات، مع تصفح تفصيلي لـ 85 صفحة أكاديمية معتمدة.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-750 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>طباعة الأطروحة (PDF)</span>
          </button>
          
          <div className="bg-slate-800 border border-slate-750 rounded-xl p-1 flex gap-1 text-[10px] font-bold">
            <button
              onClick={() => setViewMode("scroll")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "scroll" ? "bg-slate-900 text-amber-400 shadow-inner" : "text-slate-400 hover:text-white"
              }`}
            >
              عرض متصل
            </button>
            <button
              onClick={() => setViewMode("book")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "book" ? "bg-slate-900 text-amber-400 shadow-inner" : "text-slate-400 hover:text-white"
              }`}
            >
              عرض كتاب
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" dir="rtl">
        
        {/* Right Column: Chapters Index & Information */}
        <div className="space-y-6 print:hidden">
          
          {/* Live Search bar */}
          <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-1">
            <span className="text-[10px] font-black text-slate-900 block text-right">ابحث في فصول البحث العلمي:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بالعنوان أو رقم الصفحة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-9 py-2.5 rounded-xl text-xs border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-right"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-stone-400" />
            </div>
          </div>

          {/* Interactive Index */}
          <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-stone-150 pb-2">
              <FileText className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-black text-slate-900">الفهرس والمحتوى الأكاديمي (85 صفحة)</span>
            </div>

            <div className="space-y-1 max-h-[420px] overflow-y-auto pl-1">
              {filteredChapters.map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => handleTabChange(chap.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    activeTab === chap.id 
                      ? "bg-slate-900 text-amber-400 shadow-md" 
                      : "text-stone-600 hover:bg-stone-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`p-1 rounded-md ${activeTab === chap.id ? "bg-slate-800 text-amber-400" : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"}`}>
                      {chap.icon}
                    </span>
                    <span className="truncate">{chap.title}</span>
                  </div>
                  <span className="text-[9px] font-mono opacity-60 font-medium mr-2">
                    {chap.pages}
                  </span>
                </button>
              ))}
              {filteredChapters.length === 0 && (
                <p className="text-[10px] text-stone-400 text-center py-4">لا توجد نتائج مطابقة لبحثك.</p>
              )}
            </div>
          </div>

          {/* Supervision Information */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-[10px] text-stone-500">
            <div className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-amber-600" /> <span className="font-bold text-slate-800">مشروع التخرج المعتمد 2026</span></div>
            <div><strong>الباحثون:</strong> حاتم الوتيحي، أسامة النقيب، أحمد الدعيس، فهد الدعيس، عزالدين البناء</div>
            <div><strong>المشرف الأكاديمي:</strong> د. إبراهيم النظامي</div>
            <div><strong>الجامعة:</strong> جامعة العلوم والتكنولوجيا - إب</div>
          </div>
        </div>

        {/* Left Column: Content Viewer */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Book View Mode */}
          {viewMode === "book" ? (
            <div className="space-y-4">
              {/* Pager Controls */}
              <div className="flex justify-between items-center bg-white border border-stone-200 px-5 py-3 rounded-2xl shadow-sm text-xs print:hidden">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`px-3 py-1.5 rounded-xl border border-stone-200 flex items-center gap-1 font-bold transition-all ${
                    currentPage === 0 ? "opacity-40 cursor-not-allowed text-stone-400 bg-stone-50" : "hover:bg-stone-50 text-slate-800 cursor-pointer"
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>الصفحة السابقة</span>
                </button>

                <span className="font-mono font-black text-slate-900 bg-stone-100 px-4 py-1.5 rounded-full text-xs">
                  الفصل {currentPage + 1} • الصفحات الأكاديمية ({chapters[currentPage]?.pages || ""})
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === chapters.length - 1}
                  className={`px-3 py-1.5 rounded-xl border border-stone-200 flex items-center gap-1 font-bold transition-all ${
                    currentPage === chapters.length - 1 ? "opacity-40 cursor-not-allowed text-stone-400 bg-stone-50" : "hover:bg-stone-50 text-slate-800 cursor-pointer"
                  }`}
                >
                  <span>الصفحة التالية</span>
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Page Paper Container */}
              <div id="print-area-documentation" className="transition-all duration-350 min-h-[500px]">
                {chapters[currentPage]?.content || null}
              </div>
            </div>
          ) : (
            /* Continuous Scroll View Mode */
            <div className="space-y-6" id="print-area-documentation">
              {chapters.map((chap) => (
                <div 
                  key={chap.id} 
                  id={`scroll-sec-${chap.id}`}
                  className={`transition-all duration-300 ${activeTab === chap.id ? "ring-2 ring-amber-500 rounded-3xl" : ""}`}
                >
                  {chap.content}
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Styled Sheets for Printing Cleaner PDFs */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #main-app-shell, #app-header, #app-footer, .print\\:hidden, button, input {
            display: none !important;
            visibility: hidden !important;
          }
          #print-area-documentation {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-area-documentation > div {
            page-break-after: always !important;
            border: none !important;
            box-shadow: none !important;
            padding: 2cm !important;
          }
        }
      `}</style>
    </div>
  );
}
