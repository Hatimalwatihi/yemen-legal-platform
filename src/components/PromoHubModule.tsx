/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Megaphone, Copy, Check, Printer, Phone, MapPin, 
  Sparkles, Award, Palette, Layout, Smartphone, 
  Send, Eye, FileText, CheckCircle, Share2, HelpCircle,
  CreditCard, Mail
} from "lucide-react";
import { motion } from "motion/react";

interface PromoHubModuleProps {
  attorneyName?: string;
}

export default function PromoHubModule({ attorneyName: attorneyNameProp = "المحامي اسم المحامي/المكتب" }: PromoHubModuleProps) {
  // Module Navigation: "card" for premium double-sided card, "ads" for existing marketing suite
  const [moduleTab, setModuleTab] = useState<"card" | "ads">("card");

  // Premium Double-Sided Business Card States
  const [cardName, setCardName] = useState("المحامي القانوني عبدالله علي حمود الوتيحي");
  const [cardTitle, setCardTitle] = useState("لدى مكتب الوتيحي للمحاماة");
  const [cardServices, setCardServices] = useState("المكتب الاستشاري - محاماه - تحكيم - استشارات قانونية");
  const [cardAddress, setCardAddress] = useState("الأصبحي - شارع الأربعين - تقاطع شارع المقالح - فوق مفروشات الصرمي مقابل الكريمي - صنعاء");
  const [cardPhones, setCardPhones] = useState("771673276 - 715375198");
  const [cardEmail, setCardEmail] = useState("office@example.com");
  const [cardLogoText, setCardLogoText] = useState("الوتيحي للمحاماة");
  const [cardTheme, setCardTheme] = useState<"navy" | "ivory" | "emerald">("navy");
  const [cardOrientation, setCardOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [adOrientation, setAdOrientation] = useState<"vertical" | "horizontal">("vertical");

  // Vector Logo Component reproducing the emblem from image exactly
  const LogoSvg = ({ color = "currentColor", className = "w-24 h-24 mx-auto", suffix = "view" }: { color?: string, className?: string, suffix?: string }) => {
    const pathId = `logo-banner-text-path-${suffix}`;
    return (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ WebkitTextSizeAdjust: "none", textSizeAdjust: "none" }}>
        {/* Balance Scale Pillar */}
        <line x1="100" y1="35" x2="100" y2="120" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Pillar Top Ornament */}
        <circle cx="100" cy="30" r="4.5" fill={color} />
        <circle cx="100" cy="120" r="3.5" fill={color} />
        <line x1="82" y1="116" x2="118" y2="116" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        
        {/* Scale Beam */}
        <path d="M 46,42 Q 100,34 154,42" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="100" cy="38" r="3" fill={color} />
        <circle cx="46" cy="42" r="2.5" fill={color} />
        <circle cx="154" cy="42" r="2.5" fill={color} />
        
        {/* Left Cup (العدل) */}
        <line x1="46" y1="42" x2="30" y2="82" stroke={color} strokeWidth="1.2" />
        <line x1="46" y1="42" x2="62" y2="82" stroke={color} strokeWidth="1.2" />
        <path d="M 27,82 C 27,93 65,93 65,82 Z" fill="none" stroke={color} strokeWidth="1.8" />
        <line x1="27" y1="82" x2="65" y2="82" stroke={color} strokeWidth="1.5" />
        
        {/* Right Cup (الحق) */}
        <line x1="154" y1="42" x2="138" y2="82" stroke={color} strokeWidth="1.2" />
        <line x1="154" y1="42" x2="170" y2="82" stroke={color} strokeWidth="1.2" />
        <path d="M 135,82 C 135,93 173,93 173,82 Z" fill="none" stroke={color} strokeWidth="1.8" />
        <line x1="135" y1="82" x2="173" y2="82" stroke={color} strokeWidth="1.5" />
        
        {/* Texts "العدل" & "الحق" under cups */}
        <text x="46" y="100" fontSize="10.5" fontWeight="900" textAnchor="middle" fill={color} fontFamily="Cairo, Arial, sans-serif">العدل</text>
        <text x="154" y="100" fontSize="10.5" fontWeight="900" textAnchor="middle" fill={color} fontFamily="Cairo, Arial, sans-serif">الحق</text>
        
        {/* Open Book under the scale */}
        <path d="M 100,105 L 100,128" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 100,105 C 85,98 64,103 57,109 L 57,132 C 64,126 85,121 100,128 Z" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 100,105 C 115,98 136,103 143,109 L 143,132 C 136,126 115,121 100,128 Z" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Curved Banner Ribbon Frame */}
        <path d="M 25,122 C 45,168 155,168 175,122 L 182,138 C 160,192 40,192 18,138 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Invisible Text Path running in the middle of the ribbon (RTL right-to-left) */}
        <path id={pathId} d="M 178.5,130 C 157.5,180 42.5,180 21.5,130" fill="none" stroke="none" />
        
        {/* Curved text on path */}
        <text fill={color} fontSize="9.5" fontWeight="900" fontFamily="Cairo, Arial, sans-serif" direction="rtl" unicodeBidi="embed">
          <textPath href={`#${pathId}`} xlinkHref={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {cardLogoText}
          </textPath>
        </text>
      </svg>
    );
  };

  // Helper string generator for printing
  const getLogoSvgString = (color: string, text: string, suffix: string) => {
    const id = `banner-path-print-${suffix}`;
    return `
      <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; -webkit-text-size-adjust: none; text-size-adjust: none;" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="100" y1="35" x2="100" y2="120" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        <circle cx="100" cy="30" r="4.5" fill="${color}" />
        <circle cx="100" cy="120" r="3.5" fill="${color}" />
        <line x1="82" y1="116" x2="118" y2="116" stroke="${color}" stroke-width="2.2" stroke-linecap="round" />
        <path d="M 46,42 Q 100,34 154,42" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="100" cy="38" r="3" fill="${color}" />
        <circle cx="46" cy="42" r="2.5" fill="${color}" />
        <circle cx="154" cy="42" r="2.5" fill="${color}" />
        <line x1="46" y1="42" x2="30" y2="82" stroke="${color}" stroke-width="1.2" />
        <line x1="46" y1="42" x2="62" y2="82" stroke="${color}" stroke-width="1.2" />
        <path d="M 27,82 C 27,93 65,93 65,82 Z" fill="none" stroke="${color}" stroke-width="1.8" />
        <line x1="27" y1="82" x2="65" y2="82" stroke="${color}" stroke-width="1.5" />
        <line x1="154" y1="42" x2="138" y2="82" stroke="${color}" stroke-width="1.2" />
        <line x1="154" y1="42" x2="170" y2="82" stroke="${color}" stroke-width="1.2" />
        <path d="M 135,82 C 135,93 173,93 173,82 Z" fill="none" stroke="${color}" stroke-width="1.8" />
        <line x1="135" y1="82" x2="173" y2="82" stroke="${color}" stroke-width="1.5" />
        <text x="46" y="100" font-size="10.5" font-weight="900" text-anchor="middle" fill="${color}" font-family="Cairo, Arial, sans-serif">العدل</text>
        <text x="154" y="100" font-size="10.5" font-weight="900" text-anchor="middle" fill="${color}" font-family="Cairo, Arial, sans-serif">الحق</text>
        <path d="M 100,105 L 100,128" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 100,105 C 85,98 64,103 57,109 L 57,132 C 64,126 85,121 100,128 Z" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 100,105 C 115,98 136,103 143,109 L 143,132 C 136,126 115,121 100,128 Z" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Curved Banner Ribbon Frame -->
        <path d="M 25,122 C 45,168 155,168 175,122 L 182,138 C 160,192 40,192 18,138 Z" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        
        <!-- Invisible Text Path running in the middle of the ribbon (RTL right-to-left) -->
        <path id="${id}" d="M 178.5,130 C 157.5,180 42.5,180 21.5,130" fill="none" stroke="none" />
        <text fill="${color}" font-size="9.5" font-weight="900" font-family="Cairo, Arial, sans-serif" direction="rtl" unicode-bidi="embed">
          <textPath href="#${id}" xlink:href="#${id}" start-offset="50%" text-anchor="middle">
            ${text}
          </textPath>
        </text>
      </svg>
    `;
  };

  const handlePrintBusinessCard = () => {
    const printWindow = window.open("", "", "width=950,height=950");
    if (!printWindow) {
      alert("يرجى السماح بالنوافذ المنبثقة لفتح معاينة وطباعة بطاقات العمل.");
      return;
    }

    const themeStyles = {
      navy: {
        bg: "background: linear-gradient(135deg, #0A1128 0%, #101F42 50%, #0A1128 100%); color: #FAF9F5;",
        border: "border: 2px solid #DFBA73; outline: 1px solid #DFBA73; outline-offset: -5px;",
        accent: "color: #DFBA73;",
        textMuted: "color: #E2E8F0;",
        logoColor: "#DFBA73",
        hr: "border-top: 1px solid rgba(223, 186, 115, 0.35);"
      },
      ivory: {
        bg: "background: #FCFBF7; color: #1E2022;",
        border: "border: 2px solid #C5A880; outline: 1px solid #C5A880; outline-offset: -5px;",
        accent: "color: #9A7B56;",
        textMuted: "color: #4B5563;",
        logoColor: "#9A7B56",
        hr: "border-top: 1px solid rgba(154, 123, 86, 0.35);"
      },
      emerald: {
        bg: "background: linear-gradient(135deg, #043A2C 0%, #085F49 50%, #043A2C 100%); color: #FAF9F5;",
        border: "border: 2px solid #E2C391; outline: 1px solid #E2C391; outline-offset: -5px;",
        accent: "color: #E2C391;",
        textMuted: "color: #E2E8F0;",
        logoColor: "#E2C391",
        hr: "border-top: 1px solid rgba(226, 195, 145, 0.35);"
      }
    };

    const s = themeStyles[cardTheme];

    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة بطاقة العمل القانونية - ${cardName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: 'Cairo', 'Times New Roman', serif;
              direction: rtl;
              text-align: right;
              background-color: #f5f5f4;
              padding: 20px;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            svg, text, tspan, textPath {
              -webkit-text-size-adjust: none !important;
              text-size-adjust: none !important;
            }
            .page-container {
              max-width: 800px;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 30px;
            }
            .print-btn-bar {
              background-color: #ffffff;
              padding: 15px 25px;
              border-radius: 16px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.06);
              width: 100%;
              max-width: 500px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              border: 1px solid #e7e5e4;
            }
            .btn {
              padding: 10px 20px;
              font-size: 13px;
              font-weight: 900;
              border-radius: 8px;
              cursor: pointer;
              border: none;
              transition: all 0.15s ease;
            }
            .btn-primary {
              background-color: #059669;
              color: white;
            }
            .btn-secondary {
              background-color: #1c1917;
              color: white;
            }
            /* Business Card standard size */
            .business-card {
              width: ${cardOrientation === "vertical" ? "55mm" : "85mm"};
              height: ${cardOrientation === "vertical" ? "85mm" : "55mm"};
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
              border-radius: 12px;
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
              page-break-inside: avoid;
              ${s.bg}
              ${s.border}
              padding: 6mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              margin: 10px auto;
            }
            .card-title-lg {
              font-size: 13pt;
              font-weight: 900;
              margin: 0 0 3pt 0;
              line-height: 1.2;
              ${s.accent}
            }
            .card-subtitle-md {
              font-size: 8.5pt;
              font-weight: 700;
              margin: 0 0 5pt 0;
              opacity: 0.95;
            }
            .card-services {
              font-size: 7pt;
              line-height: 1.35;
              margin-top: 4pt;
              ${s.textMuted}
            }
            .logo-container {
              width: 25mm;
              height: 25mm;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${s.logoColor};
            }
            .card-back-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              text-align: center;
            }
            .back-address {
              font-size: 6pt;
              line-height: 1.4;
              margin-top: 5pt;
              max-width: 95%;
              ${s.textMuted}
              text-align: center;
              font-weight: 600;
            }
            .back-contacts {
              margin-top: 6pt;
              font-size: 6.8pt;
              font-weight: 900;
              display: flex;
              gap: 12pt;
              justify-content: center;
              ${s.accent}
            }
            @media print {
              .print-btn-bar {
                display: none;
              }
              body {
                background-color: transparent;
                padding: 0;
              }
              .page-container {
                gap: 25mm;
                margin-top: 15mm;
              }
              .business-card {
                box-shadow: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="print-btn-bar">
              <span style="font-weight: 900; color: #1c1917; font-size: 14px;">🖨️ معاينة طباعة كرت المحامي (وجهين - ${cardOrientation === "vertical" ? "بالعمودي" : "بالأفقي"})</span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary" onclick="window.print()">بدء الطباعة الآن</button>
                <button class="btn btn-secondary" onclick="window.close()">إغلاق المعاينة</button>
              </div>
            </div>

            <!-- FRONT SIDE -->
            <div style="text-align: center; width: 100%;">
              <p style="font-size: 12px; color: #78716c; font-weight: 900; margin-bottom: 8px;">الوجه الأول (الأمامي) - المقاس القياسي ${cardOrientation === "vertical" ? "55 × 85 مم" : "85 × 55 مم"}</p>
              <div class="business-card">
                ${cardOrientation === "vertical" ? `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 100%; width: 100%; text-align: center;">
                  <!-- Top: Legal Logo -->
                  <div class="logo-container" style="margin: 0 auto 2mm auto;">
                    ${getLogoSvgString(s.logoColor, cardLogoText, "print-front")}
                  </div>
                  <!-- Bottom: Lawyer Info -->
                  <div style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <h1 class="card-title-lg">${cardName}</h1>
                    <h2 class="card-subtitle-md" style="font-size: 8pt; margin-top: 2px;">${cardTitle}</h2>
                    <div style="${s.hr} margin: 4pt 0; width: 70%;"></div>
                    <p class="card-services" style="text-align: center; margin-top: 2px;">${cardServices}</p>
                  </div>
                </div>
                ` : `
                <div style="display: flex; justify-content: space-between; align-items: center; height: 100%; width: 100%;">
                  <!-- Right: Lawyer Info -->
                  <div style="flex: 1; padding-left: 4mm; display: flex; flex-direction: column; justify-content: center;">
                    <h1 class="card-title-lg">${cardName}</h1>
                    <h2 class="card-subtitle-md">${cardTitle}</h2>
                    <div style="${s.hr} margin: 4pt 0;"></div>
                    <p class="card-services">${cardServices}</p>
                  </div>
                  <!-- Left: Legal Logo -->
                  <div class="logo-container">
                    ${getLogoSvgString(s.logoColor, cardLogoText, "print-front")}
                  </div>
                </div>
                `}
              </div>
            </div>

            <!-- BACK SIDE -->
            <div style="text-align: center; width: 100%;">
              <p style="font-size: 12px; color: #78716c; font-weight: 900; margin-bottom: 8px;">الوجه الثاني (الخلفي) - المقاس القياسي ${cardOrientation === "vertical" ? "55 × 85 مم" : "85 × 55 مم"}</p>
              <div class="business-card">
                <div class="card-back-container">
                  <!-- Large centered logo -->
                  <div class="logo-container" style="width: 18mm; height: 18mm; margin-bottom: 2mm;">
                    ${getLogoSvgString(s.logoColor, cardLogoText, "print-back")}
                  </div>
                  <!-- Back Side Info -->
                  <div style="width: 100%; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 4pt; margin-top: 2pt;">
                    <p style="font-size: 7.5pt; font-weight: 900; margin: 0; color: #FAF9F5; letter-spacing: 0.5px;">${cardTitle}</p>
                    <p class="back-address" style="font-size: 6.5pt; margin-top: 4pt;">📍 ${cardAddress}</p>
                    <div class="back-contacts" style="flex-direction: ${cardOrientation === "vertical" ? "column" : "row"}; gap: ${cardOrientation === "vertical" ? "4pt" : "12pt"}; margin-top: 8pt; font-size: 7pt;">
                      <span>📞 ${cardPhones}</span>
                      <span>✉️ ${cardEmail}</span>
                    </div>
                  </div>
                </div>
            </div>

          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportToWord = () => {
    const themeStyles = {
      navy: {
        bg: "background-color: #0A1128; color: #FAF9F5;",
        border: "border: 2px solid #DFBA73;",
        accent: "color: #DFBA73;",
        textMuted: "color: #E2E8F0;",
        logoColor: "#DFBA73",
      },
      ivory: {
        bg: "background-color: #FCFBF7; color: #1E2022;",
        border: "border: 2px solid #C5A880;",
        accent: "color: #9A7B56;",
        textMuted: "color: #4B5563;",
        logoColor: "#9A7B56",
      },
      emerald: {
        bg: "background-color: #043A2C; color: #FAF9F5;",
        border: "border: 2px solid #E2C391;",
        accent: "color: #E2C391;",
        textMuted: "color: #E2E8F0;",
        logoColor: "#E2C391",
      }
    };
    const s = themeStyles[cardTheme];

    // Word Document XML & HTML content with complete styles & RTL direction support
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <title>بطاقة المحامي - ${cardName}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: A4 portrait;
              margin: 1.5in 1.0in 1.5in 1.0in;
            }
            body {
              font-family: 'Arial', 'Times New Roman', serif;
              direction: rtl;
              text-align: right;
            }
            p, h1, h2, h3, td, div {
              font-family: 'Arial', 'Times New Roman', serif;
              direction: rtl;
              text-align: right;
            }
            .card-table {
              width: 85mm;
              height: 55mm;
              ${s.bg}
              ${s.border}
              border-radius: 12px;
              padding: 20px;
              margin: 20px auto;
            }
          </style>
        </head>
        <body style="direction: rtl; text-align: right; padding: 20px;">
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="text-align: center; color: #1e293b; font-size: 16pt; font-weight: bold; margin-bottom: 5px;">بطاقة العمل الرسمية والمحاماة</h2>
            <p style="text-align: center; color: #64748b; font-size: 11pt; margin-top: 0;">منظومة الوتيحي العدلية الذكية للحقوق والمحاماة</p>
            <div style="border-top: 2px solid #DFBA73; margin: 15px 0;"></div>
            
            <p style="font-size: 11pt; color: #475569; font-weight: bold; margin-bottom: 20px; text-align: center;">👇 تم توليد بطاقة العمل هذه بصيغة Microsoft Word لتتمكن من تعديلها، حفظها أو طباعتها مباشرة من برنامج وورد:</p>

            <br/>

            <!-- FRONT SIDE -->
            ${cardOrientation === "vertical" ? `
            <table cellpadding="0" cellspacing="0" style="width: 55mm; height: 85mm; border-collapse: collapse; margin: 0 auto 40px auto; border: 2px solid #DFBA73; border-radius: 10px; background-color: #0A1128;">
              <tr>
                <td style="padding: 15px; ${s.bg} text-align: center; vertical-align: middle;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; direction: rtl; text-align: center;">
                    <tr>
                      <td style="vertical-align: middle; text-align: center; padding-bottom: 12px;">
                        <span style="font-size: 22pt; ${s.accent}">⚖️</span>
                        <p style="font-size: 8.5pt; font-weight: bold; margin: 3px 0 0 0; ${s.accent}">${cardLogoText}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="vertical-align: middle; text-align: center; border-top: 1px dashed rgba(223,186,115,0.3); padding-top: 12px;">
                        <h1 style="font-size: 11pt; font-weight: bold; margin: 0 0 4px 0; ${s.accent}">${cardName}</h1>
                        <h2 style="font-size: 8pt; font-weight: bold; margin: 0 0 8px 0; color: #ffffff; opacity: 0.9;">${cardTitle}</h2>
                        <p style="font-size: 7.5pt; margin: 5px 0 0 0; ${s.textMuted}">${cardServices}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            ` : `
            <table cellpadding="0" cellspacing="0" style="width: 85mm; height: 55mm; border-collapse: collapse; margin: 0 auto 40px auto; border: 2px solid #DFBA73; border-radius: 10px; background-color: #0A1128;">
              <tr>
                <td style="padding: 15px; ${s.bg}">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; direction: rtl; text-align: right;">
                    <tr>
                      <td style="vertical-align: middle; text-align: right; padding-left: 15px;">
                        <h1 style="font-size: 15pt; font-weight: bold; margin: 0 0 4px 0; ${s.accent}">${cardName}</h1>
                        <h2 style="font-size: 10pt; font-weight: bold; margin: 0 0 8px 0; color: #ffffff; opacity: 0.9;">${cardTitle}</h2>
                        <div style="border-top: 1px solid rgba(223,186,115,0.4); margin: 6px 0;"></div>
                        <p style="font-size: 8.5pt; margin: 5px 0 0 0; ${s.textMuted}">${cardServices}</p>
                      </td>
                      <td width="90" style="vertical-align: middle; text-align: center; border-right: 1px dashed rgba(223,186,115,0.3); padding-right: 10px;">
                        <span style="font-size: 24pt; ${s.accent}">⚖️</span>
                        <p style="font-size: 8.5pt; font-weight: bold; margin: 4px 0 0 0; ${s.accent}">${cardLogoText}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            `}

            <br/>

            <!-- BACK SIDE -->
            <table cellpadding="0" cellspacing="0" style="width: ${cardOrientation === "vertical" ? "55mm; height: 85mm;" : "85mm; height: 55mm;"} border-collapse: collapse; margin: 0 auto; border: 2px solid #DFBA73; border-radius: 10px; background-color: #0A1128;">
              <tr>
                <td style="padding: 15px; ${s.bg} text-align: center; vertical-align: middle;">
                  <span style="font-size: 20pt; ${s.accent}">⚖️</span>
                  <p style="font-size: 10pt; font-weight: bold; margin: 3px 0; ${s.accent}">${cardLogoText}</p>
                  <div style="border-top: 1px solid rgba(255,255,255,0.15); margin: 6px auto; width: 70%;"></div>
                  <p style="font-size: 8.5pt; font-weight: bold; color: #ffffff; margin: 4px 0;">${cardTitle}</p>
                  <p style="font-size: 7.5pt; ${s.textMuted}; margin: 3px 0;">📍 ${cardAddress}</p>
                  <p style="font-size: 8pt; font-weight: bold; ${s.accent}; margin: 6px 0 0 0; line-height: 1.4;">
                    ${cardOrientation === "vertical" ? `📞 ${cardPhones} <br/> ✉️ ${cardEmail}` : `📞 ${cardPhones} &nbsp;&nbsp;|&nbsp;&nbsp; ✉️ ${cardEmail}`}
                  </p>
                </td>
              </tr>
            </table>

            <br/>
            <div style="border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 10px; text-align: center;">
              <p style="font-size: 9pt; color: #94a3b8;">تم التصدير بنجاح عبر النظام السحابي للمستشار القانوني الوتيحي ⚖️</p>
            </div>

          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `كرت_المحامي_${cardName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Configurable Promo States
  const [platformName, setPlatformName] = useState("المنصة العدلية لمكاتب المحاماة");
  const [attorneyName, setAttorneyName] = useState(() => {
    const baseName = attorneyNameProp;
    if (baseName.includes("المحامي")) return baseName;
    return `المحامي ${baseName}`;
  });
  const [phone, setPhone] = useState("771673276");
  const [whatsapp, setWhatsapp] = useState("771673276");
  const [address, setAddress] = useState("صنعاء - أمام محكمة غرب الأمانة الابتدائية");
  const [slogan, setSlogan] = useState("الحماية القانونية المتكاملة والذكية لجميع أعمالك وقضاياك");
  const [callToAction, setCallToAction] = useState("احصل على استشارتك القانونية الأولى والتحقق الفوري من مستنداتك مجاناً!");
  
  const [selectedStyle, setSelectedStyle] = useState<"gold" | "cyber" | "brochure">("gold");
  const [activeAdTab, setActiveAdTab] = useState<"whatsapp" | "sms" | "google" | "facebook">("whatsapp");
  
  const [copiedText, setCopiedText] = useState(false);
  const [copiedAdCopy, setCopiedAdCopy] = useState(false);

  // Ready-to-use copywriting templates
  const getAdCopyText = (type: "whatsapp" | "sms" | "google" | "facebook") => {
    switch (type) {
      case "whatsapp":
        return `⚖️ *بوابة الخدمات القضائية والعدلية باليمن* ⚖️
تحت إشراف مباشر من *${attorneyName}*

هل تبحث عن صياغة قانونية سليمة ومضمونة؟ هل ترغب في إدارة قضاياك وجلساتك بدقة متناهية؟

🚀 نضع بين يديك *${platformName}* - النظام التكنولوجي الأول في اليمن المصمم خصيصاً لمواكبة المحاكم والتشريعات اليمنية!

🌟 *أبرز خدماتنا ومميزات المنصة:*
1️⃣ *مكتبة النماذج التفاعلية:* صياغة فورية لأكثر من 654 نموذجاً شرعياً وجنائياً وتجارياً معتمداً لوزارة العدل.
2️⃣ *المستشار اليمني الذكي:* ذكاء اصطناعي مدرب على سائر القوانين المدنية، الشخصية، والتجارية بالجمهورية اليمنية لإبداء الرأي القانوني خلال ثوانٍ.
3️⃣ *نظام تتبع ذكي:* مزامنة الجلسات السحابية، تنبيهات صفارات الإنذار الصوتية للمواعيد، والتقاويم الهجرية والميلادية المزدوجة.
4️⃣ *الخزنة والأرشفة:* حفظ وتشفير ملفات القضايا والتوثيقات بأعلى درجات السرية والخصوصية.

📍 *مقرنا:* ${address}
📞 *للتواصل الفوري:* ${phone}
💬 *راسلنا مباشرة عبر الواتساب:* https://wa.me/967${whatsapp}

💎 _*${callToAction}*_`;

      case "sms":
        return `الآن باليمن! ${platformName} بإشراف ${attorneyName}. صياغة 654 نموذجاً ومستشاراً قانونياً ذكياً لإدارة القضايا والجلسات. تواصل: ${phone} / ${address}`;

      case "google":
        return `${platformName} | مكتب ${attorneyName} للخدمات القانونية باليمن\nAd · https://example.com/legal-services\nالمنصة الرقمية الأولى باليمن لصياغة وتدقيق 654 نموذجاً شرعياً وجنائياً، نظام تتبع الجلسات المزدوج والمستشار الذكي المعتمد. اتصل الآن: ${phone} - العنوان: ${address}.`;

      case "facebook":
        return `🏛️ الحماية القانونية الرقمية لشركتك وقضاياك أصبحت حقيقة في اليمن!
يسر مكتب ${attorneyName} أن يعلن رسمياً عن إطلاق الإصدار الأحدث من "${platformName}" لتسهيل وتوثيق الإجراءات العدلية والشرعية.

الآن، لا تضيع وقتك في البحث عن صيغ المعاملات؛ منصتنا توفر لك أكثر من 654 نموذجاً تفاعلياً جاهزاً للطباعة أو التعديل في متصفح وورد مباشرة، بالإضافة لمستشار قانوني ذكي يجيبك عن كافة التساؤلات طبقاً للقوانين واللوائح اليمنية النافذة.

💼 خدمات مخصصة للتجار، الشركات، ومكاتب المحاماة الزميلة والموكلين الأفراد.
🛡️ حماية قصوى لبياناتك وقضاياك مع أرشفة سحابية كاملة ومزامنة تلقائية للأجهزة واللاب توب.

📍 المقر الرئيسي: ${address}
📱 هاتف اتصال: ${phone}
🟢 واتساب مباشر: https://wa.me/967${whatsapp}

شرفنا بزيارتك أو تواصل معنا لحجز جلسة استشارة مع الطاقم العدلي المعتمد لدينا.`;
    }
  };

  const handleCopyText = () => {
    const textToCopy = getAdCopyText(activeAdTab);
    navigator.clipboard.writeText(textToCopy);
    setCopiedAdCopy(true);
    setTimeout(() => setCopiedAdCopy(false), 2000);
  };

  const handleCopyContacts = () => {
    const contacts = `📢 ${platformName}
👨‍💼 بإشراف: ${attorneyName}
📞 اتصال: ${phone}
💬 واتساب: ${whatsapp}
📍 العنوان: ${address}`;
    navigator.clipboard.writeText(contacts);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintAdCard = () => {
    const printContent = document.getElementById("ad-preview-card");
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open("", "", "width=800,height=900");
    if (!printWindow) {
      alert("يرجى السماح بالنوافذ المنبثقة لطباعة بطاقة الإعلان الرسمية.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة إعلان المنصة العدلية</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @page {
              size: A4 ${adOrientation === "horizontal" ? "landscape" : "portrait"};
              margin: 10mm;
            }
            body {
              font-family: 'Times New Roman', 'Arial', serif;
              direction: rtl;
              text-align: right;
              background-color: white;
              padding: 20px;
            }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="flex justify-center items-center min-h-screen">
            <div class="w-full ${adOrientation === "horizontal" ? "max-w-4xl" : "max-w-xl"} border-4 border-double border-amber-600 p-8 rounded-2xl bg-stone-50 shadow-md">
              ${printContent.innerHTML}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const shareOnWhatsapp = () => {
    const text = encodeURIComponent(getAdCopyText("whatsapp"));
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8" dir="rtl" id="promo-hub-workspace">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 border-b-4 border-amber-500 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-x-12 -translate-y-12"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-right">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-black">
              <Megaphone className="h-3.5 w-3.5 text-amber-500" />
              <span>جناح الدعاية والترويج المتكامل للعدالة اليمنية</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              الاستوديو الترويجي وصانع الإعلانات التفاعلي
            </h2>
            <p className="text-stone-300 text-xs md:text-sm leading-relaxed max-w-2xl">
              أهلاً بك في وحدة التسويق المصممة خصيصاً لمنصتك القانونية. يمكنك هنا تكييف وتحديث البيانات لإنتاج أروع بطاقات الدعاية القضائية والمنشورات التسويقية المعدة مسبقاً للنشر عبر الواتساب، والفيسبوك، وطباعتها بأعلى مستويات الجودة والأناقة الشرعية.
            </p>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-2xl border border-stone-800 text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider block mb-1">مصمم الواجهة والمطور</span>
            <h4 className="text-sm font-bold text-white">حاتم الوتيحي</h4>
            <p className="text-[10px] text-stone-400 mt-1">هاتف: +967 771673276</p>
            <div className="mt-3 flex justify-center gap-2">
              <a 
                href="https://wa.me/967771673276" 
                target="_blank" 
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-lg text-xs font-bold px-2.5 transition-all flex items-center gap-1"
              >
                <span>واتساب المطور</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 max-w-lg mx-auto shadow-inner">
        <button
          onClick={() => setModuleTab("card")}
          className={`flex-1 py-3 text-center rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            moduleTab === "card"
              ? "bg-slate-900 text-amber-400 shadow-md"
              : "text-stone-600 hover:text-slate-900 hover:bg-stone-50"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>📇 كرت المحامي الفاخر (وجهين)</span>
        </button>
        <button
          onClick={() => setModuleTab("ads")}
          className={`flex-1 py-3 text-center rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            moduleTab === "ads"
              ? "bg-slate-900 text-amber-400 shadow-md"
              : "text-stone-600 hover:text-slate-900 hover:bg-stone-50"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>📢 استوديو الإعلانات والتسويق</span>
        </button>
      </div>

      {moduleTab === "card" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customizer Panel (Right 5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 shadow-lg p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Palette className="h-5 w-5 text-amber-600" />
              <h3 className="font-extrabold text-sm md:text-base text-slate-900">تخصيص كرت المحامي الملكي</h3>
            </div>

            <div className="space-y-4">
              {/* Theme Selector */}
              <div>
                <label className="text-xs font-black text-stone-700 block mb-2">طراز وهيكل كرت المحامي:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCardTheme("navy")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      cardTheme === "navy"
                        ? "bg-amber-500/10 border-amber-500 text-amber-950 font-black shadow-sm"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    <div className="h-3.5 w-3.5 rounded-full bg-[#0A1128] border border-amber-500 mx-auto mb-1" />
                    <span className="text-[10px] sm:text-xs block font-bold">كحلي وذهبي</span>
                  </button>

                  <button
                    onClick={() => setCardTheme("ivory")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      cardTheme === "ivory"
                        ? "bg-amber-500/10 border-amber-600 text-stone-900 font-black shadow-sm"
                        : "bg-[#FCFBF7] hover:bg-[#FAF9F5] text-stone-600 border-stone-200"
                    }`}
                  >
                    <div className="h-3.5 w-3.5 rounded-full bg-[#FCFBF7] border border-amber-600 mx-auto mb-1" />
                    <span className="text-[10px] sm:text-xs block font-bold">عاجي كلاسيك</span>
                  </button>

                  <button
                    onClick={() => setCardTheme("emerald")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      cardTheme === "emerald"
                        ? "bg-[#0E3A2F]/10 border-emerald-600 text-emerald-950 font-black shadow-sm"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    <div className="h-3.5 w-3.5 rounded-full bg-[#043A2C] border border-emerald-500 mx-auto mb-1" />
                    <span className="text-[10px] sm:text-xs block font-bold">زمردي ملكي</span>
                  </button>
                </div>
              </div>

              {/* Card Orientation Selector */}
              <div>
                <label className="text-xs font-black text-stone-700 block mb-2">اتجاه هيكل بطاقة العمل:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCardOrientation("horizontal")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      cardOrientation === "horizontal"
                        ? "bg-amber-500/10 border-amber-500 text-amber-950 font-black shadow-sm"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    <span>📇</span>
                    <span className="text-[11px] sm:text-xs block font-bold">أفقي (مستعرض)</span>
                  </button>

                  <button
                    onClick={() => setCardOrientation("vertical")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      cardOrientation === "vertical"
                        ? "bg-amber-500/10 border-amber-500 text-amber-950 font-black shadow-sm"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    <span>📊</span>
                    <span className="text-[11px] sm:text-xs block font-bold">عمودي (قائم)</span>
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-extrabold text-stone-750 block mb-1">الاسم بالكامل:</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-250 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right font-bold text-slate-900"
                    placeholder="مثال: المحامي القانوني عبدالله علي حمود الوتيحي"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-stone-750 block mb-1">الصفة والمكتب الرئيسي:</label>
                  <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-250 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right font-bold text-slate-800"
                    placeholder="مثال: لدى مكتب الوتيحي للمحاماة"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-stone-750 block mb-1">الخدمات الاستشارية والمحاماة:</label>
                  <input
                    type="text"
                    value={cardServices}
                    onChange={(e) => setCardServices(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-250 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right text-stone-700"
                    placeholder="المكتب الاستشاري - محاماه - تحكيم - استشارات قانونية"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-stone-750 block mb-1">أرقام الجوال:</label>
                  <input
                    type="text"
                    value={cardPhones}
                    onChange={(e) => setCardPhones(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-250 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-left font-mono font-bold"
                    placeholder="771673276 - 715375198"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-stone-750 block mb-1">البريد الإلكتروني:</label>
                  <input
                    type="text"
                    value={cardEmail}
                    onChange={(e) => setCardEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-250 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-left font-mono text-stone-700"
                    placeholder="office@example.com"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-stone-750 block mb-1">العنوان التفصيلي بالكامل:</label>
                  <textarea
                    value={cardAddress}
                    onChange={(e) => setCardAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-250 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right h-16 resize-none font-sans"
                    placeholder="الأصبحي - شارع الأربعين - تقاطع شارع المقالح - فوق مفروشات الصرمي مقابل الكريمي - صنعاء"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-stone-750 block mb-1">النص المقوس أسفل الشعار:</label>
                  <input
                    type="text"
                    value={cardLogoText}
                    onChange={(e) => setCardLogoText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-250 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right font-semibold"
                    placeholder="الوتيحي للمحاماة"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 flex flex-col justify-between min-h-[550px]">
              
              {/* Preview Header Actions */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-amber-500" />
                  <span className="font-extrabold text-sm md:text-base text-slate-900">معاينة بطاقة العمل الفاخرة (وجهين)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintBusinessCard}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>طباعة بطاقة العمل (دقة عالية)</span>
                  </button>
                  <button
                    onClick={handleExportToWord}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                    title="تنزيل الكرت بصيغة وورد لتعديله وطباعته بمكتبك"
                  >
                    <FileText className="h-4 w-4 text-white" />
                    <span>تنزيل كملف Word (DOCX)</span>
                  </button>
                </div>
              </div>

              {/* Live Interactive Preview Container */}
              <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4 bg-stone-50 border border-stone-200 rounded-2xl min-h-[420px] overflow-auto">
                
                {/* FRONT SIDE PREVIEW */}
                <div className={`w-full transition-all duration-300 ${cardOrientation === "vertical" ? "max-w-[270px]" : "max-w-[420px]"}`}>
                  <p className="text-[10px] text-stone-400 font-extrabold text-center mb-1.5 uppercase tracking-widest">◀ الوجه الأول - الوجه الأمامي ▶</p>
                  <div 
                    className={`w-full rounded-xl relative shadow-xl overflow-hidden p-6 transition-all duration-300 border-2 border-double select-text ${
                      cardOrientation === "vertical" ? "aspect-[55/85]" : "aspect-[1.75]"
                    } ${
                      cardTheme === "navy" 
                        ? "bg-gradient-to-br from-[#0A1128] via-[#101F42] to-[#0A1128] text-stone-100 border-[#DFBA73]/40 outline outline-1 outline-[#DFBA73]/30 outline-offset-[-4px]" 
                        : cardTheme === "ivory" 
                        ? "bg-[#FCFBF7] text-[#1E2022] border-[#C5A880]/60 outline outline-1 outline-[#C5A880]/30 outline-offset-[-4px]" 
                        : "bg-gradient-to-br from-[#043A2C] via-[#085F49] to-[#043A2C] text-stone-100 border-[#E2C391]/40 outline outline-1 outline-[#E2C391]/30 outline-offset-[-4px]"
                    }`}
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    <div className={`flex ${cardOrientation === "vertical" ? "flex-col justify-between items-center text-center" : "justify-between items-center"} h-full`}>
                      {cardOrientation === "vertical" ? (
                        <>
                          {/* Top: Legal Logo */}
                          <div className="w-16 h-16 shrink-0 flex items-center justify-center mb-1">
                            <LogoSvg 
                              color={cardTheme === "navy" ? "#DFBA73" : cardTheme === "ivory" ? "#9A7B56" : "#E2C391"} 
                              className="w-full h-full"
                              suffix="front"
                            />
                          </div>
                          {/* Bottom: Lawyer Info */}
                          <div className="w-full text-center flex flex-col items-center justify-center">
                            <h3 
                              className={`font-black text-xs sm:text-sm mb-1 ${
                                cardTheme === "navy" ? "text-[#DFBA73]" : cardTheme === "ivory" ? "text-[#9A7B56]" : "text-[#E2C391]"
                              }`}
                            >
                              {cardName}
                            </h3>
                            <p className="text-[9px] font-bold opacity-90 leading-tight mb-1">{cardTitle}</p>
                            
                            <div className={`w-3/4 h-[1px] my-1.5 opacity-30 ${
                              cardTheme === "navy" ? "bg-[#DFBA73]" : cardTheme === "ivory" ? "bg-[#9A7B56]" : "bg-[#E2C391]"
                            }`} />
                            
                            <p className="text-[7.5px] font-semibold opacity-85 leading-normal max-h-[45px] overflow-hidden">{cardServices}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Right Info Column */}
                          <div className="flex-1 pr-1 pl-3 text-right">
                            <h3 
                              className={`font-black text-sm sm:text-base mb-1 ${
                                cardTheme === "navy" ? "text-[#DFBA73]" : cardTheme === "ivory" ? "text-[#9A7B56]" : "text-[#E2C391]"
                              }`}
                            >
                              {cardName}
                            </h3>
                            <p className="text-[10px] sm:text-xs font-bold opacity-90 leading-relaxed mb-2">{cardTitle}</p>
                            
                            <div className={`w-full h-[1px] my-2 opacity-30 ${
                              cardTheme === "navy" ? "bg-[#DFBA73]" : cardTheme === "ivory" ? "bg-[#9A7B56]" : "bg-[#E2C391]"
                            }`} />
                            
                            <p className="text-[8px] sm:text-[9.5px] font-semibold opacity-85 leading-relaxed">{cardServices}</p>
                          </div>

                          {/* Left Logo Column */}
                          <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                            <LogoSvg 
                              color={cardTheme === "navy" ? "#DFBA73" : cardTheme === "ivory" ? "#9A7B56" : "#E2C391"} 
                              className="w-full h-full"
                              suffix="front"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* BACK SIDE PREVIEW */}
                <div className={`w-full transition-all duration-300 ${cardOrientation === "vertical" ? "max-w-[270px]" : "max-w-[420px]"}`}>
                  <p className="text-[10px] text-stone-400 font-extrabold text-center mb-1.5 uppercase tracking-widest">◀ الوجه الثاني - الوجه الخلفي ▶</p>
                  <div 
                    className={`w-full rounded-xl relative shadow-xl overflow-hidden p-6 transition-all duration-300 border-2 border-double select-text ${
                      cardOrientation === "vertical" ? "aspect-[55/85]" : "aspect-[1.75]"
                    } ${
                      cardTheme === "navy" 
                        ? "bg-gradient-to-br from-[#0A1128] via-[#101F42] to-[#0A1128] text-stone-100 border-[#DFBA73]/40 outline outline-1 outline-[#DFBA73]/30 outline-offset-[-4px]" 
                        : cardTheme === "ivory" 
                        ? "bg-[#FCFBF7] text-[#1E2022] border-[#C5A880]/60 outline outline-1 outline-[#C5A880]/30 outline-offset-[-4px]" 
                        : "bg-gradient-to-br from-[#043A2C] via-[#085F49] to-[#043A2C] text-stone-100 border-[#E2C391]/40 outline outline-1 outline-[#E2C391]/30 outline-offset-[-4px]"
                    }`}
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                      {/* Centered Logo */}
                      <div className="w-14 h-14 shrink-0 flex items-center justify-center mb-1">
                        <LogoSvg 
                          color={cardTheme === "navy" ? "#DFBA73" : cardTheme === "ivory" ? "#9A7B56" : "#E2C391"} 
                          className="w-full h-full"
                          suffix="back"
                        />
                      </div>

                      <div className={`w-3/4 h-[1px] opacity-20 ${
                        cardTheme === "navy" ? "bg-[#DFBA73]" : cardTheme === "ivory" ? "bg-[#9A7B56]" : "bg-[#E2C391]"
                      }`} />

                      {/* Address & Contact Info */}
                      <p className="text-[7.5px] sm:text-[8px] font-bold max-w-[95%] opacity-90 leading-tight">
                        📍 {cardAddress}
                      </p>
                      <div className={`flex ${cardOrientation === "vertical" ? "flex-col gap-1 items-center" : "items-center gap-3"} text-[8px] sm:text-[9px] font-bold ${
                        cardTheme === "navy" ? "text-[#DFBA73]" : cardTheme === "ivory" ? "text-[#9A7B56]" : "text-[#E2C391]"
                      }`}>
                        <span>📞 {cardPhones}</span>
                        <span>✉️ {cardEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Helper tips */}
              <p className="text-[10px] text-stone-400 font-bold text-center mt-3">
                💡 بطاقات العمل مصممة بالأبعاد المعيارية الدولية (85x55 مم). انقر على "طباعة بطاقة العمل" لطباعتها فوراً بدقة طباعة 300 DPI.
              </p>

            </div>
          </div>
        </div>
      )}

      {moduleTab === "ads" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Customizer Panel (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 shadow-lg p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Palette className="h-5 w-5 text-amber-600" />
            <h3 className="font-extrabold text-sm md:text-base text-slate-900">مخصص تصميم الإعلانات والبيانات</h3>
          </div>

          <div className="space-y-4">
            
            {/* Template Card Selectors */}
            <div>
              <label className="text-xs font-black text-stone-700 block mb-2">اختر نمط وقالب بطاقة الإعلان:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedStyle("gold")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedStyle === "gold"
                      ? "bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  <Award className="h-4 w-4 mx-auto mb-1 text-amber-600" />
                  <span className="text-[10px] sm:text-xs block">الذهبي الملكي</span>
                </button>

                <button
                  onClick={() => setSelectedStyle("cyber")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedStyle === "cyber"
                      ? "bg-slate-900 border-slate-700 text-amber-400 font-bold shadow-sm"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  <Sparkles className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-[10px] sm:text-xs block">التقني الحديث</span>
                </button>

                <button
                  onClick={() => setSelectedStyle("brochure")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedStyle === "brochure"
                      ? "bg-stone-100 border-stone-400 text-stone-900 font-bold shadow-sm"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  <Layout className="h-4 w-4 mx-auto mb-1 text-stone-700" />
                  <span className="text-[10px] sm:text-xs block">بروشور الخدمات</span>
                </button>
              </div>
            </div>

            {/* Ads Orientation Selector */}
            <div>
              <label className="text-xs font-black text-stone-700 block mb-2">اتجاه تصميم الإعلان والتسويق:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdOrientation("horizontal")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adOrientation === "horizontal"
                      ? "bg-amber-500/10 border-amber-500 text-amber-950 font-black shadow-sm"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  <span>📇</span>
                  <span className="text-[11px] sm:text-xs block font-bold">أفقي (مستعرض)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdOrientation("vertical")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adOrientation === "vertical"
                      ? "bg-amber-500/10 border-amber-500 text-amber-950 font-black shadow-sm"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  <span>📊</span>
                  <span className="text-[11px] sm:text-xs block font-bold">عمودي (قائم)</span>
                </button>
              </div>
            </div>

            {/* Platform Input fields */}
            <div className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">اسم المنصة الإعلاني:</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border"
                  placeholder="مثال: المنصة العدلية لمكاتب المحاماة"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">اسم المحامي المسؤول:</label>
                <input
                  type="text"
                  value={attorneyName}
                  onChange={(e) => setAttorneyName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border"
                  placeholder="مثال: المحامي اسم المحامي/المكتب"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">رقم الاتصال المباشر:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border font-mono text-left"
                    placeholder="771673276"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">رقم واتساب الخدمة:</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border font-mono text-left"
                    placeholder="771673276"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">عنوان المقر / المكتب:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border"
                  placeholder="مثال: صنعاء - أمام محكمة غرب الأمانة"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">الشعار / العنوان الفرعي الترويجي:</label>
                <textarea
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border h-16 resize-none"
                  placeholder="شعار جذاب..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">العرض التفاعلي (Call to Action):</label>
                <textarea
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border h-16 resize-none"
                  placeholder="مثال: احصل على أول استشارة مجاناً..."
                />
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="pt-2">
              <button
                onClick={handleCopyContacts}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-stone-250 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600 animate-scale" />
                    <span className="text-emerald-600 font-extrabold">تم نسخ جهات الاتصال والتفاصيل!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-stone-600" />
                    <span>نسخ جهات الاتصال والتفاصيل الموحدة</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Live Preview Card & Actions (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 flex flex-col justify-between min-h-[480px]">
            
            {/* Preview Header Actions */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-amber-500" />
                <span className="font-extrabold text-sm md:text-base text-slate-900">المعاينة والجاهزية للطباعة والمشاركة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrintAdCard}
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1"
                  title="طباعة كارت الإعلان بأعلى دقة"
                >
                  <Printer className="h-4 w-4 text-stone-600" />
                  <span className="hidden sm:inline">طباعة الإعلان</span>
                </button>
                <button
                  onClick={shareOnWhatsapp}
                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 border border-emerald-200"
                  title="مشاركة إعلان الواتساب"
                >
                  <Share2 className="h-4 w-4 text-emerald-600" />
                  <span className="hidden sm:inline">مشاركة واتساب</span>
                </button>
              </div>
            </div>

            {/* Interactive Render Container */}
            <div className="flex-1 flex items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden min-h-[400px]">
              <div 
                id="ad-preview-card" 
                className={`w-full ${adOrientation === "horizontal" ? "max-w-2xl" : "max-w-md"} transition-all duration-300 relative select-text`}
                style={{ fontFamily: "Times New Roman, Times, serif" }}
              >
                
                {/* 1. Classic Gold & Slate Theme */}
                {selectedStyle === "gold" && (
                  <div className="border-4 border-double border-amber-600 bg-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden text-right">
                    {/* Seal background effect */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                      <div className="border-8 border-amber-600 rounded-full p-12 text-center">
                        <span className="text-xl font-black text-amber-600">الجمهورية اليمنية</span>
                        <span className="text-xs font-bold text-amber-600 block">وزارة العدل</span>
                      </div>
                    </div>

                    {adOrientation === "horizontal" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative z-10">
                        {/* Right side: Header & Title & Slogan */}
                        <div className="space-y-4">
                          {/* Frame Top */}
                          <div className="flex justify-between items-start border-b border-amber-500/25 pb-3">
                            <div className="text-right space-y-0.5 text-[10px] text-stone-700">
                              <p className="font-extrabold text-slate-950">الجمهورية اليمنية</p>
                              <p className="font-semibold text-stone-500">مكتب {attorneyName}</p>
                            </div>
                            <div className="h-8 w-8 bg-amber-50 border border-amber-600/30 rounded-full flex items-center justify-center shrink-0">
                              <Megaphone className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <div className="text-left text-[9px] text-stone-400 font-mono">
                              <p>بوابة قضائية</p>
                              <p>#AD_PORTAL</p>
                            </div>
                          </div>

                          {/* Main Platform Call */}
                          <div className="text-center py-1">
                            <span className="text-[10px] text-amber-600 font-extrabold tracking-widest block uppercase mb-1">نقدم لكم بكل فخر</span>
                            <h2 className="text-lg font-black text-slate-900 border-y border-double border-amber-600/40 py-1 inline-block px-3 bg-stone-50/70">
                              {platformName}
                            </h2>
                          </div>

                          {/* Slogan */}
                          <p className="text-xs text-center font-semibold text-stone-700 italic max-w-xs mx-auto leading-relaxed">
                            " {slogan} "
                          </p>

                          <div className="pt-2 border-t border-stone-100">
                            <p className="font-extrabold text-slate-950 text-[11px]">👨‍💼 بإشراف: {attorneyName}</p>
                            <p className="flex items-center gap-1 mt-1 text-[10px] text-stone-500">
                              <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                              <span className="font-sans">{address}</span>
                            </p>
                          </div>
                        </div>

                        {/* Left side: Features & CTA & Contacts */}
                        <div className="space-y-4 md:border-r md:border-stone-150 md:pr-6">
                          {/* Bullet Points */}
                          <div className="space-y-2 text-xs text-stone-800">
                            <div className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold shrink-0">✦</span>
                              <p>صياغة فورية لأكثر من <strong className="text-slate-950 font-black">654 نموذجاً شرعياً وقضائياً</strong>.</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold shrink-0">✦</span>
                              <p>المستشار الذكي المدرب على <strong className="text-slate-950 font-black">القوانين اليمنية</strong>.</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold shrink-0">✦</span>
                              <p>تنظيم الجلسات وتنبيهات صفارات الإنذار الصوتية.</p>
                            </div>
                          </div>

                          {/* Call to action panel */}
                          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-2.5 text-center">
                            <p className="text-[10px] sm:text-[10.5px] font-bold text-amber-800 leading-relaxed">
                              💎 {callToAction}
                            </p>
                          </div>

                          <div className="bg-stone-100 p-2.5 rounded-xl border border-stone-200 text-xs text-center space-y-1">
                            <p className="font-bold text-slate-900">📞 اتصال: {phone}</p>
                            <p className="font-bold text-emerald-700">💬 واتساب: {whatsapp}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        {/* Frame Top */}
                        <div className="flex justify-between items-start border-b border-amber-500/25 pb-3 mb-5">
                          <div className="text-right space-y-0.5 text-[10px] text-stone-700">
                            <p className="font-extrabold text-slate-950">الجمهورية اليمنية</p>
                            <p className="font-semibold text-stone-500">مكتب {attorneyName}</p>
                          </div>
                          <div className="h-9 w-9 bg-amber-50 border border-amber-600/30 rounded-full flex items-center justify-center">
                            <Megaphone className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="text-left text-[9px] text-stone-400 font-mono">
                            <p>بوابة قضائية معتمدة</p>
                            <p>#AD_PORTAL</p>
                          </div>
                        </div>

                        {/* Main Platform Call */}
                        <div className="text-center mb-5">
                          <span className="text-xs text-amber-600 font-extrabold tracking-widest block uppercase mb-1">نقدم لكم بكل فخر</span>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 border-y-2 border-double border-amber-600/40 py-2 inline-block px-4 bg-stone-50/70">
                            {platformName}
                          </h2>
                        </div>

                        {/* Slogan */}
                        <p className="text-xs sm:text-sm text-center font-semibold text-stone-700 italic max-w-xs mx-auto leading-relaxed mb-6">
                          " {slogan} "
                        </p>

                        {/* Bullet Points */}
                        <div className="space-y-2.5 mb-6 text-xs text-stone-800">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold shrink-0">✦</span>
                            <p>صياغة فورية لأكثر من <strong className="text-slate-950 font-black">654 نموذجاً شرعياً وقضائياً</strong> لوزارة العدل.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold shrink-0">✦</span>
                            <p>المستشار الذكي اليمني المدرب بالكامل على <strong className="text-slate-950 font-black">القوانين اليمنية</strong>.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold shrink-0">✦</span>
                            <p>تنظيم وجدولة الجلسات، تنبيهات صفارات الإنذار، والتقويم المزدوج.</p>
                          </div>
                        </div>

                        {/* Call to action panel */}
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-center mb-6">
                          <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                            💎 {callToAction}
                          </p>
                        </div>

                        {/* Footer Contact Details */}
                        <div className="border-t border-dashed border-stone-250 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-stone-600 font-mono">
                          <div className="space-y-1 text-center sm:text-right">
                            <p className="font-extrabold text-slate-900 font-sans text-[11px]">👨‍💼 بإشراف: {attorneyName}</p>
                            <p className="flex items-center gap-1 justify-center sm:justify-start">
                              <MapPin className="h-3 w-3 text-amber-600" />
                              <span className="font-sans">{address}</span>
                            </p>
                          </div>
                          <div className="space-y-1 text-center sm:text-left bg-stone-100 p-2 rounded-xl border border-stone-200">
                            <p className="font-bold text-slate-900">📞 اتصال: {phone}</p>
                            <p className="font-bold text-emerald-700">💬 واتساب: {whatsapp}</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 2. Cyber Tech Theme */}
                {selectedStyle === "cyber" && (
                  <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden text-right border border-slate-800">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>

                    {adOrientation === "horizontal" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative z-10">
                        {/* Right Column: Header & Title & Slogan */}
                        <div className="space-y-4">
                          {/* Top Cyber Line */}
                          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                              <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400">YEMEN COURT ONLINE</span>
                            </div>
                            <div className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black">
                              رقمي ذكي
                            </div>
                          </div>

                          {/* Title */}
                          <div>
                            <span className="text-[9px] font-mono text-amber-400 block mb-0.5">المنظومة التكنولوجية المعتمدة لليمن</span>
                            <h2 className="text-lg font-black text-white tracking-wide">
                              {platformName}
                            </h2>
                            <p className="text-[10px] text-slate-400 mt-1 font-sans">بإشراف المحاماة: <strong className="text-amber-400">{attorneyName}</strong></p>
                          </div>

                          {/* Slogan */}
                          <div className="bg-slate-900 border-r-4 border-amber-500 p-2.5 rounded-l-xl">
                            <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans">
                              " {slogan} "
                            </p>
                          </div>

                          <div className="space-y-0.5 text-[10px] text-slate-400 font-mono">
                            <p className="text-slate-500">📍 المقر الرئيسي:</p>
                            <p className="text-white text-[10px]">{address}</p>
                          </div>
                        </div>

                        {/* Left Column: Badges & CTA & Footer */}
                        <div className="space-y-4 md:border-r md:border-slate-800 md:pr-6">
                          {/* Features Badges */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
                            <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                              <span className="text-amber-400 font-bold block mb-0.5">📚 654 نموذجاً</span>
                              <p className="text-[9px] text-slate-400">صياغات شرعية وتجارية فورية.</p>
                            </div>
                            <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                              <span className="text-amber-400 font-bold block mb-0.5">🧠 مستشار ذكي</span>
                              <p className="text-[9px] text-slate-400">إجابات قانونية فورية لليمن.</p>
                            </div>
                          </div>

                          {/* CTA Box */}
                          <div className="border border-dashed border-amber-500/30 p-2.5 rounded-xl text-center bg-amber-400/5">
                            <span className="text-[10px] text-amber-300 font-bold leading-normal block">
                              🎁 {callToAction}
                            </span>
                          </div>

                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs text-center font-mono">
                            <p className="text-white font-bold">📞 {phone}</p>
                            <p className="text-emerald-400 font-bold">🟢 واتساب: {whatsapp}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        {/* Top Cyber Line */}
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400">YEMEN COURT ONLINE</span>
                          </div>
                          <div className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black">
                            رقمي ذكي
                          </div>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                          <span className="text-[10px] font-mono text-amber-400 block mb-1">المنظومة التكنولوجية المعتمدة لليمن</span>
                          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                            {platformName}
                          </h2>
                          <p className="text-[11px] text-slate-400 mt-1 font-sans">بإشراف المحاماة: <strong className="text-amber-400">{attorneyName}</strong></p>
                        </div>

                        {/* Slogan */}
                        <div className="bg-slate-900 border-r-4 border-amber-500 p-3 rounded-l-xl mb-5">
                          <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans">
                            " {slogan} "
                          </p>
                        </div>

                        {/* Features Badges */}
                        <div className="grid grid-cols-2 gap-2.5 mb-5 text-[11px] font-sans">
                          <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                            <span className="text-amber-400 font-bold block mb-0.5">📚 654 نموذجاً</span>
                            <p className="text-[10px] text-slate-400">صياغات شرعية، تجارية، جنائية فورية.</p>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                            <span className="text-amber-400 font-bold block mb-0.5">🧠 المستشار الآلي</span>
                            <p className="text-[10px] text-slate-400">إجابات قانونية وفق تشريعات اليمن.</p>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                            <span className="text-amber-400 font-bold block mb-0.5">🔔 صفارات الجدولة</span>
                            <p className="text-[10px] text-slate-400">تنبيهات صوتية فورية لجلسات المحاكم.</p>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                            <span className="text-amber-400 font-bold block mb-0.5">☁️ أرشفة مشفرة</span>
                            <p className="text-[10px] text-slate-400">حفظ سحابي مؤمن ضد فقدان البيانات.</p>
                          </div>
                        </div>

                        {/* CTA Box */}
                        <div className="border border-dashed border-amber-500/30 p-2.5 rounded-xl text-center mb-5 bg-amber-400/5">
                          <span className="text-[10px] text-amber-300 font-bold leading-normal block">
                            🎁 {callToAction}
                          </span>
                        </div>

                        {/* Contacts footer */}
                        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
                          <div className="space-y-0.5 text-center sm:text-right font-sans">
                            <p className="text-slate-500">📍 المقر الرئيسي:</p>
                            <p className="text-white text-[10px]">{address}</p>
                          </div>
                          <div className="text-center sm:text-left shrink-0">
                            <p className="text-white font-bold">📞 {phone}</p>
                            <p className="text-emerald-400 font-bold">🟢 واتساب: {whatsapp}</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 3. Detailed Service Brochure Card */}
                {selectedStyle === "brochure" && (
                  <div className="border border-stone-300 bg-white p-6 sm:p-8 rounded-xl shadow-md text-right relative overflow-hidden">
                    
                    {adOrientation === "horizontal" ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start relative z-10">
                        {/* Right column: Title & Features */}
                        <div className="md:col-span-6 space-y-3">
                          <div className="border-b border-stone-200 pb-2 text-center">
                            <h2 className="text-base font-bold text-slate-900">{platformName}</h2>
                            <p className="text-[9px] text-stone-500">مطوية الخدمات العدلية في اليمن</p>
                          </div>

                          <div className="space-y-3 text-[11px] text-stone-700">
                            <div>
                              <h4 className="font-extrabold text-slate-950 border-r-2 border-amber-500 pr-1.5 mb-0.5">📝 صياغة فورية</h4>
                              <p className="text-stone-600 text-[10px] leading-relaxed">عقود، لوائح، وتوكيلات معبأة قضائياً وتصدير وورد.</p>
                            </div>

                            <div>
                              <h4 className="font-extrabold text-slate-950 border-r-2 border-amber-500 pr-1.5 mb-0.5">⚖️ مستشار آلي ذكي</h4>
                              <p className="text-stone-600 text-[10px] leading-relaxed">توجيه شرعي وقانوني مستند للقضاء اليمني.</p>
                            </div>
                          </div>
                        </div>

                        {/* Left column: Offer & Contacts */}
                        <div className="md:col-span-6 space-y-3 md:border-r md:border-stone-150 md:pr-4">
                          {/* Offer and Contact */}
                          <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center">
                            <p className="text-[9px] font-bold text-stone-800 leading-normal">{callToAction}</p>
                          </div>

                          <div className="border-t border-stone-200 pt-2 text-[10px] text-stone-500 text-right space-y-2">
                            <div>
                              <p className="font-bold text-slate-900">👨‍💼 المشرف المسؤول:</p>
                              <p className="text-[10px]">{attorneyName}</p>
                              <p className="text-[9px] mt-0.5">📍 {address}</p>
                            </div>
                            <div className="font-mono bg-stone-100 p-2 rounded-lg border border-stone-150 text-center">
                              <p className="font-bold text-slate-900 text-[11px]">📞 {phone}</p>
                              <p className="text-emerald-700 font-bold text-[11px]">💬 واتساب: {whatsapp}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-center border-b border-stone-200 pb-3 mb-4">
                          <h2 className="text-lg font-bold text-slate-900">{platformName}</h2>
                          <p className="text-[11px] text-stone-500 mt-1">مطوية الخدمات العدلية والشرعية المتكاملة في اليمن</p>
                        </div>

                        <div className="space-y-4 mb-5 text-xs text-stone-700">
                          <div>
                            <h4 className="font-extrabold text-slate-950 border-r-2 border-amber-500 pr-1.5 mb-1 text-[11px]">📝 صياغة مستندات فورية</h4>
                            <p className="text-stone-600 leading-relaxed">الوصول السريع لـ 654 وثيقة رسمية (لوائح، عقود، تظلمات، توكيلات) معبأة بالبيانات القضائية تلقائياً وتصديرها بصيغة وورد لتعديلها ومراجعتها.</p>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-slate-950 border-r-2 border-amber-500 pr-1.5 mb-1 text-[11px]">⚖️ مستشار قانوني ذكي</h4>
                            <p className="text-stone-600 leading-relaxed">محرك استشاري ذكي يمنحك التوجيه الشرعي والمدني الصحيح مستنداً إلى قانون الإثبات والمرافعات وأحكام القضاء اليمني.</p>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-slate-950 border-r-2 border-amber-500 pr-1.5 mb-1 text-[11px]">⏱️ جدول جلسات وتقاويم ذكية</h4>
                            <p className="text-stone-600 leading-relaxed">تنظيم الجلسات وحساب التواريخ بالهجري والميلادي فوراً، لمنع تفويت أي مواعيد أو التزامات قضائية.</p>
                          </div>
                        </div>

                        {/* Offer and Contact */}
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center mb-4">
                          <p className="text-[10px] font-bold text-stone-800 leading-relaxed">{callToAction}</p>
                        </div>

                        <div className="border-t border-stone-200 pt-3 text-[10px] text-stone-500 grid grid-cols-2 gap-2 text-right">
                          <div>
                            <p className="font-bold text-slate-900">👨‍💼 المشرف المسؤول:</p>
                            <p className="text-[11px]">{attorneyName}</p>
                            <p className="mt-1">📍 {address}</p>
                          </div>
                          <div className="text-left font-mono">
                            <p className="font-bold text-slate-900">📞 {phone}</p>
                            <p className="text-emerald-700 font-bold">🟢 واتساب: {whatsapp}</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>

            {/* Print Slogan advice */}
            <p className="text-[10px] text-stone-400 font-semibold text-center mt-3 animate-pulse">
              * نصيحة: يمكنك النقر فوق "طباعة الإعلان" لتوليد نسخة عالية الدقة مهيأة للطابعات وتوزيعها بالمنطقة.
            </p>

          </div>
        </div>

      </div>

      {/* Copywriting Templates Panel (Ready-to-use Ad copy) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-amber-500" />
            <h3 className="font-extrabold text-sm md:text-base text-slate-900">📝 الصيغ والنصوص الإعلانية الجاهزة للنشر والنسخ</h3>
          </div>
          
          {/* Ad Tab Selectors */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveAdTab("whatsapp")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAdTab === "whatsapp"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              مجموعة واتساب / تلجرام
            </button>
            <button
              onClick={() => setActiveAdTab("facebook")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAdTab === "facebook"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              فيسبوك / لينكد إن
            </button>
            <button
              onClick={() => setActiveAdTab("google")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAdTab === "google"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              إعلان جوجل الممول
            </button>
            <button
              onClick={() => setActiveAdTab("sms")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAdTab === "sms"
                  ? "bg-stone-800 text-white shadow-sm"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              رسالة نصية SMS قصيرة
            </button>
          </div>
        </div>

        {/* Text Preview and Copy Area */}
        <div className="space-y-4">
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 relative">
            
            {/* Overlay Indicator */}
            <span className="absolute top-3 left-3 bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-[9px] font-mono font-bold select-none">
              صيغة {activeAdTab === "whatsapp" ? "الشبكات الإجتماعية" : activeAdTab === "sms" ? "SMS" : activeAdTab === "google" ? "محرك بحث جوجل" : "المنشور المهني"}
            </span>

            {/* Displaying Google Mockup specifically to look breathtakingly realistic */}
            {activeAdTab === "google" ? (
              <div className="font-sans max-w-lg bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-right space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span>إعلان</span>
                  <span>•</span>
                  <span className="text-stone-500 font-mono">https://example.com/legal</span>
                </div>
                <h4 className="text-blue-800 hover:underline font-medium text-base sm:text-lg">
                  {platformName} | مكتب {attorneyName} للخدمات القانونية باليمن
                </h4>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  المنصة الرقمية الأولى باليمن لصياغة وتدقيق 654 نموذجاً شرعياً وجنائياً، نظام تتبع الجلسات المزدوج والمستشار الذكي المعتمد. اتصل الآن: {phone} - العنوان: {address}.
                </p>
                <div className="pt-2 flex gap-3 text-blue-750 text-xs">
                  <span className="hover:underline">صياغة مستندات</span>
                  <span className="hover:underline">طلب استشارة مجانية</span>
                  <span className="hover:underline">تتبع جلسات المحاكم</span>
                </div>
              </div>
            ) : (
              <pre className="text-xs sm:text-sm text-stone-850 font-sans leading-relaxed whitespace-pre-wrap text-right font-medium select-text">
                {getAdCopyText(activeAdTab)}
              </pre>
            )}

          </div>

          {/* Copy action footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
            <span className="text-[10px] text-amber-800 font-bold">
              💡 يمكنك تعديل تفاصيل وجهات الاتصال أو العروض في النموذج بالأعلى لتنعكس تلقائياً في النص هنا.
            </span>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCopyText}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm border border-amber-500 cursor-pointer"
              >
                {copiedAdCopy ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">تم نسخ النص!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>نسخ النص وتجهيز النشر</span>
                  </>
                )}
              </button>
              
              {activeAdTab === "whatsapp" && (
                <button
                  onClick={shareOnWhatsapp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>مشاركة فورية للواتساب</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </>)}

    </div>
  );
}
