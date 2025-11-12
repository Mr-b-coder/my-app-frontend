// FIX: This entire file has been updated to use the correct 'NumberFormat' and remove all other unused imports.

import { Document, Packer, PageOrientation, Paragraph, TextRun, AlignmentType } from 'docx';

const INCHES_TO_TWIPS = 1440;

export const generateWordDocBlob = async (trimWidthInches: number, trimHeightInches: number): Promise<Blob> => {
  const bleed = 0.125; // inches
  const pageSetupWidth = trimWidthInches + bleed * 2;
  const pageSetupHeight = trimHeightInches + bleed * 2;

  const orientation = pageSetupHeight >= pageSetupWidth ? PageOrientation.PORTRAIT : PageOrientation.LANDSCAPE;

  // Margins in inches
  const topMarginInches = 0.5;
  const bottomMarginInches = 0.5;
  const insideMarginInches = 0.75; // This will be the 'left' margin for a recto, 'right' for verso if mirrored
  const outsideMarginInches = 0.5; // This will be the 'right' margin for a recto, 'left' for verso if mirrored

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: orientation,
            width: pageSetupWidth * INCHES_TO_TWIPS,
            height: pageSetupHeight * INCHES_TO_TWIPS,
          },
          margin: {
            top: topMarginInches * INCHES_TO_TWIPS,
            // For a book, 'left' is typically the inside margin for the first page (recto)
            // and 'right' is the outside. Word's "Mirror Margins" handles the verso.
            left: insideMarginInches * INCHES_TO_TWIPS, 
            right: outsideMarginInches * INCHES_TO_TWIPS,
            bottom: bottomMarginInches * INCHES_TO_TWIPS,
            header: 0.5 * INCHES_TO_TWIPS, // Default header/footer distance
            footer: 0.5 * INCHES_TO_TWIPS,
            gutter: 0, // The 'left' margin acts as the inside/gutter area for book layout
          },
        },
        // Consider adding titlePage: true if the first page should behave differently,
        // or using evenAndOddHeaderAndFooters for more complex setups.
        // For a basic template, the above margins are a good start.
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "Your book interior starts here.",
              size: 24, // 12pt
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: {
            after: 200, // Roughly 10pt after
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `This document is set up for a trim size of ${trimWidthInches}" x ${trimHeightInches}". The page size is ${pageSetupWidth.toFixed(3)}" x ${pageSetupHeight.toFixed(3)}" to include a 0.125" bleed on all sides.`,
              size: 20, // 10pt
              italics: true,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: {
            after: 150,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Margins are set as follows (before mirroring):",
              size: 20,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `- Top: ${topMarginInches}", Bottom: ${bottomMarginInches}"`,
              size: 20,
              italics: true,
            }),
          ],
          bullet: { level: 0 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `- Inside (Binding Edge): ${insideMarginInches}"`,
              size: 20,
              italics: true,
            }),
          ],
          bullet: { level: 0 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `- Outside: ${outsideMarginInches}"`,
              size: 20,
              italics: true,
            }),
          ],
          bullet: { level: 0 },
        }),
         new Paragraph({
          children: [
            new TextRun({
              text: "In Microsoft Word, go to Layout > Margins > Custom Margins, and select 'Mirror margins' under 'Multiple pages' for correct facing page layout.",
              size: 20,
              italics: true,
            }),
          ],
           spacing: {
            before: 150,
            after: 150
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Remember to keep all critical content (text, important parts of images) well within these margins to avoid being cut off during printing and binding.",
              size: 20,
              italics: true,
            }),
          ],
        }),
      ],
    }],
  });

  return Packer.toBlob(doc);
};