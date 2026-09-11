/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  CalendarDays, ArrowLeftRight, ChevronLeft, ChevronRight, 
  MapPin, Clock, CalendarCheck, HelpCircle 
} from "lucide-react";
import { LegalSession } from "../types";
import { 
  convertGregorianToHijri, 
  convertHijriToGregorian, 
  HIJRI_MONTHS_AR 
} from "../utils/calendarUtils";

interface CalendarModuleProps {
  sessions: LegalSession[];
  setActiveTab: (tab: string) => void;
  setSelectedCaseId: (id: string | null) => void;
}

export default function CalendarModule({
  sessions,
  setActiveTab,
  setSelectedCaseId
}: CalendarModuleProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Converter inputs
  const [gregInput, setGregInput] = useState(new Date().toISOString().split("T")[0]);
  const [convertedHijri, setConvertedHijri] = useState(convertGregorianToHijri(gregInput));
  
  const [hijriDay, setHijriDay] = useState(1);
  const [hijriMonth, setHijriMonth] = useState(1);
  const [hijriYear, setHijriYear] = useState(1447);
  const [convertedGreg, setConvertedGreg] = useState(convertHijriToGregorian(1, 1, 1447));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Gregorian month labels in Arabic
  const MONTHS_AR = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const DAYS_AR = ["إثن", "ثلا", "أربع", "خمي", "جمع", "سبت", "أحد"];

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Align to Monday as start
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Change Month handler
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGregConvert = (val: string) => {
    setGregInput(val);
    if (val) {
      setConvertedHijri(convertGregorianToHijri(val));
    }
  };

  const handleHijriConvert = (day: number, m: number, y: number) => {
    setHijriDay(day);
    setHijriMonth(m);
    setHijriYear(y);
    const greg = convertHijriToGregorian(day, m, y);
    setConvertedGreg(greg);
  };

  // Check if a date has sessions
  const getSessionsForDate = (dayNum: number): LegalSession[] => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    return sessions.filter(s => s.sessionDateGregorian === formattedDate);
  };

  const renderCells = () => {
    const cells = [];
    
    // Empty padding cells for first week offset
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-stone-50/40 border border-stone-100 min-h-[75px]"></div>);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = getSessionsForDate(day);
      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      
      // Calculate dynamic Hijri day estimation using Intl API
      let hijriDayNum = "";
      try {
        const dObj = new Date(year, month, day);
        hijriDayNum = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric' }).format(dObj);
      } catch (e) {
        hijriDayNum = "";
      }

      cells.push(
        <div 
          key={`day-${day}`} 
          className={`border border-stone-200 p-2 min-h-[85px] transition-all relative flex flex-col justify-between hover:bg-stone-50 ${
            isToday ? "bg-amber-500/10 border-amber-400 border-2" : "bg-white"
          }`}
        >
          {/* Calendar Day Header */}
          <div className="flex justify-between items-start">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isToday ? "bg-amber-500 text-slate-950" : "text-stone-850"}`}>
              {day}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold font-mono">
              {hijriDayNum} 🌙
            </span>
          </div>

          {/* List small sessions icons */}
          <div className="mt-2 space-y-1">
            {daySessions.map(sec => (
              <div 
                key={sec.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCaseId(sec.caseId);
                  setActiveTab("cases");
                }}
                className="p-1 text-[9px] bg-slate-900 text-amber-400 font-extrabold border-r-2 border-amber-500 rounded truncate hover:bg-slate-800 transition-colors cursor-pointer"
                title={sec.caseTitle}
              >
                ⚖️ {sec.caseTitle}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right font-sans" id="calendar-module-root">
      
      {/* 1. Main Calendar Display Grid Panel */}
      <main className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Navigation month header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl text-amber-500">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">
                {MONTHS_AR[month]} {year} م
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                تصفح التقويم المقابل بالهجري والميلادي معاً
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              الشهر السابق
            </button>
            <button 
              onClick={nextMonth}
              className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              الشهر التالي
            </button>
          </div>
        </div>

        {/* Days label row */}
        <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200 text-center py-2 text-xs font-bold text-stone-600">
          {DAYS_AR.map(d => <div key={d}>{d}</div>)}
        </div>

        {/* Calendar days cells container */}
        <div className="grid grid-cols-7 flex-1">
          {renderCells()}
        </div>

      </main>

      {/* 2. Side Panel: Dual Calendar Converter Calculator */}
      <aside className="lg:col-span-4 space-y-6">
        
        {/* Converter Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-900 text-sm border-r-4 border-amber-500 pr-2 flex items-center gap-2">
            <ArrowLeftRight className="h-4.5 w-4.5 text-amber-500" />
            <span>محول التاريخ المزدوج الذكي</span>
          </h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            يستخدم المحامون في محاكم اليمن التقويم الهجري للمرافعات والميلادي للمعاملات المالية. قم بالتحويل بدقة هنا.
          </p>

          {/* Section A: Gregorian to Hijri */}
          <div className="space-y-2 border-t border-stone-100 pt-4">
            <h4 className="font-bold text-xs text-slate-900">1. من ميلادي إلى هجري</h4>
            <div className="text-xs space-y-2">
              <input
                type="date"
                value={gregInput}
                onChange={(e) => handleGregConvert(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 focus:ring-1 focus:ring-amber-500 text-left"
              />
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-[10px] text-amber-700">التاريخ الهجري المقابل:</div>
                <div className="font-extrabold text-slate-900 mt-0.5 text-sm">{convertedHijri}</div>
              </div>
            </div>
          </div>

          {/* Section B: Hijri to Gregorian */}
          <div className="space-y-2 border-t border-stone-100 pt-4">
            <h4 className="font-bold text-xs text-slate-900">2. من هجري إلى ميلادي (تقديري)</h4>
            <div className="text-xs space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-stone-500 font-semibold block mb-0.5">اليوم</label>
                  <select 
                    value={hijriDay}
                    onChange={(e) => handleHijriConvert(Number(e.target.value), hijriMonth, hijriYear)}
                    className="w-full bg-stone-50 border border-stone-200 p-1.5 rounded-lg text-center"
                  >
                    {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-stone-500 font-semibold block mb-0.5">الشهر الهجري</label>
                  <select 
                    value={hijriMonth}
                    onChange={(e) => handleHijriConvert(hijriDay, Number(e.target.value), hijriYear)}
                    className="w-full bg-stone-50 border border-stone-200 p-1.5 rounded-lg text-center font-sans"
                  >
                    {HIJRI_MONTHS_AR.map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-stone-500 font-semibold block mb-0.5">العام الهجري</label>
                  <input
                    type="number"
                    value={hijriYear}
                    min="1"
                    onChange={(e) => handleHijriConvert(hijriDay, hijriMonth, Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 p-1 rounded-lg text-center"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <div className="text-[10px] text-amber-400">التاريخ الميلادي التقديري:</div>
                <div className="font-extrabold text-white mt-0.5 text-sm font-mono">{convertedGreg}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Legend Information Card */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-xs text-stone-600 leading-relaxed space-y-2">
          <h4 className="font-extrabold text-slate-900">💡 ملاحظة عدلية يمنية:</h4>
          <p>
            يعتمد القضاء اليمني في مواعيد الطعون والمطالبات القضائية بالدرجة الأولى على التقويم الهجري بحسب قانون المرافعات والتنفيذ اليمني (مثل ميعاد استئناف الأحكام البالغ 40 يوماً هجرياً). تأكد دائماً من مطابقة التواريخ بدقة عبر المنسقين القانونيين.
          </p>
        </div>

      </aside>

    </div>
  );
}
