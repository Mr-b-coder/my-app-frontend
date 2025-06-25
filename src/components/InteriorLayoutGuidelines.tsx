import React from 'react';

const AcutrackLogoMini: React.FC = () => (
  <div className="text-lg font-semibold text-[#0A2F5C] dark:text-[#F1F5F9]"> {/* textPrimary */}
    Acutrack
  </div>
);

const InteriorLayoutGuidelines: React.FC = () => {
  return (
    <div id="interior-layout-guide-section" className="p-4 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-lg shadow-inner border border-[#DDE3ED] dark:border-[#334155]"> {/* surface, border */}
      <header className="mb-6 text-center">
        <h2 className="text-xl font-bold text-[#0A2F5C] dark:text-[#F1F5F9] mb-2">Interior Layout & Typography Guidelines</h2> {/* textPrimary */}
        <div className="flex justify-center">
         <AcutrackLogoMini />
        </div>
      </header>

      <div className="space-y-6 text-sm text-[#0A2F5C] dark:text-[#F1F5F9]"> {/* textPrimary for body */}
        <p className="italic text-[#4A5E78] dark:text-[#94A3B8]"> {/* textSecondary for italic */}
          Well-structured interior layout and appropriate typography are crucial for a professional-looking book and a pleasant reading experience. These guidelines will help you prepare your interior pages.
        </p>

        {/* Section 1: Margins & Spacing */}
        <section>
          <h3 className="text-md font-semibold text-[#0A2F5C] dark:text-[#F1F5F9] mb-2 border-b border-[#DDE3ED] dark:border-[#334155] pb-1">1. Margins & Spacing</h3> {/* textPrimary, border */}
          <ul className="list-disc list-inside space-y-1 pl-2 text-[#4A5E78] dark:text-[#94A3B8]"> {/* textSecondary for list items */}
            <li>
              <strong>Outer Margins (Top, Bottom, Outside Edge):</strong> A minimum of <strong>0.5 inches (13mm)</strong> from the trim edge is recommended for all text and critical graphic elements.
            </li>
            <li>
              <strong>Gutter/Inside Margin:</strong> This is critical for readability, especially in thicker books. Please refer to the "Interior Page Setup Guide" (above) for specific gutter margin recommendations based on your book's page count.
            </li>
            <li>
              <strong>Safety Area:</strong> All important content (text, logos, significant parts of images) must be kept within these defined margins to avoid being cut off during trimming or lost in the binding.
            </li>
          </ul>
        </section>

        {/* Section 2: Typography */}
        <section>
          <h3 className="text-md font-semibold text-[#0A2F5C] dark:text-[#F1F5F9] mb-2 border-b border-[#DDE3ED] dark:border-[#334155] pb-1">2. Typography</h3> {/* textPrimary, border */}
          <ul className="list-disc list-inside space-y-1 pl-2 text-[#4A5E78] dark:text-[#94A3B8]"> {/* textSecondary */}
            <li>
              <strong>Readability:</strong> Choose clear, legible fonts. Serif fonts (e.g., Garamond, Times New Roman, Minion Pro) are traditionally used for body text in printed books due to their readability over long passages. Sans-serif fonts (e.g., Helvetica, Arial, Open Sans) can be used for headings or shorter texts.
            </li>
            <li>
              <strong>Font Size:</strong> For body text, typically <strong>10pt to 12pt</strong> is standard for print. This can vary based on the specific font and target audience. Headings should be larger and distinct.
            </li>
            <li>
              <strong>Leading (Line Spacing):</strong> Adequate leading improves readability. A general rule is 120%-145% of the font size (e.g., for 10pt font, use 12pt to 14.5pt leading).
            </li>
            <li>
              <strong>Hierarchy:</strong> Establish a clear visual hierarchy using different font sizes, weights (bold, regular), and styles (italic) for headings, subheadings, body text, captions, etc. Maintain consistency throughout your document.
            </li>
            <li>
              <strong>Widows & Orphans:</strong> Avoid single lines of a paragraph at the top (orphan) or bottom (widow) of a page. Adjust text flow or spacing to prevent these.
            </li>
            <li>
              <strong>Font Embedding:</strong> All fonts used in your document MUST be fully embedded in the PDF. Do not subset fonts below 100%.
            </li>
          </ul>
        </section>

        {/* Section 3: Imagery & Graphics */}
        <section>
          <h3 className="text-md font-semibold text-[#0A2F5C] dark:text-[#F1F5F9] mb-2 border-b border-[#DDE3ED] dark:border-[#334155] pb-1">3. Imagery & Graphics</h3> {/* textPrimary, border */}
          <ul className="list-disc list-inside space-y-1 pl-2 text-[#4A5E78] dark:text-[#94A3B8]"> {/* textSecondary */}
            <li>
              <strong>Resolution:</strong> All raster images (photos, detailed illustrations) should have a resolution of at least <strong>300 DPI</strong> (Dots Per Inch) at their final printed size. Lower resolution images will appear blurry or pixelated.
            </li>
            <li>
              <strong>Color Mode:</strong> For best results in print, convert images to <strong>CMYK</strong> color mode. If you submit RGB files, be aware that color shifts can occur during the conversion to CMYK by the printer.
            </li>
            <li>
              <strong>Full Bleed Images:</strong> If an image or graphic is intended to print to the very edge of the page (full bleed), it must extend <strong>0.125 inches (3mm)</strong> beyond the trim line on all bleeding sides. This bleed area will be trimmed off. (Refer to "Interior Page Setup Guide" for overall page size with bleed).
            </li>
            <li>
              <strong>Vector Graphics:</strong> For logos, line art, and text-heavy graphics, use vector formats where possible, as they scale without loss of quality. Ensure all strokes and fills are correctly set for print.
            </li>
          </ul>
        </section>

        {/* Section 4: Page Numbering (Folios) */}
        <section>
          <h3 className="text-md font-semibold text-[#0A2F5C] dark:text-[#F1F5F9] mb-2 border-b border-[#DDE3ED] dark:border-[#334155] pb-1">4. Page Numbering (Folios)</h3> {/* textPrimary, border */}
          <ul className="list-disc list-inside space-y-1 pl-2 text-[#4A5E78] dark:text-[#94A3B8]"> {/* textSecondary */}
            <li>
              <strong>Placement:</strong> Page numbers should be placed consistently throughout the book (e.g., bottom center, bottom outside corners).
            </li>
            <li>
              <strong>Within Safety Margins:</strong> Ensure page numbers are well within the 0.5-inch safety margin from the trim edges.
            </li>
            <li>
              <strong>Starting Point:</strong> Traditionally, page numbering begins with the first page of the main content (e.g., Chapter 1 or Introduction). Front matter (title page, copyright, table of contents) may have Roman numerals or no numbers, but these pages still count towards the total page count for spine width calculation.
            </li>
            <li>
              <strong>Visibility:</strong> Choose a font size and style for page numbers that is clear but not distracting.
            </li>
          </ul>
        </section>

        {/* Section 5: PDF Export Settings */}
        <section>
          <h3 className="text-md font-semibold text-[#0A2F5C] dark:text-[#F1F5F9] mb-2 border-b border-[#DDE3ED] dark:border-[#334155] pb-1">5. PDF Export Settings (from your design software)</h3> {/* textPrimary, border */}
          <ul className="list-disc list-inside space-y-1 pl-2 text-[#4A5E78] dark:text-[#94A3B8]"> {/* textSecondary */}
            <li>
              <strong>File Format:</strong> Export as a <strong>single PDF file</strong> containing all interior pages in correct reading order.
            </li>
            <li>
              <strong>PDF Standard:</strong> PDF/X-1a:2001 or PDF/X-4:2008 are generally preferred for print, as they are designed to ensure all necessary information is embedded. Standard "High Quality Print" PDF settings can also work if correctly configured.
            </li>
            <li>
              <strong>Font Embedding:</strong> CRITICAL - All fonts must be fully embedded. Check your PDF properties after export to confirm.
            </li>
            <li>
              <strong>Bleed:</strong> If your document contains full-bleed elements, ensure your PDF export settings include the 0.125-inch bleed on all four sides. The PDF page size should then be Trim Width + 0.25" and Trim Height + 0.25".
            </li>
            <li>
              <strong>Printer Marks:</strong> Do <strong>NOT</strong> include any printer marks (crop marks, registration marks, color bars, page information) in the exported PDF.
            </li>
            <li>
              <strong>Transparency:</strong> Flatten all transparency to avoid unexpected results in print. Most PDF/X standards handle this.
            </li>
            <li>
              <strong>Security:</strong> Do <strong>NOT</strong> apply any password protection or security restrictions to the PDF file.
            </li>
          </ul>
        </section>

        <footer className="mt-6 pt-4 border-t border-[#DDE3ED] dark:border-[#334155] text-xs text-[#4A5E78] dark:text-[#94A3B8]"> {/* border, textSecondary */}
          <p>
            <strong>Disclaimer:</strong> These are general guidelines. Specific project needs may vary. It's always a good practice to double-check requirements with your Acutrack representative or printing service, especially for complex projects.
          </p>
          <p className="mt-2">
            For further assistance or clarification, please don't hesitate to contact Acutrack support.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default InteriorLayoutGuidelines;