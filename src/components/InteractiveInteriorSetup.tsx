import React, { useState, useMemo, useCallback } from 'react';

interface InteractiveInteriorSetupProps {
  pageCount?: number;
  trimWidth?: number;
  trimHeight?: number;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onToggle }) => (
  <div className="border border-[#DDE3ED] dark:border-[#334155] rounded-md"> {/* border */}
    <h2>
      <button
        type="button"
        className="flex items-center justify-between w-full p-4 font-medium text-left text-[#0A2F5C] dark:text-[#F1F5F9] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#DDE3ED] dark:hover:bg-[#334155] focus:outline-none focus-visible:ring focus-visible:ring-[#13B5CF] dark:focus-visible:ring-offset-[#1E293B] focus-visible:ring-opacity-75" // textPrimary, background, lighter blue hover, accent ring
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </h2>
    {isOpen && (
      <div className="p-4 text-sm text-[#4A5E78] dark:text-[#94A3B8] bg-[#FFFFFF] dark:bg-[#1E293B] border-t border-[#DDE3ED] dark:border-[#334155]"> {/* textSecondary, surface, border */}
        {children}
      </div>
    )}
  </div>
);


const InteractiveInteriorSetup: React.FC<InteractiveInteriorSetupProps> = ({ 
    pageCount = 0, 
    trimWidth: fetchedTrimWidth = 0, 
    trimHeight: fetchedTrimHeight = 0,
}) => {
  const [showGutterDetails, setShowGutterDetails] = useState(false);
  const [showTechSpecs, setShowTechSpecs] = useState(false);
  const [showInteriorPageGuides, setShowInteriorPageGuides] = useState(true); 

  const gutterSpec = [
    { range: [0, 60], margin: 0.5, label: "0.5 in or 13 mm" },
    { range: [61, 150], margin: 0.75, label: "0.75 in or 20 mm" },
    { range: [151, 400], margin: 1.0, label: "1.0 in or 25 mm" },
    { range: [401, 600], margin: 1.125, label: "1.125 in or 29 mm" },
    { range: [601, Infinity], margin: 1.25, label: "1.25 in or 32 mm" },
  ];

  const { recommendedGutterInches } = useMemo(() => {
    const spec = gutterSpec.find(g => pageCount >= g.range[0] && pageCount <= g.range[1]);
    return {
        recommendedGutterInches: spec ? spec.margin : 0.5, 
    };
  }, [pageCount, gutterSpec]);

  const numericTrimWidth = fetchedTrimWidth;
  const numericTrimHeight = fetchedTrimHeight;

  const fullPageWidthWithBleed = useMemo(() => {
    return numericTrimWidth > 0 ? (numericTrimWidth + 0.25).toFixed(3) : '0.000';
  }, [numericTrimWidth]);

  const fullPageHeightWithBleed = useMemo(() => {
    return numericTrimHeight > 0 ? (numericTrimHeight + 0.25).toFixed(3) : '0.000';
  }, [numericTrimHeight]);
  
  const isValidInput = numericTrimWidth > 0 && numericTrimHeight > 0;

  const BLEED_AMOUNT = 0.125;
  const SAFETY_MARGIN_AMOUNT = 0.5;

  // Determine if dark mode is active by checking the html class
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const themedGuideColors = {
    // Semantic guide colors - RETAINED
    bleed: '#FF6B6B',
    trim: '#4A90E2',
    safety: '#22C55E',
    
    // Theme-aligned colors
    gutterFill: isDarkMode ? '#334155' : '#E7ECF2',      // darkMode_border or disabledBackground
    textDark: isDarkMode ? '#F1F5F9' : '#0A2F5C',        // textPrimary
    textVersoLabel: isDarkMode ? '#94A3B8' :'#4A5E78',  // textSecondary
  };

  const renderPreview = () => {
    if (!isValidInput) {
      return <p className="text-center text-[#4A5E78] dark:text-[#94A3B8]">Trim Size not available from cover setup.</p>; // textSecondary
    }

    const MAX_SVG_WIDTH = 500; 
    
    const spreadContentWidthInches = (numericTrimWidth + BLEED_AMOUNT * 2) * 2 + recommendedGutterInches;
    const spreadContentHeightInches = numericTrimHeight + BLEED_AMOUNT * 2;

    const scale = MAX_SVG_WIDTH / spreadContentWidthInches;

    const svgWidth = spreadContentWidthInches * scale;
    const svgHeight = spreadContentHeightInches * scale;
    
    const pageOuterW = (numericTrimWidth + BLEED_AMOUNT * 2) * scale;
    const pageOuterH = (numericTrimHeight + BLEED_AMOUNT * 2) * scale;
    
    const trimOffsetX = BLEED_AMOUNT * scale;
    const trimOffsetY = BLEED_AMOUNT * scale;
    const trimW = numericTrimWidth * scale;
    const trimH = numericTrimHeight * scale;

    const safetyOffsetX = (BLEED_AMOUNT + SAFETY_MARGIN_AMOUNT) * scale;
    const safetyOffsetY = (BLEED_AMOUNT + SAFETY_MARGIN_AMOUNT) * scale;
    const safetyW = Math.max(0, (numericTrimWidth - SAFETY_MARGIN_AMOUNT * 2) * scale);
    const safetyH = Math.max(0, (numericTrimHeight - SAFETY_MARGIN_AMOUNT * 2) * scale);
    
    const gutterW = recommendedGutterInches * scale;

    const versoPageX = 0;
    const gutterX = versoPageX + pageOuterW;
    const rectoPageX = gutterX + gutterW;
    
    const labelFontSize = Math.max(6, Math.min(10, svgWidth / 60));
    const embeddedInfoFontSize = labelFontSize * 1.1;
    const embeddedInfoLineHeight = embeddedInfoFontSize * 1.6;


    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Verso Page */}
        <g transform={`translate(${versoPageX}, 0)`}>
          <rect x="0" y="0" width={pageOuterW} height={pageOuterH} fill="none" stroke={themedGuideColors.bleed} strokeWidth="1" /> {/* Bleed */}
          <rect x={trimOffsetX} y={trimOffsetY} width={trimW} height={trimH} fill="none" stroke={themedGuideColors.trim} strokeWidth="1" /> {/* Trim */}
          {safetyW > 0 && safetyH > 0 && 
            <rect x={safetyOffsetX} y={safetyOffsetY} width={safetyW} height={safetyH} fill="none" stroke={themedGuideColors.safety} strokeWidth="1" strokeDasharray="3,2" /> /* Safety */
          }
          <text x={pageOuterW / 2} y={pageOuterH / 2 * 0.8} fontSize={labelFontSize * 1.5} textAnchor="middle" dominantBaseline="middle" fill={themedGuideColors.textVersoLabel}>VERSO</text>
        
          {showInteriorPageGuides && isValidInput && (
            <g>
               <text 
                x={safetyOffsetX + embeddedInfoFontSize * 0.5}
                y={pageOuterH / 2 * 1.1} 
                fontSize={embeddedInfoFontSize} 
                textAnchor="start" 
                dominantBaseline="hanging"
                fill={themedGuideColors.textDark}>
                <tspan fontWeight="bold">Trim size: </tspan><tspan>{`${numericTrimWidth.toFixed(1)} in x ${numericTrimHeight.toFixed(1)} in`}</tspan>
              </text>
              <text 
                x={safetyOffsetX + embeddedInfoFontSize * 0.5}
                y={pageOuterH / 2 * 1.1 + embeddedInfoLineHeight}
                fontSize={embeddedInfoFontSize} 
                textAnchor="start" 
                dominantBaseline="hanging"
                fill={themedGuideColors.textDark}>
                 <tspan fontWeight="bold">Page size: </tspan><tspan>{`${fullPageWidthWithBleed} in x ${fullPageHeightWithBleed} in`}</tspan>
              </text>
              <text 
                x={safetyOffsetX + embeddedInfoFontSize * 0.5}
                y={pageOuterH / 2 * 1.1 + embeddedInfoLineHeight * 2}
                fontSize={embeddedInfoFontSize} 
                textAnchor="start" 
                dominantBaseline="hanging"
                fill={themedGuideColors.textDark}>
                <tspan fontWeight="bold">Gutter size : </tspan><tspan>{`${recommendedGutterInches.toFixed(1)} in`}</tspan>
              </text>
            </g>
          )}
        </g>

        {/* Gutter */}
        <rect x={gutterX} y="0" width={gutterW} height={pageOuterH} fill={themedGuideColors.gutterFill} />
        {showInteriorPageGuides && isValidInput && (
            <text 
                x={gutterX + gutterW / 2} 
                y={pageOuterH / 2} 
                fontSize={labelFontSize * 1.1} 
                textAnchor="middle" 
                dominantBaseline="central" 
                fill={themedGuideColors.textDark}
                transform={`rotate(-90 ${gutterX + gutterW / 2} ${pageOuterH / 2})`}
            >
            {`Gutter: ${recommendedGutterInches.toFixed(1)}in`}
            </text>
        )}


        {/* Recto Page */}
        <g transform={`translate(${rectoPageX}, 0)`}>
          <rect x="0" y="0" width={pageOuterW} height={pageOuterH} fill="none" stroke={themedGuideColors.bleed} strokeWidth="1" /> {/* Bleed */}
          <rect x={trimOffsetX} y={trimOffsetY} width={trimW} height={trimH} fill="none" stroke={themedGuideColors.trim} strokeWidth="1" /> {/* Trim */}
           {safetyW > 0 && safetyH > 0 && 
            <rect x={safetyOffsetX} y={safetyOffsetY} width={safetyW} height={safetyH} fill="none" stroke={themedGuideColors.safety} strokeWidth="1" strokeDasharray="3,2" /> /* Safety */
           }
          <text x={pageOuterW / 2} y={pageOuterH / 2 * 0.8} fontSize={labelFontSize * 1.5} textAnchor="middle" dominantBaseline="middle" fill={themedGuideColors.textVersoLabel}>RECTO</text>
        </g>
      </svg>
    );
  };
  
  const legendItems = [
    { color: themedGuideColors.bleed, type: 'line', label: '0.125" Bleed' },
    { color: themedGuideColors.trim, type: 'line', label: 'Trim Line (Final Page Size)' },
    { color: themedGuideColors.safety, type: 'line-dashed', label: '0.5" Safety Margin' },
    { color: themedGuideColors.gutterFill, type: 'box', label: 'Gutter (Binding Area)' },
  ];

  const originalGutterTableData = [
    { pageCount: "Less than 60", margin: "0.5 in or 13 mm" },
    { pageCount: "61 to 150", margin: "0.75 in or 20 mm" },
    { pageCount: "151 to 400", margin: "1 in or 25 mm" },
    { pageCount: "400 to 600", margin: "1.125 in or 29 mm" },
    { pageCount: "Over 600", margin: "1.25 in or 32 mm" },
  ];

  const technicalSpecificationsContent = (
    <ul className="list-disc list-inside space-y-1.5">
      <li>
        <strong>Margins:</strong>
        <ul className="list-circle list-inside ml-4 text-xs">
            <li>Minimum 0.5 inches Safety Margin from trim edge for all critical content (text, images).</li>
            <li>Minimum Gutter Margin (inner margin) based on page count. Refer to "What is a Gutter?" section.</li>
        </ul>
      </li>
      <li><strong>Exclusions:</strong> Do NOT include trim marks, bleed marks, or registration marks in your PDF.</li>
      <li><strong>Font Embedding:</strong> All fonts must be fully embedded in the PDF.</li>
      <li><strong>Flatten Transparent Layers:</strong> Ensure transparency layers and vector objects are flattened to avoid printing issues.</li>
      <li><strong>Security:</strong> Do NOT use any security settings or password protection on your PDF file.</li>
      <li><strong>Page Size in PDF:</strong> Prepare your single-page PDF at the "Full Page Size (with bleed)" calculated by this tool (Trim Size + 0.25" for both width and height).</li>
    </ul>
  );


  return (
    <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-lg shadow-md border border-[#DDE3ED] dark:border-[#334155] space-y-8">
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-[#0A2F5C] dark:text-[#F1F5F9] border-b border-[#DDE3ED] dark:border-[#334155] pb-2">Interior Page Preview</h3>
            <label htmlFor="showInteriorPageGuidesToggle" className="flex items-center text-xs text-[#4A5E78] dark:text-[#94A3B8] cursor-pointer">
                <input 
                    type="checkbox" 
                    id="showInteriorPageGuidesToggle"
                    name="showInteriorPageGuidesToggle" /* Added name attribute */
                    checked={showInteriorPageGuides} 
                    onChange={() => setShowInteriorPageGuides(!showInteriorPageGuides)}
                    className="mr-1 h-3 w-3 rounded border-[#A8B8D0] dark:border-[#64748B] text-[#0A2F5C] dark:text-[#13B5CF] focus:ring-[#13B5CF] dark:focus:ring-offset-[#1E293B]"
                />
                Show Page Details
            </label>
          </div>
          <div className="border border-[#A8B8D0] dark:border-[#475569] rounded-md p-2 bg-[#F8FAFC] dark:bg-[#0F172A] min-h-[300px] flex items-center justify-center">
            {renderPreview()}
          </div>
          <div className="mt-2 text-sm">
            <h4 className="font-medium text-[#4A5E78] dark:text-[#94A3B8] mb-2">Legend:</h4>
            <div className="flex flex-wrap justify-start items-center gap-x-4 gap-y-1">
                {legendItems.map(item => (
                <div key={item.label} className="flex items-center">
                    {item.type === 'box' ? (
                    <span className="w-3 h-3 inline-block mr-1.5 border border-slate-400 dark:border-slate-600" style={{ backgroundColor: item.color }}></span>
                    ) : ( 
                    <span 
                        className="w-4 h-0.5 inline-block mr-1.5" 
                        style={{ 
                        backgroundColor: item.color, 
                        borderStyle: item.type === 'line-dashed' ? 'dashed' : 'solid', 
                        borderWidth: '2px', 
                        borderColor: item.color 
                        }}
                    ></span>
                    )}
                    <span className="text-xs text-[#4A5E78] dark:text-[#94A3B8]">{item.label}</span>
                </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-[#DDE3ED] dark:border-[#334155]">
        <AccordionItem title="Gutter Explained" isOpen={showGutterDetails} onToggle={() => setShowGutterDetails(!showGutterDetails)}>
            <p className="mb-3">
              The gutter is the blank space in the middle of an open book where the pages are bound together. It's the area between the text on a page and the binding edge. For books exceeding 60 pages, it's advisable to incorporate an adequate gutter into your pages.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-[#A8B8D0] dark:border-[#475569] bg-[#FFFFFF] dark:bg-[#1E293B] rounded">
                <thead className="bg-[#F8FAFC] dark:bg-[#0F172A]">
                  <tr>
                    <th className="p-2 border-b border-[#A8B8D0] dark:border-[#475569] text-left font-medium text-[#0A2F5C] dark:text-[#F1F5F9]">Page Count</th>
                    <th className="p-2 border-b border-[#A8B8D0] dark:border-[#475569] text-left font-medium text-[#0A2F5C] dark:text-[#F1F5F9]">Recommended Gutter Margin*</th>
                  </tr>
                </thead>
                <tbody>
                  {originalGutterTableData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-[#FFFFFF] dark:bg-[#1E293B]' : 'bg-[#F8FAFC] dark:bg-[#0F172A]'}>
                      <td className="p-2 border-b border-[#DDE3ED] dark:border-[#334155]">{row.pageCount}</td>
                      <td className="p-2 border-b border-[#DDE3ED] dark:border-[#334155]">{row.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#8DA0B9] dark:text-[#64748B] mt-1">*Add gutter to the page margin of side facing spine (inner margin).</p>
        </AccordionItem>

        <AccordionItem title="Technical File Specifications" isOpen={showTechSpecs} onToggle={() => setShowTechSpecs(!showTechSpecs)}>
          {technicalSpecificationsContent}
        </AccordionItem>
      </div>
    </div>
  );
};

export default InteractiveInteriorSetup;