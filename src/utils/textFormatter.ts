/**
 * Utility to format Arabic law or AI consultation responses,
 * converting markdown-like styles to elegant, clean HTML without raw asterisks (*) or hash symbols (#).
 */
export function formatCleanArabicText(text: string): string {
  if (!text) return "";
  
  // Normalize line endings
  let formatted = text.replace(/\r\n/g, "\n");
  
  // 1. Convert headers first
  formatted = formatted.replace(/^###\s*(.*?)$/gm, '<h4 class="font-extrabold text-slate-900 text-xs sm:text-sm mt-3 mb-1 border-r-4 border-amber-500 pr-2">$1</h4>');
  formatted = formatted.replace(/^##\s*(.*?)$/gm, '<h3 class="font-extrabold text-slate-900 text-sm sm:text-base mt-4 mb-2 border-r-4 border-amber-500 pr-2">$1</h3>');
  formatted = formatted.replace(/^#\s*(.*?)$/gm, '<h2 class="font-extrabold text-slate-900 text-base sm:text-lg mt-5 mb-2 border-r-4 border-amber-500 pr-2">$1</h2>');

  // 2. Convert Bold syntax (**text**) with safe styled spans
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-950 font-bold">$1</strong>');
  
  // 3. Convert Italic syntax (*text*) with safe italic spans
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-amber-700 italic">$1</em>');

  // 4. Convert lists starting with '*' or '-' to beautiful structured bullets
  formatted = formatted.replace(/^\s*[\*\-]\s*(.*?)$/gm, '<div class="flex items-start gap-1.5 my-1.5 mr-2"><span class="text-amber-500 shrink-0 select-none text-xs">•</span><span class="text-stone-800">$1</span></div>');

  // 5. Clean up any remaining isolated markdown artifacts like stray *, #, or ` so the text is fully immaculate
  formatted = formatted.replace(/[*#`]/g, "");

  // 6. Split into lines and wrap plain lines in div elements to preserve paragraphs without raw newlines overflowing
  const lines = formatted.split("\n");
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("<div") || trimmed.startsWith("<h") || trimmed === "") {
      return line;
    }
    return `<div class="min-h-[1.5rem]">${line}</div>`;
  });
  
  return processedLines.join("\n");
}
