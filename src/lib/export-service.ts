import { saveAs } from 'file-saver';
import { generateWordDocument } from './export/word-document';
import { PlanSection } from '../types/preview';
import { CoverPageSettings } from '../types/cover-page';
import type { ExportTheme } from '../types/export-theme';
import { apiClient } from './api-client';

export type ExportFormat = 'pdf' | 'word' | 'powerpoint';

export interface ExportData {
  coverSettings: CoverPageSettings;
  sections: PlanSection[];
  companyName: string;
  language?: string;
  /** Plan title shown on the cover page. Falls back to companyName. */
  planTitle?: string;
  /** Selected visual theme colors applied to the exported document. */
  exportTheme?: ExportTheme;
  /** Business plan ID — when provided, PDF uses server-side Puppeteer for selectable text. */
  planId?: string;
}

/**
 * Build a consistent export filename.
 * FR: {CompanyName}_Plan_d_affaires_{date}.{ext}
 * EN: {CompanyName}_BusinessPlan_{date}.{ext}
 */
export function buildExportFileName(
  companyName: string,
  ext: 'pdf' | 'docx' | 'pptx',
  language?: string,
): string {
  const sanitized = companyName.replace(/[^a-zA-Z0-9À-ÿ]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const dateStr = new Date().toISOString().slice(0, 10);
  const label = language === 'fr' ? 'Plan_d_affaires' : 'BusinessPlan';
  return `${sanitized}_${label}_${dateStr}.${ext}`;
}

/**
 * Export Service
 * Handles server-side export to PDF, Word, and PowerPoint formats.
 * Client-side fallbacks (html2canvas, @react-pdf) are lazy-loaded only when needed.
 */
export const exportService = {
  /**
   * Export business plan to PDF.
   *
   * Priority (all backend paths produce real PDFs with selectable text):
   * 1. Backend Puppeteer (planId + theme) — themed, selectable text, proper page breaks
   * 2. Backend QuestPDF (planId) — selectable text, professional formatting (no theme)
   * 3. Client-side html2canvas (no planId) — image-based fallback (last resort, lazy-loaded)
   */
  async exportToPDF(data: ExportData): Promise<void> {
    const { coverSettings, sections, companyName, exportTheme, language, planId } = data;
    const lang = language || 'en';
    const fileName = buildExportFileName(companyName, 'pdf', language);

    // Tier 1: Backend Puppeteer — themed PDF with selectable text
    if (exportTheme && planId) {
      try {
        const response = await apiClient.get(
          `/api/v1/business-plans/${planId}/export/themed-pdf`,
          { language: lang, themeId: exportTheme.id },
          { responseType: 'blob' },
        );
        saveAs(response.data as Blob, fileName);
        return;
      } catch {
        // Puppeteer unavailable — fall through to QuestPDF
      }
    }

    // Tier 2: Backend QuestPDF — real PDF with selectable text (no theme styling)
    if (planId) {
      try {
        const response = await apiClient.get(
          `/api/v1/business-plans/${planId}/export/pdf`,
          { language: lang },
          { responseType: 'blob' },
        );
        saveAs(response.data as Blob, fileName);
        return;
      } catch {
        // Backend PDF unavailable — fall through to client-side
      }
    }

    // Tier 3: Client-side fallback (lazy-loaded — only when no planId or all backends fail)
    let blob: Blob;
    if (exportTheme) {
      const { exportHTMLToPDF } = await import('./export/html-to-pdf');
      blob = await exportHTMLToPDF({
        theme: exportTheme,
        sections,
        planTitle: data.planTitle || coverSettings.documentTitle || companyName,
        companyName,
        language: lang,
      });
    } else {
      const [{ pdf }, { BusinessPlanPDF }, React] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./export/pdf-document'),
        import('react'),
      ]);
      const doc = React.createElement(BusinessPlanPDF, {
        coverSettings,
        sections,
        companyName,
        exportTheme,
      });
      blob = await pdf(doc as any).toBlob();
    }

    saveAs(blob, fileName);
  },

  /**
   * Export business plan to Word
   */
  async exportToWord(data: ExportData): Promise<void> {
    const { coverSettings, sections, language, exportTheme } = data;

    // Generate and download Word document
    await generateWordDocument(coverSettings, sections, language, exportTheme);
  },

  /**
   * Export business plan to PowerPoint (server-side slide deck).
   * Requires planId. Uses AI to generate condensed slide content.
   */
  async exportToPowerPoint(data: ExportData): Promise<void> {
    const { companyName, language, exportTheme, planId } = data;

    if (!planId) {
      throw new Error('PowerPoint export requires a saved business plan (planId)');
    }

    const response = await apiClient.get(
      `/api/v1/business-plans/${planId}/export/powerpoint`,
      { language: language || 'en', themeId: exportTheme?.id },
      { responseType: 'blob' },
    );

    const fileName = buildExportFileName(companyName, 'pptx', language);
    saveAs(response.data as Blob, fileName);
  },

  /**
   * Export business plan in specified format (client-side or server-side)
   */
  async export(format: ExportFormat, data: ExportData): Promise<void> {
    switch (format) {
      case 'pdf':
        await this.exportToPDF(data);
        break;
      case 'word':
        await this.exportToWord(data);
        break;
      case 'powerpoint':
        await this.exportToPowerPoint(data);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  },

  /**
   * Export via backend with theme applied.
   * Uses the pdf-with-visuals endpoint for PDF, or the word/powerpoint GET endpoints.
   */
  async backendExport(
    planId: string,
    format: ExportFormat,
    language: string,
    templateId?: string,
    coverSettings?: CoverPageSettings,
  ): Promise<void> {
    if (format === 'pdf') {
      const response = await apiClient.post(
        `/api/v1/business-plans/${planId}/export/pdf-with-visuals`,
        {
          format: 'pdf',
          language,
          includeVisuals: true,
          includeTableOfContents: true,
          includePageNumbers: true,
          includeHeaderFooter: true,
          templateId: templateId || undefined,
          coverPageSettings: coverSettings
            ? {
                companyName: coverSettings.companyName,
                documentTitle: coverSettings.documentTitle,
                subtitle: coverSettings.tagline,
                primaryColor: coverSettings.primaryColor,
                preparedBy: coverSettings.preparedBy,
              }
            : undefined,
        },
        { responseType: 'blob' },
      );

      const companyName = coverSettings?.companyName || 'Export';
      const fileName = buildExportFileName(companyName, 'pdf', language);
      saveAs(response.data as Blob, fileName);
    } else if (format === 'powerpoint') {
      // PowerPoint export via GET endpoint
      const response = await apiClient.get(
        `/api/v1/business-plans/${planId}/export/powerpoint`,
        { language, themeId: templateId },
        { responseType: 'blob' },
      );

      const companyName = coverSettings?.companyName || 'Export';
      const fileName = buildExportFileName(companyName, 'pptx', language);
      saveAs(response.data as Blob, fileName);
    } else {
      // Word export via GET endpoint
      const response = await apiClient.get(
        `/api/v1/business-plans/${planId}/export/word`,
        { language },
        { responseType: 'blob' },
      );

      const companyName = coverSettings?.companyName || 'Export';
      const fileName = buildExportFileName(companyName, 'docx', language);
      saveAs(response.data as Blob, fileName);
    }
  },
};

export default exportService;
