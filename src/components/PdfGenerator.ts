// FIX: This entire file has been updated with corrected import paths and removed unused variables.

import { jsPDF } from 'jspdf';
// FIX 1: The path to your types is likely now an alias configured in your tsconfig.json, or a relative path from within the `src` folder. Let's assume you have a path alias '@shared' pointing to the shared folder.
import { CoverCalculations, BindingType } from '@shared/types';
// FIX 2: The path to constants.ts (which is inside `src`) from a file in `src/components` is one level up.
// FIX 3: Removed 'INCH_TO_POINTS' because the build log shows it's an unused variable (TS6133 error).

// Helper function to draw a dashed line
const drawDashedLine = (doc: jsPDF, x1: number, y1: number, x2: number, y2: number, dashLen: number, gapLen: number) => {
  doc.setLineDashPattern([dashLen, gapLen], 0);
  doc.line(x1, y1, x2, y2);
  doc.setLineDashPattern([], 0); // Reset dash pattern
};

const drawCoverPageGuides = (
  doc: jsPDF,
  pageConfig: {
    totalCoverWidth: number;
    totalCoverHeight: number;
    bleedAmount?: number; // For softcover coil/wire-o
    wrapAmount?: number; // For hardcover coil/wire-o (per side)
    boardExtension?: number; // For hardcover coil/wire-o
    safetyMarginTopBottom: number;
    safetyMarginBindingEdge: number;
    safetyMarginOutsideEdge: number;
    isFrontCover: boolean; // true for Front, false for Back
    isHardcoverCoilWireO: boolean;
  },
  colors: any,
  pageTitle: string,
  trimWidthNum: number, // Pass trimWidth for reference, esp. for hardcover board placement
  trimHeightNum: number // Pass trimHeight for reference
) => {
  const {
    totalCoverWidth, totalCoverHeight, bleedAmount, wrapAmount, boardExtension,
    safetyMarginTopBottom, safetyMarginBindingEdge, safetyMarginOutsideEdge,
    isFrontCover, isHardcoverCoilWireO
  } = pageConfig;

  const pageW = totalCoverWidth;
  const pageH = totalCoverHeight;

  doc.setLineWidth(0.01); 
  doc.setFontSize(8);

  if (isHardcoverCoilWireO && wrapAmount && boardExtension !== undefined) {
    // --- HARDCOVER COIL/WIRE-O PDF PAGE ---
    // 1. Wrap Area Outline (outermost document boundary)
    doc.setDrawColor(colors.bleedColor); // Using 'bleedColor' for wrap edge for consistency
    doc.rect(0, 0, pageW, pageH, 'S');
    doc.setTextColor(colors.bleedColor);
    doc.text(`Wrap Edge (Final Page Size: ${pageW.toFixed(3)}" x ${pageH.toFixed(3)}")`, 0.05, 0.15);

    // 2. Board Area (inside wrap)
    const boardX = wrapAmount;
    const boardY = wrapAmount;
    const boardActualWidth = trimWidthNum + boardExtension;
    const boardActualHeight = trimHeightNum + boardExtension; 
    // Sanity check: pageW should be boardActualWidth + 2 * wrapAmount

    doc.setDrawColor(colors.boardEdgeColor);
    doc.rect(boardX, boardY, boardActualWidth, boardActualHeight, 'S');
    doc.setTextColor(colors.boardEdgeColor);
    doc.text(`Board Area / Wrap Fold Line (${boardActualWidth.toFixed(3)}" x ${boardActualHeight.toFixed(3)}")`, boardX + 0.05, boardY + 0.15);
    doc.text(`(Board is Trim + ${boardExtension.toFixed(3)}" extension)`, boardX + 0.05, boardY + 0.25);
    
    // 3. Safety Margins (relative to final page edges)
    doc.setDrawColor(colors.safetyMarginColor);
    const safeTop = safetyMarginTopBottom;
    const safeBottom = pageH - safetyMarginTopBottom;
    let safeLeft, safeRight;

    if (isFrontCover) { // Front Cover: Binding edge is LEFT
      safeLeft = safetyMarginBindingEdge;
      safeRight = pageW - safetyMarginOutsideEdge;
    } else { // Back Cover: Binding edge is RIGHT
      safeLeft = safetyMarginOutsideEdge;
      safeRight = pageW - safetyMarginBindingEdge;
    }
    
    if (safeRight > safeLeft && safeBottom > safeTop) {
      drawDashedLine(doc, safeLeft, safeTop, safeRight, safeTop, 0.04, 0.04); // Top
      drawDashedLine(doc, safeLeft, safeBottom, safeRight, safeBottom, 0.04, 0.04); // Bottom
      drawDashedLine(doc, safeLeft, safeTop, safeLeft, safeBottom, 0.04, 0.04); // Left
      drawDashedLine(doc, safeRight, safeTop, safeRight, safeBottom, 0.04, 0.04); // Right
    }
    doc.setTextColor(colors.safetyMarginColor);
    doc.text(`Safety: T/B ${safetyMarginTopBottom.toFixed(3)}", Bind ${safetyMarginBindingEdge.toFixed(3)}", Outer ${safetyMarginOutsideEdge.toFixed(3)}" (from page edge)`, 0.05, pageH - 0.20);
    
    // 4. Punch Hole Visualization (relative to board edge)
    const punchHoleRadius = 0.075; 
    const punchHoleSpacing = 0.375; 
    const punchHoleCenterOffsetFromBoardEdge = 0.3125; // Offset from the physical board edge

    doc.setFillColor(colors.punchHoleColor);
    doc.setDrawColor(colors.punchHoleColor);

    let punchHoleCenterX_onBoard;
    if (isFrontCover) { // Front cover, binding on left side OF BOARD
      punchHoleCenterX_onBoard = boardX + punchHoleCenterOffsetFromBoardEdge;
    } else { // Back cover, binding on right side OF BOARD
      punchHoleCenterX_onBoard = boardX + boardActualWidth - punchHoleCenterOffsetFromBoardEdge;
    }

    const startPunchY = boardY + punchHoleSpacing / 2; 
    const endPunchY = boardY + boardActualHeight - punchHoleSpacing / 2;

    for (let y = startPunchY; y <= endPunchY; y += punchHoleSpacing) {
      if (y > boardY && y < (boardY + boardActualHeight) ){ // Ensure holes are within board height
         doc.circle(punchHoleCenterX_onBoard, y, punchHoleRadius, 'F');
      }
    }
    doc.setTextColor(colors.punchHoleColor);
    const punchTextX = punchHoleCenterX_onBoard + (isFrontCover ? 0.1 : -1.2);
    const punchTextY = boardY + boardActualHeight + 0.15;
    if (punchTextY < pageH - 0.1) { // Ensure text fits
        doc.text(`Punch Holes (Guide - on board)`, punchTextX, punchTextY);
    }


  } else if (!isHardcoverCoilWireO && bleedAmount) {
    // --- SOFTCOVER COIL/WIRE-O PDF PAGE --- (Existing logic)
    // 1. Bleed Area Outline (outermost document boundary)
    doc.setDrawColor(colors.bleedColor);
    doc.rect(0, 0, pageW, pageH, 'S');
    doc.setTextColor(colors.bleedColor);
    doc.text(`Bleed Edge (${bleedAmount.toFixed(3)}")`, 0.05, 0.15);

    // 2. Trim Area / Finished Size (inside bleed)
    const trimX = bleedAmount;
    const trimY = bleedAmount;
    const trimW = pageW - 2 * bleedAmount;
    const trimH = pageH - 2 * bleedAmount;
    doc.setDrawColor(colors.trimColor);
    doc.rect(trimX, trimY, trimW, trimH, 'S');
    doc.setTextColor(colors.trimColor);
    doc.text('Trim Line', trimX + 0.05, trimY + 0.15);

    // 3. Safety Margins (relative to trim edges)
    doc.setDrawColor(colors.safetyMarginColor);
    const safeTop = trimY + safetyMarginTopBottom;
    const safeBottom = trimY + trimH - safetyMarginTopBottom;
    let safeLeft, safeRight;

    if (isFrontCover) { // Front Cover: Binding edge is LEFT
      safeLeft = trimX + safetyMarginBindingEdge;
      safeRight = trimX + trimW - safetyMarginOutsideEdge;
    } else { // Back Cover: Binding edge is RIGHT
      safeLeft = trimX + safetyMarginOutsideEdge;
      safeRight = trimX + trimW - safetyMarginBindingEdge;
    }
    
    if (safeRight > safeLeft && safeBottom > safeTop) {
      drawDashedLine(doc, safeLeft, safeTop, safeRight, safeTop, 0.04, 0.04); // Top
      drawDashedLine(doc, safeLeft, safeBottom, safeRight, safeBottom, 0.04, 0.04); // Bottom
      drawDashedLine(doc, safeLeft, safeTop, safeLeft, safeBottom, 0.04, 0.04); // Left
      drawDashedLine(doc, safeRight, safeTop, safeRight, safeBottom, 0.04, 0.04); // Right
    }
    doc.setTextColor(colors.safetyMarginColor);
    doc.text(`Safety: T/B ${safetyMarginTopBottom.toFixed(3)}", Bind ${safetyMarginBindingEdge.toFixed(3)}", Outer ${safetyMarginOutsideEdge.toFixed(3)}" (from trim)`, trimX + 0.05, trimY + trimH + 0.25);
    
    // 4. Punch Hole Visualization (relative to trim line)
    const punchHoleRadius = 0.075; 
    const punchHoleSpacing = 0.375; 
    const punchHoleCenterOffsetFromTrim = 0.3125; 
    doc.setFillColor(colors.punchHoleColor);
    doc.setDrawColor(colors.punchHoleColor);
    let punchHoleCenterX;
    if (isFrontCover) { 
      punchHoleCenterX = trimX + punchHoleCenterOffsetFromTrim;
    } else { 
      punchHoleCenterX = trimX + trimW - punchHoleCenterOffsetFromTrim;
    }
    const startY = trimY + punchHoleSpacing / 2; 
    const endY = trimY + trimH - punchHoleSpacing / 2;
    for (let y = startY; y <= endY; y += punchHoleSpacing) {
      doc.circle(punchHoleCenterX, y, punchHoleRadius, 'F');
    }
    doc.setTextColor(colors.punchHoleColor);
    doc.text(`Punch Holes (Visual Guide - from trim)`, punchHoleCenterX + (isFrontCover ? 0.1 : -1.2), trimY + trimH + 0.15);
  }


  // Page Title Label (Common for both soft and hard coil/wire-o)
  doc.setTextColor(colors.textColor);
  doc.setFontSize(12);
  doc.text(pageTitle, pageW / 2, pageH / 2, { align: 'center' });
  doc.setFontSize(8); // Reset font size
};


export const generateCoverPdfBlob = (calculations: CoverCalculations, JSPDF: typeof jsPDF): Promise<Blob> => {
  return new Promise((resolve) => {
    const {
      totalCoverWidth, totalCoverHeight, trimWidthNum, trimHeightNum, spineWidth,
      bindingType, safetyMargin, bleedAmount, wrapAmount, // Use wrapAmount
      hingeWidth, boardWidth, boardHeight, boardExtension, // Added boardExtension
      safetyMarginTopBottom, safetyMarginBindingEdge, safetyMarginOutsideEdge
    } = calculations;

    const doc = new JSPDF({
      orientation: totalCoverWidth > totalCoverHeight ? 'landscape' : 'portrait',
      unit: 'in',
      format: [totalCoverWidth, totalCoverHeight], 
    });

    doc.setLineWidth(0.01); 

    const colors = {
        trimColor: '#4A90E2', 
        spineFoldColor: '#9013FE',
        safetyMarginColor: '#22C55E',
        bleedColor: '#FF6B6B', // Used for wrap edge in hardcover coil/wire
        hingeColor: '#F5A623',
        boardEdgeColor: '#444444',
        textColor: '#333333',
        punchHoleColor: '#BBBBBB',
    };
    
    doc.setFontSize(8);

    const isHardcoverCoilWire = bindingType === BindingType.COIL_WIRE_O_HARDCOVER;
    const isSoftcoverCoilWire = bindingType === BindingType.COIL_WIRE_O_SOFTCOVER;


    if (isSoftcoverCoilWire || isHardcoverCoilWire) {
        if (safetyMarginTopBottom && safetyMarginBindingEdge && safetyMarginOutsideEdge && 
            ((isSoftcoverCoilWire && bleedAmount) || (isHardcoverCoilWire && wrapAmount && boardExtension !== undefined))) {
            
            const pageConfigBase = {
                totalCoverWidth, totalCoverHeight,
                safetyMarginTopBottom, safetyMarginBindingEdge, safetyMarginOutsideEdge,
                isHardcoverCoilWireO: isHardcoverCoilWire,
                wrapAmount: isHardcoverCoilWire ? wrapAmount : undefined,
                bleedAmount: isSoftcoverCoilWire ? bleedAmount : undefined,
                boardExtension: isHardcoverCoilWire ? boardExtension : undefined,
            };

            // Page 1: Front Cover
            drawCoverPageGuides(doc, {
                ...pageConfigBase,
                isFrontCover: true
            }, colors, 'FRONT COVER', trimWidthNum, trimHeightNum);

            // Page 2: Back Cover
            doc.addPage([totalCoverWidth, totalCoverHeight], totalCoverWidth > totalCoverHeight ? 'landscape' : 'portrait');
            drawCoverPageGuides(doc, {
                ...pageConfigBase,
                isFrontCover: false
            }, colors, 'BACK COVER', trimWidthNum, trimHeightNum);
        } else {
            doc.text("Error: Missing dimensions for Coil/Wire-O PDF.", 0.5, 0.5);
        }
    } else if (bindingType === BindingType.PERFECT_BIND && bleedAmount && spineWidth && safetyMargin) {
      // --- PERFECT BIND PDF ---
      const pageW = totalCoverWidth;
      const pageH = totalCoverHeight;

      doc.setDrawColor(colors.bleedColor);
      doc.rect(0, 0, pageW, pageH, 'S'); 
      doc.setTextColor(colors.bleedColor);
      doc.text(`Bleed Edge (${bleedAmount.toFixed(3)}")`, 0.05, 0.15);

      doc.setDrawColor(colors.trimColor);
      doc.rect(bleedAmount, bleedAmount, pageW - 2 * bleedAmount, pageH - 2 * bleedAmount, 'S');
      doc.setTextColor(colors.trimColor);
      doc.text('Trim Line / Fold Line', bleedAmount + 0.05, bleedAmount + 0.15);
      
      const leftSpineFoldX = bleedAmount + trimWidthNum;
      const rightSpineFoldX = leftSpineFoldX + spineWidth;
      doc.setDrawColor(colors.spineFoldColor);
      drawDashedLine(doc, leftSpineFoldX, bleedAmount, leftSpineFoldX, pageH - bleedAmount, 0.1, 0.05);
      drawDashedLine(doc, rightSpineFoldX, bleedAmount, rightSpineFoldX, pageH - bleedAmount, 0.1, 0.05);
      doc.setTextColor(colors.spineFoldColor);
      doc.text(`Spine (${spineWidth.toFixed(3)}")`, leftSpineFoldX + spineWidth / 2, bleedAmount - 0.05, { align: 'center'});
      
      doc.setDrawColor(colors.safetyMarginColor);
      drawDashedLine(doc, bleedAmount + safetyMargin, bleedAmount + safetyMargin, leftSpineFoldX - safetyMargin, bleedAmount + safetyMargin, 0.04, 0.04); 
      drawDashedLine(doc, bleedAmount + safetyMargin, pageH - bleedAmount - safetyMargin, leftSpineFoldX - safetyMargin, pageH - bleedAmount - safetyMargin, 0.04, 0.04); 
      drawDashedLine(doc, bleedAmount + safetyMargin, bleedAmount + safetyMargin, bleedAmount + safetyMargin, pageH - bleedAmount - safetyMargin, 0.04, 0.04); 
      drawDashedLine(doc, leftSpineFoldX - safetyMargin, bleedAmount + safetyMargin, leftSpineFoldX - safetyMargin, pageH - bleedAmount - safetyMargin, 0.04, 0.04); 
      drawDashedLine(doc, rightSpineFoldX + safetyMargin, bleedAmount + safetyMargin, pageW - bleedAmount - safetyMargin, bleedAmount + safetyMargin, 0.04, 0.04); 
      drawDashedLine(doc, rightSpineFoldX + safetyMargin, pageH - bleedAmount - safetyMargin, pageW - bleedAmount - safetyMargin, pageH - bleedAmount - safetyMargin, 0.04, 0.04); 
      drawDashedLine(doc, rightSpineFoldX + safetyMargin, bleedAmount + safetyMargin, rightSpineFoldX + safetyMargin, pageH - bleedAmount - safetyMargin, 0.04, 0.04); 
      drawDashedLine(doc, pageW - bleedAmount - safetyMargin, bleedAmount + safetyMargin, pageW - bleedAmount - safetyMargin, pageH - bleedAmount - safetyMargin, 0.04, 0.04); 
      doc.setTextColor(colors.safetyMarginColor);
      doc.text(`Safety Margin (${safetyMargin.toFixed(3)}")`, bleedAmount + safetyMargin + 0.05, bleedAmount + safetyMargin + 0.15);

      doc.setTextColor(colors.textColor);
      doc.text('BACK COVER', bleedAmount + trimWidthNum / 2, pageH / 2, { align: 'center' });
      doc.text('FRONT COVER', rightSpineFoldX + trimWidthNum / 2, pageH / 2, { align: 'center' });
      doc.text('SPINE', leftSpineFoldX + spineWidth / 2, pageH / 2, { align: 'center', angle: -90 });


    } else if (bindingType === BindingType.CASE_BIND && wrapAmount && hingeWidth && boardWidth && boardHeight && calculations.frontPanelBoardWidth && spineWidth && safetyMargin) {
      // Use wrapAmount consistently for Case Bind as well
      const { frontPanelBoardWidth } = calculations;
      const pageW = totalCoverWidth;
      const pageH = totalCoverHeight;

      doc.setDrawColor(colors.bleedColor); // Using 'bleedColor' for wrap edge
      doc.rect(0, 0, pageW, pageH, 'S');
      doc.setTextColor(colors.bleedColor);
      doc.text(`Wrap Area Edge (${wrapAmount.toFixed(3)}" wrap per side)`, 0.05, 0.15);

      const boardX = wrapAmount;
      const boardY = wrapAmount;
      // For CaseBind, boardHeight and boardWidth in calculations already represent the physical board/assembly dimensions
      const currentBoardOverallWidth = calculations.boardWidth ?? 0; // boardWidth is total assembly
      const currentBoardActualHeight = calculations.boardHeight ?? 0; // boardHeight is actual board material height

      doc.setDrawColor(colors.boardEdgeColor);
      doc.rect(boardX, boardY, currentBoardOverallWidth, currentBoardActualHeight, 'S');
      doc.setTextColor(colors.boardEdgeColor);
      doc.text('Board Assembly Area / Wrap Fold Line', boardX + 0.05, boardY + 0.15);

      const backCoverPanelEdge = boardX + frontPanelBoardWidth;
      const leftHingeEdge = backCoverPanelEdge + hingeWidth;
      const spinePanelEdge = leftHingeEdge + spineWidth;
      const rightHingeEdge = spinePanelEdge + hingeWidth;

      doc.setDrawColor(colors.spineFoldColor);
      drawDashedLine(doc, leftHingeEdge, boardY, leftHingeEdge, boardY + currentBoardActualHeight, 0.1, 0.05); // Spine Left
      drawDashedLine(doc, spinePanelEdge, boardY, spinePanelEdge, boardY + currentBoardActualHeight, 0.1, 0.05); // Spine Right
      doc.setTextColor(colors.spineFoldColor);
      doc.text(`Spine (${spineWidth.toFixed(3)}")`, leftHingeEdge + spineWidth / 2, boardY - 0.05, { align: 'center' });

      doc.setDrawColor(colors.hingeColor);
      drawDashedLine(doc, backCoverPanelEdge, boardY, backCoverPanelEdge, boardY + currentBoardActualHeight, 0.08, 0.04); // Left Hinge Left
      drawDashedLine(doc, rightHingeEdge, boardY, rightHingeEdge, boardY + currentBoardActualHeight, 0.08, 0.04); // Right Hinge Right
      doc.setTextColor(colors.hingeColor);
      doc.text(`Hinge (${hingeWidth.toFixed(3)}")`, backCoverPanelEdge + hingeWidth / 2, boardY + 0.3, { align: 'center' });
      doc.text(`Hinge (${hingeWidth.toFixed(3)}")`, spinePanelEdge + hingeWidth / 2, boardY + 0.3, { align: 'center' });
      
      doc.setDrawColor(colors.safetyMarginColor);
      const coverSafeT = boardY + safetyMargin;
      const coverSafeB = boardY + currentBoardActualHeight - safetyMargin;
      
      const backSafeL = boardX + safetyMargin;
      const backSafeR = backCoverPanelEdge - safetyMargin;
      if (backSafeR > backSafeL && coverSafeB > coverSafeT) {
        doc.rect(backSafeL, coverSafeT, backSafeR - backSafeL, coverSafeB - coverSafeT, 'S');
      }
      
      const frontSafeL = rightHingeEdge + safetyMargin;
      const frontSafeR = boardX + currentBoardOverallWidth - safetyMargin; // Safety relative to overall board assembly width
      if (frontSafeR > frontSafeL && coverSafeB > coverSafeT) {
         doc.rect(frontSafeL, coverSafeT, frontSafeR - frontSafeL, coverSafeB - coverSafeT, 'S');
      }
      doc.setTextColor(colors.safetyMarginColor);
      doc.text(`Safety Margin (${safetyMargin.toFixed(3)}")`, boardX + safetyMargin + 0.05, boardY + safetyMargin + 0.15);

      doc.setTextColor(colors.textColor);
      doc.text('BACK COVER', boardX + frontPanelBoardWidth / 2, boardY + currentBoardActualHeight / 2, { align: 'center' });
      doc.text('FRONT COVER', rightHingeEdge + frontPanelBoardWidth / 2, boardY + currentBoardActualHeight / 2, { align: 'center' });
      doc.text('SPINE', leftHingeEdge + spineWidth / 2, boardY + currentBoardActualHeight / 2, { align: 'center', angle: -90 });
    } else {
        if (!isSoftcoverCoilWire && !isHardcoverCoilWire) { // Only show this error if not handled by coil/wire logic
            doc.text("Error: Could not determine PDF layout for the selected binding type or missing dimensions.", 0.5, 0.5);
        }
    }

    if (!(isSoftcoverCoilWire || isHardcoverCoilWire)) {
        doc.setTextColor(colors.textColor);
        let bottomTextY = totalCoverHeight - 0.15; 
        doc.text(`Total Size: ${totalCoverWidth.toFixed(3)}" x ${totalCoverHeight.toFixed(3)}"`, totalCoverWidth / 2, bottomTextY, { align: 'center' });
        doc.text(`Binding: ${bindingType}`, 0.05, bottomTextY);
        doc.text(`Trim: ${trimWidthNum.toFixed(3)}"x${trimHeightNum.toFixed(3)}"`, totalCoverWidth - 2.5, bottomTextY, {align: 'right'});
    }

    resolve(doc.output('blob'));
  });
};