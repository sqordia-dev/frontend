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
} from 'docx';
import { saveAs } from 'file-saver';
import { PlanSection } from '../../types/preview';
import { CoverPageSettings } from '../../types/cover-page';
import { parseHTMLToElements, cleanParsedElements, ParsedElement } from './html-parser';
import { groupSectionsByCategory } from '../../components/table-of-contents/utils';

/**
 * Generate and download a Word document
 */
export async function generateWordDocument(
  coverSettings: CoverPageSettings,
  sections: PlanSection[],
): Promise<void> {
  const companyName = coverSettings.companyName || 'Company';

  const doc = new Document({
    title: `${companyName} - Business Plan`,
    description: 'Business Plan',
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
          run: {
            font: 'Calibri',
            size: 56,
            bold: true,
            color: '1F2937',
          },
          paragraph: {
            spacing: { before: 480, after: 240 },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Calibri',
            size: 36,
            bold: true,
            color: '2563EB',
          },
          paragraph: {
            spacing: { before: 360, after: 200 },
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Calibri',
            size: 28,
            bold: true,
            color: '374151',
          },
          paragraph: {
            spacing: { before: 280, after: 160 },
          },
        },
      ],
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22,
          },
          paragraph: {
            spacing: { after: 200, line: 360 },
          },
        },
      },
    },
    sections: [
      // Cover Page Section
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1800,
              right: 1440,
            },
          },
        },
        children: createCoverPage(coverSettings),
      },
      // Table of Contents Section
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1800,
              right: 1440,
            },
          },
        },
        headers: {
          default: createHeader(companyName),
        },
        footers: {
          default: createFooter(companyName),
        },
        children: createTableOfContents(sections),
      },
      // Content Sections - each section as a new page
      ...sections.map((section, index) => ({
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1800,
              right: 1440,
            },
          },
        },
        headers: {
          default: createHeader(companyName),
        },
        footers: {
          default: createFooter(companyName),
        },
        children: createSectionContent(section, index + 1),
      })),
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-Business-Plan.docx`;
  saveAs(blob, fileName);
}

/**
 * Create cover page content
 */
function createCoverPage(settings: CoverPageSettings): Paragraph[] {
  const elements: Paragraph[] = [];

  // Add spacing at top
  elements.push(new Paragraph({ spacing: { before: 1200 } }));

  // Company name
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 400 },
      children: [
        new TextRun({
          text: settings.companyName || 'Company Name',
          size: 72,
          bold: true,
          color: '1F2937',
        }),
      ],
    })
  );

  // Document title
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: settings.documentTitle || 'Business Plan',
          size: 48,
          color: '6B7280',
        }),
      ],
    })
  );

  // Color bar (using a line)
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 400 },
      border: {
        bottom: {
          color: settings.primaryColor?.replace('#', '') || '2563EB',
          size: 24,
          style: BorderStyle.SINGLE,
        },
      },
    })
  );

  // Prepared date
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 1200 },
      children: [
        new TextRun({
          text: `Prepared: ${formatDate(settings.preparedDate)}`,
          size: 24,
          color: '9CA3AF',
        }),
      ],
    })
  );

  // Contact information
  if (settings.contactName || settings.contactEmail || settings.contactPhone) {
    elements.push(
      new Paragraph({
        spacing: { before: 1200 },
        children: [
          new TextRun({
            text: 'CONTACT INFORMATION',
            size: 22,
            bold: true,
            color: '374151',
          }),
        ],
      })
    );

    if (settings.contactName) {
      const nameRuns: TextRun[] = [
        new TextRun({
          text: settings.contactName,
          size: 22,
        }),
      ];
      if (settings.contactTitle) {
        nameRuns.push(
          new TextRun({
            text: `, ${settings.contactTitle}`,
            size: 22,
          })
        );
      }
      elements.push(
        new Paragraph({
          spacing: { after: 100 },
          children: nameRuns,
        })
      );
    }

    if (settings.contactEmail) {
      elements.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: settings.contactEmail,
              size: 22,
              color: '2563EB',
            }),
          ],
        })
      );
    }

    if (settings.contactPhone) {
      elements.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: settings.contactPhone,
              size: 22,
            }),
          ],
        })
      );
    }

    if (settings.website) {
      elements.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: settings.website,
              size: 22,
              color: '2563EB',
            }),
          ],
        })
      );
    }
  }

  // Address
  if (settings.addressLine1 || settings.city) {
    elements.push(new Paragraph({ spacing: { before: 400 } }));

    if (settings.addressLine1) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: settings.addressLine1, size: 22 })],
        })
      );
    }

    if (settings.addressLine2) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: settings.addressLine2, size: 22 })],
        })
      );
    }

    if (settings.city || settings.stateProvince || settings.postalCode) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: [settings.city, settings.stateProvince, settings.postalCode]
                .filter(Boolean)
                .join(', '),
              size: 22,
            }),
          ],
        })
      );
    }

    if (settings.country) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: settings.country, size: 22 })],
        })
      );
    }
  }

  return elements;
}

/**
 * Create table of contents
 */
function createTableOfContents(sections: PlanSection[]): Paragraph[] {
  const elements: Paragraph[] = [];
  const groupedSections = groupSectionsByCategory(sections);

  // Title
  elements.push(
    new Paragraph({
      spacing: { before: 200, after: 400 },
      children: [
        new TextRun({
          text: 'Table of Contents',
          size: 56,
          bold: true,
          color: '2563EB',
        }),
      ],
    })
  );

  // Calculate page numbers (estimate)
  let pageNumber = 3;

  groupedSections.forEach((group) => {
    // Category header
    elements.push(
      new Paragraph({
        spacing: { before: 300, after: 150 },
        border: {
          bottom: {
            color: 'D1D5DB',
            size: 1,
            style: BorderStyle.SINGLE,
          },
        },
        children: [
          new TextRun({
            text: group.category,
            size: 28,
            bold: true,
            color: '1F2937',
          }),
        ],
      })
    );

    // Section entries
    group.sections.forEach((section) => {
      elements.push(
        new Paragraph({
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
              leader: LeaderType.DOT,
            },
          ],
          indent: { left: 360 },
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: section.title,
              size: 22,
              color: '4B5563',
            }),
            new TextRun({
              text: '\t',
            }),
            new TextRun({
              text: String(pageNumber),
              size: 22,
              color: '4B5563',
            }),
          ],
        })
      );
      pageNumber += 2;
    });
  });

  // Page break after TOC
  elements.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return elements;
}

/**
 * Create section content
 */
function createSectionContent(section: PlanSection, sectionNumber: number): Paragraph[] {
  const elements: Paragraph[] = [];

  // Section number
  elements.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `${String(sectionNumber).padStart(2, '0')}.`,
          size: 96,
          bold: true,
          color: '2563EB',
        }),
      ],
    })
  );

  // Section title
  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: section.title,
          size: 56,
          bold: true,
          color: '1F2937',
        }),
      ],
    })
  );

  // Parse and add content
  if (section.content) {
    const parsedElements = cleanParsedElements(parseHTMLToElements(section.content));
    parsedElements.forEach((el) => {
      const contentElements = convertElementToDocx(el);
      elements.push(...contentElements);
    });
  } else {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'This section has not been generated yet.',
            size: 22,
            color: '9CA3AF',
            italics: true,
          }),
        ],
      })
    );
  }

  return elements;
}

/**
 * Convert parsed element to docx paragraphs
 */
function convertElementToDocx(element: ParsedElement): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  switch (element.type) {
    case 'heading1':
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 200 },
          children: [
            new TextRun({
              text: element.content || '',
              size: 36,
              bold: true,
              color: '2563EB',
            }),
          ],
        })
      );
      break;

    case 'heading2':
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 160 },
          children: [
            new TextRun({
              text: element.content || '',
              size: 28,
              bold: true,
              color: '374151',
            }),
          ],
        })
      );
      break;

    case 'heading3':
      paragraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 120 },
          children: [
            new TextRun({
              text: element.content || '',
              size: 24,
              bold: true,
              color: '4B5563',
            }),
          ],
        })
      );
      break;

    case 'paragraph':
      paragraphs.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: element.content || '',
              size: 22,
              color: '374151',
            }),
          ],
        })
      );
      break;

    case 'bulletList':
      element.items?.forEach((item) => {
        paragraphs.push(
          new Paragraph({
            numbering: {
              reference: 'bullet-list',
              level: 0,
            },
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: item,
                size: 22,
                color: '374151',
              }),
            ],
          })
        );
      });
      break;

    case 'numberedList':
      element.items?.forEach((item) => {
        paragraphs.push(
          new Paragraph({
            numbering: {
              reference: 'numbered-list',
              level: 0,
            },
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: item,
                size: 22,
                color: '374151',
              }),
            ],
          })
        );
      });
      break;

    case 'table':
      // Skip tables for now as they require special handling in sections
      // Tables need to be added directly to section children, not wrapped in paragraphs
      if (element.rows && element.rows.length > 0) {
        // Add a simple text representation of the table
        element.rows.forEach((row, rowIndex) => {
          paragraphs.push(
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: row.join(' | '),
                  size: 20,
                  bold: rowIndex === 0,
                  color: '374151',
                }),
              ],
            })
          );
        });
      }
      break;

    case 'blockquote':
      paragraphs.push(
        new Paragraph({
          indent: { left: 720 },
          border: {
            left: {
              color: '2563EB',
              size: 24,
              style: BorderStyle.SINGLE,
            },
          },
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({
              text: element.content || '',
              size: 22,
              color: '4B5563',
              italics: true,
            }),
          ],
        })
      );
      break;

    default:
      if (element.content) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: element.content,
                size: 22,
                color: '374151',
              }),
            ],
          })
        );
      }
      break;
  }

  return paragraphs;
}

/**
 * Create header
 */
function createHeader(companyName: string): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: companyName,
            size: 18,
            color: '9CA3AF',
          }),
        ],
      }),
    ],
  });
}

/**
 * Create footer
 */
function createFooter(companyName: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        border: {
          top: {
            color: 'E5E7EB',
            size: 1,
            style: BorderStyle.SINGLE,
          },
        },
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: `Business Plan – ${companyName}`,
            size: 18,
            color: '6B7280',
          }),
        ],
      }),
    ],
  });
}
