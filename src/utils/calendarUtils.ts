/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Converts a Gregorian Date object to an Arabic Hijri date string.
 * Uses native Intl API which supports "islamic-umalqura" flawlessly.
 */
export function convertGregorianToHijri(dateString: string): string {
  if (!dateString) return "غير محدد";
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "تاريخ غير صالح";
    
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return formatter.format(dateObj); // Output format: "٤ ذو الحجة ١٤٤٧"
  } catch (error) {
    console.error("Hijri Conversion Error:", error);
    return "خطأ في التحويل";
  }
}

/**
 * Approximate conversion from Hijri simple parameters to Gregorian
 * Since accurate reverse conversion is extremely complex, we can use an established
 * approximation formula (Hijri to Gregorian): G = (H * 0.97) + 622
 */
export function convertHijriToGregorian(hijriDay: number, hijriMonth: number, hijriYear: number): string {
  try {
    // Approximate calendar math
    const totalHijriDays = (hijriYear - 1) * 354.367 + (hijriMonth - 1) * 29.5 + hijriDay;
    const totalGregorianDays = totalHijriDays + 227015; // Offset to AH 1
    const jd = totalGregorianDays + 1721425.5; // Julian Date offset
    
    // Simple Julian date to Gregorian Date conversion
    const z = Math.floor(jd + 0.5);
    const f = (jd + 0.5) - z;
    let a = z;
    if (z >= 2299161) {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = Math.floor(b - d - Math.floor(30.6001 * e) + f);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    // Pad with leading zeros
    const dStr = String(day).padStart(2, '0');
    const mStr = String(month).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  } catch (error) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}

export const HIJRI_MONTHS_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة"
];
