import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  BorderStyle,
  Packer,
  LevelFormat,
  convertInchesToTwip,
  TabStopPosition,
  TabStopType,
  LeaderType,
  ExternalHyperlink,
  UnderlineType,
  ShadingType,
  IParagraphOptions,
} from 'docx';
import { saveAs } from 'file-saver';
import { PlanSection } from '../../types/preview';
import { CoverPageSettings } from '../../types/cover-page';
import type { ExportTheme } from '../../types/export-theme';
import { parseHTMLToElements, cleanParsedElements, type ParsedElement, type InlineRun } from './html-parser';
import { groupSectionsByCategory } from '../../components/table-of-contents/utils';
import { buildExportFileName } from '../export-service';
import { markdownToHtmlForEditor } from '../../utils/markdown-to-html';
import { sanitizeHtml } from '../../utils/sanitize';

/** Strip '#' from hex color for docx library (expects 6-char hex without prefix). */
function hexColor(color: string): string {
  return color.replace('#', '');
}

/** Resolved theme colors used throughout the document. */
interface DocColors {
  primary: string;
  accent: string;
  heading: string;
  heading2: string;
  text: string;
  muted: string;
  separator: string;
  tocBg: string;
}

function resolveColors(theme?: ExportTheme): DocColors {
  return {
    primary: hexColor(theme?.primaryColor || '#2563EB'),
    accent: hexColor(theme?.accentColor || '#2563EB'),
    heading: hexColor(theme?.headingColor || '#1F2937'),
    heading2: hexColor(theme?.heading2Color || '#2563EB'),
    text: hexColor(theme?.textColor || '#374151'),
    muted: hexColor(theme?.mutedTextColor || '#6B7280'),
    separator: hexColor(theme?.separatorColor || '#E5E7EB'),
    tocBg: hexColor(theme?.tocBackgroundColor || '#F9FAFB'),
  };
}

// ---------------------------------------------------------------------------
// Inline runs → docx children
// ---------------------------------------------------------------------------

type ParagraphChild = TextRun | ExternalHyperlink;

/**
 * Convert InlineRun[] to docx Paragraph children (TextRun / ExternalHyperlink).
 */
function inlineRunsToChildren(
  runs: InlineRun[],
  c: DocColors,
  baseFontSize = 22,
): ParagraphChild[] {
  const children: ParagraphChild[] = [];

  for (const run of runs) {
    const textRunOpts = {
      text: run.text,
      size: baseFontSize,
      bold: run.bold || false,
      italics: run.italic || false,
      underline: run.underline ? { type: UnderlineType.SINGLE } : undefined,
      strike: run.strikethrough || false,
      color: run.link ? c.accent : c.text,
      font: run.code ? 'Consolas' : undefined,
    };

    if (run.link) {
      children.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              ...textRunOpts,
              underline: { type: UnderlineType.SINGLE },
              style: 'Hyperlink',
            }),
          ],
          link: run.link,
        }),
      );
    } else {
      children.push(new TextRun(textRunOpts));
    }
  }

  return children;
}

/**
 * Shortcut: if no rich runs exist, create a plain TextRun from content string.
 */
function textChildren(
  element: ParsedElement,
  c: DocColors,
  baseFontSize = 22,
  overrideColor?: string,
): ParagraphChild[] {
  if (element.runs && element.runs.length > 0) {
    // Override color at the run level if needed
    if (overrideColor) {
      return inlineRunsToChildren(
        element.runs,
        { ...c, text: overrideColor },
        baseFontSize,
      );
    }
    return inlineRunsToChildren(element.runs, c, baseFontSize);
  }
  return [
    new TextRun({
      text: element.content || '',
      size: baseFontSize,
      color: overrideColor || c.text,
    }),
  ];
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

export async function generateWordDocument(
  coverSettings: CoverPageSettings,
  sections: PlanSection[],
  language?: string,
  exportTheme?: ExportTheme,
): Promise<void> {
  const companyName = coverSettings.companyName || 'Company';
  const c = resolveColors(exportTheme);
  const isFr = language === 'fr';

  const doc = new Document({
    title: `${companyName} - ${isFr ? 'Plan d\'affaires' : 'Business Plan'}`,
    description: isFr ? 'Plan d\'affaires' : 'Business Plan',
    creator: 'Sqordia',
    numbering: {
      config: [
        {
          reference: 'bullet-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
        {
          reference: 'numbered-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    },
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: { font: 'Calibri', size: 56, bold: true, color: c.heading },
          paragraph: { spacing: { before: 480, after: 240 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: { font: 'Calibri', size: 36, bold: true, color: c.heading2 },
          paragraph: { spacing: { before: 360, after: 200 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          run: { font: 'Calibri', size: 28, bold: true, color: c.text },
          paragraph: { spacing: { before: 280, after: 160 } },
        },
      ],
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
          paragraph: { spacing: { after: 200, line: 360 } },
        },
      },
    },
    sections: [
      // Cover Page
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 } },
        },
        children: createCoverPage(coverSettings, c, isFr),
      },
      // Table of Contents
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 } },
        },
        headers: { default: createHeader(companyName, c) },
        footers: { default: createFooter(companyName, isFr, c) },
        children: createTableOfContents(sections, isFr, c),
      },
      // Content Sections
      ...sections.map((section, index) => ({
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 } },
        },
        headers: { default: createHeader(companyName, c) },
        footers: { default: createFooter(companyName, isFr, c) },
        children: createSectionContent(section, index + 1, c),
      })),
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = buildExportFileName(companyName, 'docx', language);
  saveAs(blob, fileName);
}

// ---------------------------------------------------------------------------
// Cover Page
// ---------------------------------------------------------------------------

function createCoverPage(settings: CoverPageSettings, c: DocColors, isFr: boolean): Paragraph[] {
  const elements: Paragraph[] = [];
  const locale = isFr ? 'fr-CA' : 'en-US';

  elements.push(new Paragraph({ spacing: { before: 1200 } }));

  // Company name
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 400 },
      children: [
        new TextRun({ text: settings.companyName || 'Company Name', size: 72, bold: true, color: c.heading }),
      ],
    }),
  );

  // Document title
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: settings.documentTitle || (isFr ? 'Plan d\'affaires' : 'Business Plan'),
          size: 48,
          color: c.muted,
        }),
      ],
    }),
  );

  // Accent color bar
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 400 },
      border: {
        bottom: { color: c.accent, size: 24, style: BorderStyle.SINGLE },
      },
    }),
  );

  // Prepared date
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    try {
      return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const preparedLabel = isFr ? 'Pr\u00e9par\u00e9 le\u00a0:' : 'Prepared:';
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 1200 },
      children: [
        new TextRun({ text: `${preparedLabel} ${formatDate(settings.preparedDate)}`, size: 24, color: c.muted }),
      ],
    }),
  );

  // Contact information
  if (settings.contactName || settings.contactEmail || settings.contactPhone) {
    elements.push(
      new Paragraph({
        spacing: { before: 1200 },
        children: [
          new TextRun({
            text: isFr ? 'COORDONN\u00c9ES' : 'CONTACT INFORMATION',
            size: 22,
            bold: true,
            color: c.heading,
          }),
        ],
      }),
    );

    if (settings.contactName) {
      const nameRuns: TextRun[] = [
        new TextRun({ text: settings.contactName, size: 22, color: c.text }),
      ];
      if (settings.contactTitle) {
        nameRuns.push(new TextRun({ text: `, ${settings.contactTitle}`, size: 22, color: c.text }));
      }
      elements.push(new Paragraph({ spacing: { after: 100 }, children: nameRuns }));
    }

    if (settings.contactEmail) {
      elements.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: settings.contactEmail, size: 22, color: c.accent })],
        }),
      );
    }

    if (settings.contactPhone) {
      elements.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: settings.contactPhone, size: 22, color: c.text })],
        }),
      );
    }

    if (settings.website) {
      elements.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: settings.website,
                  size: 22,
                  color: c.accent,
                  underline: { type: UnderlineType.SINGLE },
                  style: 'Hyperlink',
                }),
              ],
              link: settings.website.startsWith('http') ? settings.website : `https://${settings.website}`,
            }),
          ],
        }),
      );
    }
  }

  // Address
  if (settings.addressLine1 || settings.city) {
    elements.push(new Paragraph({ spacing: { before: 400 } }));

    if (settings.addressLine1) {
      elements.push(
        new Paragraph({ children: [new TextRun({ text: settings.addressLine1, size: 22, color: c.text })] }),
      );
    }
    if (settings.addressLine2) {
      elements.push(
        new Paragraph({ children: [new TextRun({ text: settings.addressLine2, size: 22, color: c.text })] }),
      );
    }
    if (settings.city || settings.stateProvince || settings.postalCode) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: [settings.city, settings.stateProvince, settings.postalCode].filter(Boolean).join(', '),
              size: 22,
              color: c.text,
            }),
          ],
        }),
      );
    }
    if (settings.country) {
      elements.push(
        new Paragraph({ children: [new TextRun({ text: settings.country, size: 22, color: c.text })] }),
      );
    }
  }

  return elements;
}

// ---------------------------------------------------------------------------
// Table of Contents
// ---------------------------------------------------------------------------

function createTableOfContents(sections: PlanSection[], isFr: boolean, c: DocColors): Paragraph[] {
  const elements: Paragraph[] = [];
  const groupedSections = groupSectionsByCategory(sections);

  elements.push(
    new Paragraph({
      spacing: { before: 200, after: 400 },
      children: [
        new TextRun({
          text: isFr ? 'Table des mati\u00e8res' : 'Table of Contents',
          size: 56,
          bold: true,
          color: c.heading,
        }),
      ],
    }),
  );

  let pageNumber = 3;

  groupedSections.forEach((group) => {
    elements.push(
      new Paragraph({
        spacing: { before: 300, after: 150 },
        border: {
          bottom: { color: c.separator, size: 1, style: BorderStyle.SINGLE },
        },
        children: [
          new TextRun({ text: group.category, size: 28, bold: true, color: c.heading }),
        ],
      }),
    );

    group.sections.forEach((section) => {
      elements.push(
        new Paragraph({
          tabStops: [
            { type: TabStopType.RIGHT, position: TabStopPosition.MAX, leader: LeaderType.DOT },
          ],
          indent: { left: 360 },
          spacing: { after: 100 },
          children: [
            new TextRun({ text: section.title, size: 22, color: c.text }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: String(pageNumber), size: 22, color: c.muted }),
          ],
        }),
      );
      pageNumber += 2;
    });
  });

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  return elements;
}

// ---------------------------------------------------------------------------
// Section Content
// ---------------------------------------------------------------------------

function createSectionContent(
  section: PlanSection,
  sectionNumber: number,
  c: DocColors,
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Section number
  elements.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `${String(sectionNumber).padStart(2, '0')}.`,
          size: 96,
          bold: true,
          color: c.accent,
        }),
      ],
    }),
  );

  // Section title with accent underline
  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      border: {
        bottom: { color: c.accent, size: 6, style: BorderStyle.SINGLE },
      },
      children: [
        new TextRun({ text: section.title, size: 56, bold: true, color: c.heading }),
      ],
    }),
  );

  elements.push(new Paragraph({ spacing: { after: 200 } }));

  // Parse and add content
  if (section.content) {
    // Convert markdown to HTML, then sanitize (mirrors the html-to-pdf pipeline)
    const html = sanitizeHtml(markdownToHtmlForEditor(section.content));
    const parsedElements = cleanParsedElements(parseHTMLToElements(html));
    parsedElements.forEach((el) => {
      elements.push(...convertElementToDocx(el, c));
    });
  } else {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'This section has not been generated yet.',
            size: 22,
            color: c.muted,
            italics: true,
          }),
        ],
      }),
    );
  }

  return elements;
}

// ---------------------------------------------------------------------------
// Element → docx conversion (with rich formatting)
// ---------------------------------------------------------------------------

function convertElementToDocx(element: ParsedElement, c: DocColors): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [];

  switch (element.type) {
    case 'heading1':
      result.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 200 },
          children: textChildren(element, c, 36, c.heading2),
        } as IParagraphOptions),
      );
      break;

    case 'heading2':
      result.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 160 },
          children: textChildren(element, c, 28, c.text),
        } as IParagraphOptions),
      );
      break;

    case 'heading3':
      result.push(
        new Paragraph({
          spacing: { before: 200, after: 120 },
          children: textChildren(element, c, 24, c.text),
        } as IParagraphOptions),
      );
      break;

    case 'paragraph':
      result.push(
        new Paragraph({
          spacing: { after: 200 },
          children: textChildren(element, c),
        } as IParagraphOptions),
      );
      break;

    case 'bulletList': {
      const items = element.richItems || [];
      const fallbackItems = element.items || [];
      const count = Math.max(items.length, fallbackItems.length);
      for (let i = 0; i < count; i++) {
        const children = items[i]
          ? inlineRunsToChildren(items[i], c)
          : [new TextRun({ text: fallbackItems[i] || '', size: 22, color: c.text })];
        result.push(
          new Paragraph({
            numbering: { reference: 'bullet-list', level: 0 },
            spacing: { after: 100 },
            children,
          } as IParagraphOptions),
        );
      }
      break;
    }

    case 'numberedList': {
      const items = element.richItems || [];
      const fallbackItems = element.items || [];
      const count = Math.max(items.length, fallbackItems.length);
      for (let i = 0; i < count; i++) {
        const children = items[i]
          ? inlineRunsToChildren(items[i], c)
          : [new TextRun({ text: fallbackItems[i] || '', size: 22, color: c.text })];
        result.push(
          new Paragraph({
            numbering: { reference: 'numbered-list', level: 0 },
            spacing: { after: 100 },
            children,
          } as IParagraphOptions),
        );
      }
      break;
    }

    case 'table':
      if (element.rows && element.rows.length > 0) {
        result.push(createWordTable(element.rows, c));
      }
      break;

    case 'blockquote':
      result.push(
        new Paragraph({
          indent: { left: 720 },
          border: {
            left: { color: c.accent, size: 24, style: BorderStyle.SINGLE },
          },
          spacing: { before: 200, after: 200 },
          children: textChildren(element, c, 22, c.muted),
        } as IParagraphOptions),
      );
      break;

    default:
      if (element.content) {
        result.push(
          new Paragraph({
            spacing: { after: 200 },
            children: textChildren(element, c),
          } as IParagraphOptions),
        );
      }
      break;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Real Word Table
// ---------------------------------------------------------------------------

function createWordTable(rows: string[][], c: DocColors): Table {
  const colCount = Math.max(...rows.map((r) => r.length));
  const baseWidth = Math.floor(100 / colCount);
  const lastWidth = 100 - baseWidth * (colCount - 1);

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, rowIndex) =>
      new TableRow({
        children: Array.from({ length: colCount }, (_, cellIndex) => {
          const cellText = row[cellIndex] || '';
          const isHeader = rowIndex === 0;
          return new TableCell({
            width: { size: cellIndex === colCount - 1 ? lastWidth : baseWidth, type: WidthType.PERCENTAGE },
            shading: isHeader
              ? { type: ShadingType.SOLID, color: c.tocBg, fill: c.tocBg }
              : undefined,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: c.separator },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: c.separator },
              left: { style: BorderStyle.SINGLE, size: 1, color: c.separator },
              right: { style: BorderStyle.SINGLE, size: 1, color: c.separator },
            },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: cellText,
                    size: 20,
                    bold: isHeader,
                    color: c.text,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          });
        }),
      }),
    ),
  });
}

// ---------------------------------------------------------------------------
// Header / Footer
// ---------------------------------------------------------------------------

function createHeader(companyName: string, c: DocColors): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: companyName, size: 18, color: c.muted })],
      }),
    ],
  });
}

function createFooter(companyName: string, isFr: boolean, c: DocColors): Footer {
  const label = isFr ? 'Plan d\'affaires' : 'Business Plan';
  return new Footer({
    children: [
      new Paragraph({
        border: {
          top: { color: c.separator, size: 1, style: BorderStyle.SINGLE },
        },
        spacing: { before: 200 },
        children: [
          new TextRun({ text: `${label} \u2013 ${companyName}`, size: 18, color: c.muted }),
        ],
      }),
    ],
  });
}
