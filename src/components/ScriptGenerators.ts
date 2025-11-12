// FIX: This entire file has been updated with corrected import paths and removed unused variables.

// FIX 1: Corrected path. Assumes 'types' are in a 'shared' folder at the root.
import { CoverCalculations, BindingType } from '@shared/types';
// FIX 2: Removed 'INCH_TO_POINTS' as it was unused according to the build log.
// The path to 'constants' is now '../constants' because this file is in 'src/components' and constants.ts is in 'src'.
// import { INCH_TO_POINTS } from '../constants'; // This line is removed.

export const generatePhotoshopScriptContent = (calculations: CoverCalculations): string => {
  const { 
    totalCoverWidth, totalCoverHeight, trimWidthNum, trimHeightNum, 
    spineWidth = 0, bindingType, safetyMargin = 0, 
    bleedAmount, wrapAmount, hingeWidth,
    boardHeight, frontPanelBoardWidth,
    safetyMarginTopBottom, safetyMarginBindingEdge, safetyMarginOutsideEdge, // For Coil/Wire-O
    boardExtension, // For Hardcover Coil/Wire-O
    pageCountNum // Added pageCountNum to be accessible here
  } = calculations;

  const docWidthInches = totalCoverWidth.toFixed(4);
  const docHeightInches = totalCoverHeight.toFixed(4);
  
  let bindTypeShortSpecific = "";
  let userTrimDisplay = `${trimWidthNum.toFixed(2)}x${trimHeightNum.toFixed(2)}`;
  let alertMessage = "";

  let script = `// Adobe Photoshop Script to Create ${bindingType} Book Cover Template
// Save this file as a .jsx and run it from File > Scripts > Browse...

#target photoshop
app.bringToFront();

// Document Setup
var docWidthInches = ${docWidthInches};
var docHeightInches = ${docHeightInches};
var resolution = 300; // Standard print resolution
`;

  if (bindingType === BindingType.CASE_BIND) {
    bindTypeShortSpecific = "CaseBound";
    script += `var docName = "BookCover_${bindTypeShortSpecific}_${userTrimDisplay}_${pageCountNum}p_Cover";\n`;
    alertMessage = `✅ ${bindingType} Book Cover Template Created!\\n\\nDocument Size: ${docWidthInches}\\" W × ${docHeightInches}\\" H @ " + resolution + "ppi\\nBoard Trim: ${userTrimDisplay}\\"\\nCalculated Spine: ${spineWidth.toFixed(3)}\\"\\nSafety Margin: ${safetyMargin.toFixed(3)}\\" from board edges.\\n\\nPlace all important text/logos inside safety area.`;
  } else if (bindingType === BindingType.PERFECT_BIND) {
    bindTypeShortSpecific = "PerfectBound";
    script += `var docName = "BookCover_${bindTypeShortSpecific}_${userTrimDisplay}_${pageCountNum}p_Cover";\n`;
    alertMessage = `✅ ${bindingType} Book Cover Template Created!\\n\\nDocument Size: ${totalCoverWidth.toFixed(4)}\\" W × ${totalCoverHeight.toFixed(4)}\\" H\\nTrim Area: ${trimWidthNum.toFixed(2)}\\" x ${trimHeightNum.toFixed(2)}\\"\\nSpine: ${spineWidth.toFixed(3)}\\"\\nSafety: ${safetyMargin.toFixed(3)}\\" from key edges.\\n\\nPlace all important text/logos inside safety area.`;

  } else if (bindingType === BindingType.COIL_WIRE_O_SOFTCOVER || bindingType === BindingType.COIL_WIRE_O_HARDCOVER) {
    const typeSuffix = bindingType === BindingType.COIL_WIRE_O_SOFTCOVER ? "Softcover_Front" : "Hardcover_Front";
    bindTypeShortSpecific = `CoilWireO_${typeSuffix}`;
    script += `var docName = "BookCover_${bindTypeShortSpecific}_${userTrimDisplay}_Cover";\n`;
    
    let details = `Document Size: ${docWidthInches}\\" W x ${docHeightInches}\\" H @ " + resolution + "ppi.`;
    if (bindingType === BindingType.COIL_WIRE_O_SOFTCOVER && bleedAmount) {
        details += `\\nTrim Size (Approx): ${trimWidthNum.toFixed(2)}\\" x ${trimHeightNum.toFixed(2)}\\" (after bleed is removed)`;
    } else if (bindingType === BindingType.COIL_WIRE_O_HARDCOVER && wrapAmount && boardExtension !== undefined) {
        details += `\\nBoard Size (Approx): ${(trimWidthNum + boardExtension).toFixed(2)}\\" x ${(trimHeightNum + boardExtension).toFixed(2)}\\" (before wrap is applied)`;
    }
    alertMessage = `✅ ${bindingType} (Front Cover) Template Created!\\n\\n${details}\\nThis script sets up the Front Cover. A similar setup is needed for the Back Cover, typically by duplicating and flipping this design, or referring to the PDF template for distinct back cover design needs.\\nCritical content should respect safety margins.`;

  } else {
    bindTypeShortSpecific = "Generic";
    script += `var docName = "BookCover_${bindTypeShortSpecific}_${userTrimDisplay}_Cover";\n`;
    alertMessage = `Book Cover Template Created!\\nDocument: ${docWidthInches}" W x ${docHeightInches}" H @ " + resolution + "ppi.`;
  }

  script += `
var newDoc = app.documents.add(
  UnitValue(docWidthInches, "in"),
  UnitValue(docHeightInches, "in"),
  resolution,
  docName,
  NewDocumentMode.CMYK
);

app.activeDocument = newDoc;

// Vertical Guides (X coordinates in inches from left edge)
// Horizontal Guides (Y coordinates in inches from top edge)
`;

  if (bindingType === BindingType.CASE_BIND && wrapAmount && hingeWidth && frontPanelBoardWidth && boardHeight && spineWidth !== undefined && safetyMargin !== undefined) {
    const boardStartX = wrapAmount; 
    const boardStartY = wrapAmount; 

    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${wrapAmount.toFixed(4)}, "in")); // Left Wrap Fold / Board Assembly Left Edge\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(totalCoverWidth - wrapAmount).toFixed(4)}, "in")); // Right Wrap Fold / Board Assembly Right Edge\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${wrapAmount.toFixed(4)}, "in")); // Top Wrap Fold / Board Assembly Top Edge\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(totalCoverHeight - wrapAmount).toFixed(4)}, "in")); // Bottom Wrap Fold / Board Assembly Bottom Edge\n`;

    const backCoverPanelRightEdgeX = boardStartX + frontPanelBoardWidth;
    const leftHingeRightEdgeX = backCoverPanelRightEdgeX + hingeWidth;
    const spinePanelRightEdgeX = leftHingeRightEdgeX + spineWidth;
    const rightHingeRightEdgeX = spinePanelRightEdgeX + hingeWidth;
    
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${backCoverPanelRightEdgeX.toFixed(4)}, "in")); // Back Cover Panel Right Edge / Left Hinge Left Edge\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${leftHingeRightEdgeX.toFixed(4)}, "in")); // Left Hinge Right Edge / Spine Panel Left Edge\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${spinePanelRightEdgeX.toFixed(4)}, "in")); // Spine Panel Right Edge / Right Hinge Left Edge\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${rightHingeRightEdgeX.toFixed(4)}, "in")); // Right Hinge Right Edge / Front Cover Panel Left Edge\n`;
    
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(boardStartX + safetyMargin).toFixed(4)}, "in")); // Back Cover Panel Safety Left\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(backCoverPanelRightEdgeX - safetyMargin).toFixed(4)}, "in")); // Back Cover Panel Safety Right\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(boardStartY + safetyMargin).toFixed(4)}, "in")); // Panels Safety Top\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(boardStartY + (boardHeight || 0) - safetyMargin).toFixed(4)}, "in")); // Panels Safety Bottom\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(rightHingeRightEdgeX + safetyMargin).toFixed(4)}, "in")); // Front Cover Panel Safety Left\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(rightHingeRightEdgeX + frontPanelBoardWidth - safetyMargin).toFixed(4)}, "in")); // Front Cover Panel Safety Right\n`;

  } else if (bindingType === BindingType.PERFECT_BIND && bleedAmount && spineWidth !== undefined && safetyMargin !== undefined) {
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${bleedAmount.toFixed(4)}, "in")); // Left Trim\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(totalCoverWidth - bleedAmount).toFixed(4)}, "in")); // Right Trim\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${bleedAmount.toFixed(4)}, "in")); // Top Trim\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(totalCoverHeight - bleedAmount).toFixed(4)}, "in")); // Bottom Trim\n`;

    const leftSpineFoldX = bleedAmount + trimWidthNum; 
    const rightSpineFoldX = leftSpineFoldX + spineWidth;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${leftSpineFoldX.toFixed(4)}, "in")); // Left Spine Fold\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${rightSpineFoldX.toFixed(4)}, "in")); // Right Spine Fold\n`;

    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(bleedAmount + safetyMargin).toFixed(4)}, "in")); // Back Safety Left\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(leftSpineFoldX - safetyMargin).toFixed(4)}, "in")); // Back Safety Right\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(bleedAmount + safetyMargin).toFixed(4)}, "in")); // Top Safety\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(totalCoverHeight - bleedAmount - safetyMargin).toFixed(4)}, "in")); // Bottom Safety\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(rightSpineFoldX + safetyMargin).toFixed(4)}, "in")); // Front Safety Left\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(totalCoverWidth - bleedAmount - safetyMargin).toFixed(4)}, "in")); // Front Safety Right\n`;
  } else if (bindingType === BindingType.COIL_WIRE_O_SOFTCOVER && bleedAmount && safetyMarginTopBottom && safetyMarginBindingEdge && safetyMarginOutsideEdge) {
    // Front Cover Guides for Softcover Coil/Wire-O
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${bleedAmount.toFixed(4)}, "in")); // Left Trim\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(totalCoverWidth - bleedAmount).toFixed(4)}, "in")); // Right Trim\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${bleedAmount.toFixed(4)}, "in")); // Top Trim\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(totalCoverHeight - bleedAmount).toFixed(4)}, "in")); // Bottom Trim\n`;

    const trimX = bleedAmount;
    const trimY = bleedAmount;
    const trimW = totalCoverWidth - 2 * bleedAmount; // This is trimWidthNum

    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(trimX + safetyMarginBindingEdge).toFixed(4)}, "in")); // Safety Binding Edge (Left for Front Cover)\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(trimX + trimW - safetyMarginOutsideEdge).toFixed(4)}, "in")); // Safety Outside Edge (Right for Front Cover)\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(trimY + safetyMarginTopBottom).toFixed(4)}, "in")); // Safety Top\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(totalCoverHeight - bleedAmount - safetyMarginTopBottom).toFixed(4)}, "in")); // Safety Bottom\n`;
  } else if (bindingType === BindingType.COIL_WIRE_O_HARDCOVER && wrapAmount && boardExtension !== undefined && safetyMarginTopBottom && safetyMarginBindingEdge && safetyMarginOutsideEdge) {
    // Front Cover Guides for Hardcover Coil/Wire-O
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${wrapAmount.toFixed(4)}, "in")); // Left Board Edge / Wrap Fold\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(totalCoverWidth - wrapAmount).toFixed(4)}, "in")); // Right Board Edge / Wrap Fold\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${wrapAmount.toFixed(4)}, "in")); // Top Board Edge / Wrap Fold\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(totalCoverHeight - wrapAmount).toFixed(4)}, "in")); // Bottom Board Edge / Wrap Fold\n`;
    
    // Safety margins for Hardcover Coil/Wire-O are typically larger and may be measured from the document (wrap) edge or board edge.
    // Assuming they are from the document (wrap) edge based on safetyMargin... variables.
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${safetyMarginBindingEdge.toFixed(4)}, "in")); // Safety Binding Edge (Left for Front Cover)\n`;
    script += `newDoc.guides.add(Direction.VERTICAL, UnitValue(${(totalCoverWidth - safetyMarginOutsideEdge).toFixed(4)}, "in")); // Safety Outside Edge (Right for Front Cover)\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${safetyMarginTopBottom.toFixed(4)}, "in")); // Safety Top\n`;
    script += `newDoc.guides.add(Direction.HORIZONTAL, UnitValue(${(totalCoverHeight - safetyMarginTopBottom).toFixed(4)}, "in")); // Safety Bottom\n`;
  }

  script += `
alert("${alertMessage.replace(/"/g, '\\"')}");

// End of script`;
  return script;
};

export const generateInDesignScriptContent = (calculations: CoverCalculations): string => {
  const { 
    totalCoverWidth, totalCoverHeight, trimWidthNum, trimHeightNum, 
    spineWidth = 0, bindingType, safetyMargin = 0, 
    bleedAmount, wrapAmount, hingeWidth,
    boardHeight, frontPanelBoardWidth,
    safetyMarginTopBottom, safetyMarginBindingEdge, safetyMarginOutsideEdge,
    boardExtension,
    pageCountNum // Added pageCountNum
  } = calculations;

  const docWidthIn = totalCoverWidth.toFixed(4);
  const docHeightIn = totalCoverHeight.toFixed(4);
  const userTrimDisplay = `${trimWidthNum.toFixed(2)}x${trimHeightNum.toFixed(2)}`;
  const bindingTypeForFilename = bindingType.replace(/[^a-zA-Z0-9]/g, '');
  
  let alertMessage = "";
  let scriptDocName = `BookCover_${bindingTypeForFilename}_${userTrimDisplay}_${pageCountNum || 'Coil'}p_Cover`;
  
  if (bindingType === BindingType.PERFECT_BIND) {
    alertMessage = `✅ ${bindingType} Book Cover Template Created!\\n\\nDocument Size: ${docWidthIn}\\" W × ${docHeightIn}\\" H\\nTrim Area: ${userTrimDisplay}\\"\\nSpine: ${spineWidth.toFixed(3)}\\"\\nSafety: ${safetyMargin.toFixed(3)}\\" from key edges.\\n\\nPlace all important text/logos inside safety area.`;
  } else if (bindingType === BindingType.CASE_BIND) {
    alertMessage = `✅ ${bindingType} Book Cover Template Created!\\n\\nDocument Size: ${docWidthIn}\\" W × ${docHeightIn}\\" H\\nBoard Trim: ${userTrimDisplay}\\"\\nCalculated Spine: ${spineWidth.toFixed(3)}\\"\\nSafety Margin: ${safetyMargin.toFixed(3)}\\" from board edges.\\n\\nPlace all important text/logos inside safety area.`;
  } else if (bindingType === BindingType.COIL_WIRE_O_SOFTCOVER) {
    scriptDocName = `BookCover_${bindingTypeForFilename}_${userTrimDisplay}_FrontCover`;
    alertMessage = `✅ Coil/Wire-O Softcover (Front Cover) Template Created!\\n\\nDocument Size: ${docWidthIn}\\" W × ${docHeightIn}\\" H\\n(Includes ${bleedAmount?.toFixed(3)}\\" bleed per edge)\\nApprox. Trim: ${userTrimDisplay}\\"\\nSafety: T/B ${safetyMarginTopBottom?.toFixed(3)}\\", Bind ${safetyMarginBindingEdge?.toFixed(3)}\\", Outer ${safetyMarginOutsideEdge?.toFixed(3)}\\" (from trim)\\n\\nThis script sets up the Front Cover. A similar setup is needed for the Back Cover.`;
  } else if (bindingType === BindingType.COIL_WIRE_O_HARDCOVER) {
    scriptDocName = `BookCover_${bindingTypeForFilename}_${userTrimDisplay}_FrontCover`;
    const boardW = trimWidthNum + (boardExtension || 0);
    const boardH = trimHeightNum + (boardExtension || 0);
    alertMessage = `✅ Coil/Wire-O Hardcover (Front Cover) Template Created!\\n\\nDocument Size: ${docWidthIn}\\" W × ${docHeightIn}\\" H\\n(Includes ${wrapAmount?.toFixed(3)}\\" wrap per edge)\\nApprox. Board Size: ${boardW.toFixed(2)}\\" x ${boardH.toFixed(2)}\\"\\nSafety: T/B ${safetyMarginTopBottom?.toFixed(3)}\\", Bind ${safetyMarginBindingEdge?.toFixed(3)}\\", Outer ${safetyMarginOutsideEdge?.toFixed(3)}\\" (from document edge)\\n\\nThis script sets up the Front Cover. A similar setup is needed for the Back Cover.`;
  } else { 
    alertMessage = `${bindingType} template setup. Details: ${docWidthIn}"W x ${docHeightIn}"H.`;
  }


  let script = `// Adobe InDesign Script to Create ${bindingType} Book Cover Template
// Save this file as a .jsx and run it from Window > Utilities > Scripts Panel.

#target indesign
try {
  var myDoc = app.documents.add(); 

  myDoc.documentPreferences.properties = {
    pageWidth: "${docWidthIn}in",
    pageHeight: "${docHeightIn}in",
    facingPages: false,
    pagesPerDocument: 1,
    documentBleedTopOffset: "0in", 
    documentBleedBottomOffset: "0in",
    documentBleedInsideOrLeftOffset: "0in",
    documentBleedOutsideOrRightOffset: "0in"
  };

  myDoc.viewPreferences.properties = {
    horizontalMeasurementUnits: MeasurementUnits.INCHES,
    verticalMeasurementUnits: MeasurementUnits.INCHES,
    rulerOrigin: RulerOrigin.PAGE_ORIGIN 
  };

  myDoc.name = "${scriptDocName}";

  var myPage = myDoc.pages.item(0);

  myPage.marginPreferences.properties = {
      top: "0in",
      bottom: "0in",
      left: "0in",
      right: "0in"
  };

  function addGuide(page, orientation, location_in_str) {
    try {
      page.guides.add(undefined, {
        orientation: orientation, 
        location: location_in_str + "in" 
      });
    } catch(e) { /* Log error if needed: // alert("Error adding guide: " + e); */ }
  }
`;

  if (bindingType === BindingType.CASE_BIND && wrapAmount && hingeWidth && frontPanelBoardWidth && boardHeight && spineWidth !== undefined && safetyMargin !== undefined) {
    const boardStartX = wrapAmount;
    const boardAssemblyRightEdge = totalCoverWidth - wrapAmount; 
    const boardStartY = wrapAmount;
    const boardAssemblyBottomEdge = totalCoverHeight - wrapAmount; 

    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${wrapAmount.toFixed(4)}"); // Left Wrap Fold / Board Assembly Left Edge\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${boardAssemblyRightEdge.toFixed(4)}"); // Right Wrap Fold / Board Assembly Right Edge\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${wrapAmount.toFixed(4)}"); // Top Wrap Fold / Board Assembly Top Edge\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${boardAssemblyBottomEdge.toFixed(4)}"); // Bottom Wrap Fold / Board Assembly Bottom Edge\n`;

    const backCoverPanelRightEdgeX = boardStartX + frontPanelBoardWidth;
    const leftHingeRightEdgeX = backCoverPanelRightEdgeX + hingeWidth;
    const spinePanelRightEdgeX = leftHingeRightEdgeX + spineWidth;
    const rightHingeRightEdgeX = spinePanelRightEdgeX + hingeWidth;

    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${backCoverPanelRightEdgeX.toFixed(4)}"); // Back Cover Panel Right / Left Hinge Left\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${leftHingeRightEdgeX.toFixed(4)}"); // Left Hinge Right / Spine Panel Left\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${spinePanelRightEdgeX.toFixed(4)}"); // Spine Panel Right / Right Hinge Left\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${rightHingeRightEdgeX.toFixed(4)}"); // Right Hinge Right / Front Cover Panel Left\n`;

    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(boardStartX + safetyMargin).toFixed(4)}"); // Back Panel Safety L\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(backCoverPanelRightEdgeX - safetyMargin).toFixed(4)}"); // Back Panel Safety R\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(boardStartY + safetyMargin).toFixed(4)}"); // Panels Safety Top\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(boardStartY + (boardHeight || 0) - safetyMargin).toFixed(4)}"); // Panels Safety Bottom\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(rightHingeRightEdgeX + safetyMargin).toFixed(4)}"); // Front Panel Safety L\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(rightHingeRightEdgeX + frontPanelBoardWidth - safetyMargin).toFixed(4)}"); // Front Panel Safety R\n`;

  } else if (bindingType === BindingType.PERFECT_BIND && bleedAmount && spineWidth !== undefined && safetyMargin !== undefined) {
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${bleedAmount.toFixed(4)}"); // Left Trim\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(totalCoverWidth - bleedAmount).toFixed(4)}"); // Right Trim\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${bleedAmount.toFixed(4)}"); // Top Trim\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(totalCoverHeight - bleedAmount).toFixed(4)}"); // Bottom Trim\n`;
    
    const leftSpineFoldX = bleedAmount + trimWidthNum; 
    const rightSpineFoldX = leftSpineFoldX + spineWidth;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${leftSpineFoldX.toFixed(4)}"); // Left Spine Fold\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${rightSpineFoldX.toFixed(4)}"); // Right Spine Fold\n`;

    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(bleedAmount + safetyMargin).toFixed(4)}"); // Back Safety L\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(leftSpineFoldX - safetyMargin).toFixed(4)}"); // Back Safety R\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(bleedAmount + safetyMargin).toFixed(4)}"); // Top Safety\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(totalCoverHeight - bleedAmount - safetyMargin).toFixed(4)}"); // Bottom Safety\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(rightSpineFoldX + safetyMargin).toFixed(4)}"); // Front Safety L\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(totalCoverWidth - bleedAmount - safetyMargin).toFixed(4)}"); // Front Safety R\n`;
  } else if (bindingType === BindingType.COIL_WIRE_O_SOFTCOVER && bleedAmount && safetyMarginTopBottom && safetyMarginBindingEdge && safetyMarginOutsideEdge) {
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${bleedAmount.toFixed(4)}"); // Left Trim\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(totalCoverWidth - bleedAmount).toFixed(4)}"); // Right Trim\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${bleedAmount.toFixed(4)}"); // Top Trim\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(totalCoverHeight - bleedAmount).toFixed(4)}"); // Bottom Trim\n`;

    const trimX = bleedAmount;
    const trimW = totalCoverWidth - 2 * bleedAmount; // This is trimWidthNum

    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(trimX + safetyMarginBindingEdge).toFixed(4)}"); // Safety Binding Edge (Left for Front Cover)\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(trimX + trimW - safetyMarginOutsideEdge).toFixed(4)}"); // Safety Outside Edge (Right for Front Cover)\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(trimX + safetyMarginTopBottom).toFixed(4)}"); // Safety Top\n`; // Note: trimY is bleedAmount
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(totalCoverHeight - bleedAmount - safetyMarginTopBottom).toFixed(4)}"); // Safety Bottom\n`;
  } else if (bindingType === BindingType.COIL_WIRE_O_HARDCOVER && wrapAmount && boardExtension !== undefined && safetyMarginTopBottom && safetyMarginBindingEdge && safetyMarginOutsideEdge) {
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${wrapAmount.toFixed(4)}"); // Left Board Edge / Wrap Fold\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(totalCoverWidth - wrapAmount).toFixed(4)}"); // Right Board Edge / Wrap Fold\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${wrapAmount.toFixed(4)}"); // Top Board Edge / Wrap Fold\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(totalCoverHeight - wrapAmount).toFixed(4)}"); // Bottom Board Edge / Wrap Fold\n`;
    
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${safetyMarginBindingEdge.toFixed(4)}"); // Safety Binding Edge (Left for Front Cover)\n`;
    script += `addGuide(myPage, HorizontalOrVertical.VERTICAL, "${(totalCoverWidth - safetyMarginOutsideEdge).toFixed(4)}"); // Safety Outside Edge (Right for Front Cover)\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${safetyMarginTopBottom.toFixed(4)}"); // Safety Top\n`;
    script += `addGuide(myPage, HorizontalOrVertical.HORIZONTAL, "${(totalCoverHeight - safetyMarginTopBottom).toFixed(4)}"); // Safety Bottom\n`;
  }

  script += `
  alert("${alertMessage.replace(/"/g, '\\"')}");
} catch(e) {
  alert("❌ Error:\\n" + e.toString() + "\\nLine: " + e.line);
}
// End of script`;
  return script;
};

export const generateInteriorIDMLCreationScript = (trimWidth: number, trimHeight: number, recommendedGutterInches: number): string => {
  const bleed = 0.125;
  const topMargin = 0.5;
  const bottomMargin = 0.5;
  const outsideMargin = 0.5;

  const orientation = trimHeight >= trimWidth ? "PORTRAIT" : "LANDSCAPE";
  const scriptFileNameBase = `interior-template-${trimWidth.toFixed(1).replace('.', '_')}x${trimHeight.toFixed(1).replace('.', '_')}`;

  let script = `// Adobe InDesign Script to Create Interior Page IDML Template
// Save this file as a .jsx and run it from Window > Utilities > Scripts Panel.

#target indesign

try {
    var doc = app.documents.add();

    doc.documentPreferences.properties = {
        pageWidth: "${trimWidth.toFixed(3)}in",
        pageHeight: "${trimHeight.toFixed(3)}in",
        pageOrientation: PageOrientation.${orientation},
        facingPages: true,
        pagesPerDocument: 1, 
        documentBleedTopOffset: "${bleed.toFixed(3)}in",
        documentBleedBottomOffset: "${bleed.toFixed(3)}in",
        documentBleedInsideOrLeftOffset: "${bleed.toFixed(3)}in",
        documentBleedOutsideOrRightOffset: "${bleed.toFixed(3)}in"
    };

    doc.viewPreferences.properties = { 
        horizontalMeasurementUnits: MeasurementUnits.INCHES,
        verticalMeasurementUnits: MeasurementUnits.INCHES,
        rulerOrigin: RulerOrigin.PAGE_ORIGIN
    };
    
    doc.name = "${scriptFileNameBase}";

    var myPage = doc.pages.item(0); // First page (recto by default)
    myPage.marginPreferences.properties = {
        top: "${topMargin.toFixed(3)}in",
        bottom: "${bottomMargin.toFixed(3)}in",
        left: "${recommendedGutterInches.toFixed(3)}in", // Inside margin (Gutter for recto)
        right: "${outsideMargin.toFixed(3)}in"           // Outside margin for recto
    };

    if (doc.masterSpreads.length > 0) {
        var masterSpread = doc.masterSpreads.item(0); 
        for (var i = 0; i < masterSpread.pages.length; i++) {
            var masterPage = masterSpread.pages.item(i);
            if (masterPage.side == PageSideOptions.LEFT_HAND) { // Verso (Left Page)
                 masterPage.marginPreferences.properties = {
                    top: "${topMargin.toFixed(3)}in",
                    bottom: "${bottomMargin.toFixed(3)}in",
                    left: "${outsideMargin.toFixed(3)}in",        
                    right: "${recommendedGutterInches.toFixed(3)}in" 
                };
            } else { // RIGHT_HAND (Recto)
                 masterPage.marginPreferences.properties = {
                    top: "${topMargin.toFixed(3)}in",
                    bottom: "${bottomMargin.toFixed(3)}in",
                    left: "${recommendedGutterInches.toFixed(3)}in", 
                    right: "${outsideMargin.toFixed(3)}in"          
                };
            }
        }
    }
    
    var idmlFile = new File(Folder.myDocuments + "/${scriptFileNameBase}.idml"); 
    idmlFile = idmlFile.saveDlg("Save Interior IDML Template As:", "IDML Files:*.idml", false); // false for multiple file types is default

    if (idmlFile) {
        doc.exportFile(ExportFormat.INDESIGN_MARKUP, idmlFile, false); 
        doc.close(SaveOptions.NO); 
        alert("✅ IDML template ('" + idmlFile.name + "') saved!\\n\\nLocation: " + File.decode(idmlFile.fsName) + "\\n\\nPage Size: ${trimWidth.toFixed(3)}\\" x ${trimHeight.toFixed(3)}\\"\\nMargins: Top/Bottom ${topMargin.toFixed(3)}\\", Outside ${outsideMargin.toFixed(3)}\\", Gutter ${recommendedGutterInches.toFixed(3)}\\"\\nBleed: ${bleed.toFixed(3)}\\" all sides.");
    } else {
        doc.close(SaveOptions.NO); 
        alert("IDML export cancelled by user.");
    }

} catch(e) {
    alert("❌ An error occurred: " + e.toString() + "\\nLine: " + e.line);
}

// End of script
`;
  return script;
};