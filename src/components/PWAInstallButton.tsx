import { useState } from 'react';
import { Download, Sparkles, X, Smartphone, ArrowDown } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running in standalone display-mode, do not render anything
  if (isInstalled) {
    return null;
  }

  // Android / Chrome / Edge Desktop flow
  if (isInstallable) {
    return (
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 rounded-2xl border border-amber-500/20 text-right space-y-3 mt-4">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
            <Smartphone className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <span>تثبيت التطبيق على هاتفك</span>
              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
            </h4>
            <p className="text-[10px] text-stone-500 leading-normal mt-1">
              ثبّت نسخة الجوال لتلقي التحديثات والاشعارات فورياً وبسرعة فائقة دون استهلاك الذاكرة.
            </p>
          </div>
        </div>
        <button
          onClick={install}
          className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>تحميل وتثبيت التطبيق الذكي</span>
        </button>
      </div>
    );
  }

  // iOS Safari flow (since iOS does not trigger beforeinstallprompt, we show a guided helpful drawer)
  if (isIOS) {
    return (
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 rounded-2xl border border-amber-500/20 text-right space-y-3 mt-4">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
            <Smartphone className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900">تثبيت التطبيق على الآيفون</h4>
            <p className="text-[10px] text-stone-500 leading-normal mt-1">
              ثبّت التطبيق على شاشتك الرئيسية للوصول السريع والآمن من متصفح الآيفون.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-850 text-amber-400 text-xs font-black rounded-xl transition-all border border-slate-800 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>تثبيت على أجهزة Apple</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-2xl text-right relative animate-slide-up">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute left-4 top-4 p-1.5 text-stone-400 hover:text-slate-900 bg-stone-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">تثبيت التطبيق على iPhone / iPad</h3>
              </div>

              <div className="space-y-4 text-xs text-slate-700 font-sans leading-relaxed">
                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-amber-500 shrink-0 animate-bounce" />
                  <p className="font-bold text-amber-900 text-[11px]">يرجى فتح الموقع باستخدام متصفح Safari الافتراضي للآيفون.</p>
                </div>
                
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-stone-600">
                  <li>اضغط على زر <strong className="text-slate-900">مشاركة (Share)</strong> في شريط متصفح Safari السفلي.</li>
                  <li>اسحب الخيارات لأسفل واضغط على <strong className="text-slate-900">إضافة للشاشة الرئيسية (Add to Home Screen)</strong>.</li>
                  <li>قم بتأكيد الإضافة بالضغط على <strong className="text-slate-900">إضافة (Add)</strong> بالأعلى لتجد التطبيق على شاشة هاتفك فوراً!</li>
                </ol>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 hover:bg-slate-850 text-white py-2.5 text-xs font-black transition-colors"
              >
                حسنًا، فهمت ذلك
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Always render a fallback button in case beforeinstallprompt is not fired yet, which allows users to read standard instructions
  return (
    <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 p-4 rounded-2xl border border-stone-200 text-right space-y-3 mt-4">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
          <Smartphone className="h-4.5 w-4.5" />
        </div>
        <div>
          <h4 className="font-extrabold text-xs text-slate-900">تثبيت التطبيق على الجوال</h4>
          <p className="text-[10px] text-stone-500 leading-normal mt-1">
            ثبّت تطبيق المكتب على شاشتك الرئيسية للوصول الفوري وتوفير التحديثات السلسة.
          </p>
        </div>
      </div>
      <button
        onClick={() => setShowIOSGuide(true)}
        className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-850 text-amber-400 text-xs font-black rounded-xl transition-all border border-slate-800 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" />
        <span>دليل التثبيت السريع للجوال</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-2xl text-right relative animate-slide-up">
            <button 
              onClick={() => setShowIOSGuide(false)}
              className="absolute left-4 top-4 p-1.5 text-stone-400 hover:text-slate-900 bg-stone-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">تثبيت التطبيق على الجوال</h3>
            </div>

            <div className="space-y-4 text-xs text-slate-700 font-sans leading-relaxed">
              <p className="text-[11px] text-stone-600">يمكن تثبيت تطبيق المكتب القانوني على جميع الأجهزة الذكية باتباع خطوات بسيطة:</p>
              
              <div className="space-y-3">
                <div className="border-r-2 border-amber-500 pr-2">
                  <h4 className="font-bold text-[11px] text-slate-900">🤖 أجهزة الأندرويد (جوجل كروم):</h4>
                  <p className="text-[10px] text-stone-500">اضغط على النقاط الثلاث بالأعلى ثم اختر <strong>"تثبيت التطبيق" (Install App)</strong>.</p>
                </div>
                
                <div className="border-r-2 border-amber-500 pr-2">
                  <h4 className="font-bold text-[11px] text-slate-900">🍏 أجهزة الآيفون (Safari):</h4>
                  <p className="text-[10px] text-stone-500">اضغط على زر <strong>مشاركة</strong> ثم اختر <strong>"إضافة للشاشة الرئيسية" (Add to Home Screen)</strong>.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 hover:bg-slate-850 text-white py-2.5 text-xs font-black transition-colors"
            >
              حسنًا، فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
