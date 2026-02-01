import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { BusinessPlanPDF } from './export/pdf-document';
import { generateWordDocument } from './export/word-document';
import { PlanSection } from '../types/preview';
import { CoverPageSettings } from '../types/cover-page';
import React from 'react';

export type ExportFormat = 'pdf' | 'word';

export interface ExportData {
  coverSettings: CoverPageSettings;
  sections: PlanSection[];
  companyName: string;
}

/**
 * Export Service
 * Handles client-side export to PDF and Word formats
 */
export const exportService = {
  /**
   * Export business plan to PDF
   */
  async exportToPDF(data: ExportData): Promise<void> {
    const { coverSettings, sections, companyName } = data;

    // Create PDF document element
    const doc = React.createElement(BusinessPlanPDF, {
      coverSettings,
      sections,
      companyName,
    });

    // Generate PDF blob
    const blob = await pdf(doc).toBlob();

    // Generate filename
    const sanitizedName = companyName.replace(/[^a-zA-Z0-9]/g, '-');
    const fileName = `${sanitizedName}-Business-Plan.pdf`;

    // Trigger download
    saveAs(blob, fileName);
  },

  /**
   * Export business plan to Word
   */
  async exportToWord(data: ExportData): Promise<void> {
    const { coverSettings, sections } = data;

    // Generate and download Word document
    await generateWordDocument(coverSettings, sections);
  },

  /**
   * Export business plan in specified format
   */
  async export(format: ExportFormat, data: ExportData): Promise<void> {
    switch (format) {
      case 'pdf':
        await this.exportToPDF(data);
        break;
      case 'word':
        await this.exportToWord(data);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  },
};

export default exportService;
