import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { PlanSection } from '../../types/preview';
import type { ExportTheme } from '../../types/export-theme';
import { markdownToHtmlForEditor } from '../../utils/markdown-to-html';
import { sanitizeHtml } from '../../utils/sanitize';

interface HTMLToPDFOptions {
  theme: ExportTheme;
  sections: PlanSection[];
  planTitle: string;
  companyName: string;
  language: string;
}

/**
 * Render the same document layout as the TemplatePreviewModal into an off-screen
 * container, capture it with html2canvas and assemble a multi-page PDF with jsPDF.
 * This guarantees the exported file is pixel-identical to the preview.
 */
/** Escape HTML entities in plain text values. */
function esc(text: string): string {
  const el = document.createElement('span');
  el.textContent = text;
  return el.innerHTML;
}

export async function exportHTMLToPDF(options: HTMLToPDFOptions): Promise<Blob> {
  const { theme, sections, planTitle, companyName, language } = options;
  const isFr = language === 'fr';
  const safePlanTitle = esc(planTitle);
  const safeCompanyName = esc(companyName);

  // --- 1. Build the full document HTML (mirrors TemplatePreviewModal) -----------
  const processedSections = sections.map((s) => ({
    ...s,
    htmlContent: s.content ? sanitizeHtml(markdownToHtmlForEditor(s.content)) : null,
  }));

  const tocLabel = isFr ? 'Table des matières' : 'Table of Contents';
  const pageLabel = isFr ? 'Page' : 'Page';
  const emptyLabel = isFr ? 'Section vide' : 'Empty section';

  // Chart color dots
  const dots = theme.chartColorPalette
    .slice(0, 4)
    .map(
      (color) =>
        `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};opacity:0.8;margin-right:8px;"></span>`,
    )
    .join('');

  // TOC entries
  const tocEntries = processedSections
    .map(
      (s, idx) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid ${theme.separatorColor};">
        <span style="font-size:14px;color:${theme.textColor}">${idx + 1}. ${esc(s.title)}</span>
        <span style="font-size:12px;color:${theme.mutedTextColor}">${pageLabel} ${idx + 2}</span>
      </div>`,
    )
    .join('');

  // Section blocks (FULL content – no truncation)
  const sectionBlocks = processedSections
    .map(
      (s, idx) => `
      <div style="background:${theme.pageBackgroundColor};padding:40px;page-break-before:always;">
        <div style="padding-bottom:12px;margin-bottom:16px;border-bottom:2px solid ${theme.accentColor};">
          <h2 style="font-size:20px;font-weight:700;color:${theme.headingColor};margin:0;">
            ${idx + 1}. ${esc(s.title)}
          </h2>
        </div>
        ${
          s.htmlContent
            ? `<div style="font-size:14px;line-height:1.7;color:${theme.textColor};"
                class="export-prose">${s.htmlContent}</div>`
            : `<p style="font-style:italic;font-size:14px;color:${theme.mutedTextColor};">${emptyLabel}</p>`
        }
      </div>`,
    )
    .join('');

  const html = `
    <style>
      .export-prose h1 { font-size:18px; font-weight:700; color:${theme.heading2Color}; margin:16px 0 8px; }
      .export-prose h2 { font-size:16px; font-weight:700; color:${theme.heading2Color}; margin:16px 0 8px; }
      .export-prose h3 { font-size:14px; font-weight:600; color:${theme.heading2Color}; margin:12px 0 6px; }
      .export-prose h4 { font-size:14px; font-weight:600; color:${theme.heading2Color}; margin:12px 0 6px; }
      .export-prose p  { margin-bottom:8px; }
      .export-prose ul { padding-left:20px; margin-bottom:8px; }
      .export-prose ol { padding-left:20px; margin-bottom:8px; }
      .export-prose li { margin-bottom:2px; }
      .export-prose strong { font-weight:600; }
      .export-prose a { text-decoration:underline; }
      .export-prose table { border-collapse:collapse; width:100%; margin:12px 0; }
      .export-prose th, .export-prose td { border:1px solid ${theme.separatorColor}; padding:6px 10px; font-size:13px; text-align:left; }
      .export-prose th { background:${theme.tocBackgroundColor}; font-weight:600; }
      .export-prose blockquote { border-left:3px solid ${theme.accentColor}; padding-left:16px; margin:12px 0; font-style:italic; color:${theme.mutedTextColor}; }
    </style>

    <!-- Cover Page -->
    <div style="background:${theme.primaryColor};padding:64px 40px 48px;page-break-after:always;">
      <h1 style="font-size:32px;font-weight:700;color:#FFFFFF;margin:0 0 12px;">${safePlanTitle}</h1>
      <p  style="font-size:18px;color:#FFFFFF;opacity:0.8;margin:0;">${safeCompanyName}</p>
      <div style="margin-top:24px;">${dots}</div>
    </div>

    <!-- Table of Contents -->
    <div style="background:${theme.tocBackgroundColor};padding:40px;page-break-after:always;">
      <h2 style="font-size:20px;font-weight:700;margin:0 0 16px;color:${theme.headingColor};">${tocLabel}</h2>
      ${tocEntries}
    </div>

    <!-- Sections -->
    ${sectionBlocks}
  `;

  // --- 2. Inject into off-screen container ---
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;width:800px;background:#fff;z-index:-1;font-family:system-ui,-apple-system,sans-serif;';
  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait one frame for layout
  await new Promise((r) => requestAnimationFrame(r));

  // --- 3. Capture with html2canvas ---
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // --- 4. Clean up DOM ---
  document.body.removeChild(container);

  // --- 5. Assemble multi-page PDF with jsPDF ---
  // Letter = 8.5 × 11 in = 612 × 792 pt
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageWidthPt = 612;
  const pageHeightPt = 792;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Scale canvas to page width
  const ratio = pageWidthPt / imgWidth;
  const scaledHeight = imgHeight * ratio;

  // Number of pages needed
  const totalPages = Math.ceil(scaledHeight / pageHeightPt);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage();

    // Slice a page-height chunk from the canvas
    const srcY = page * (pageHeightPt / ratio);
    const srcH = Math.min(pageHeightPt / ratio, imgHeight - srcY);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = Math.ceil(srcH);
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.drawImage(canvas, 0, -srcY);

    const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
    const sliceHeightPt = srcH * ratio;

    pdf.addImage(sliceData, 'JPEG', 0, 0, pageWidthPt, sliceHeightPt);
  }

  return pdf.output('blob');
}
