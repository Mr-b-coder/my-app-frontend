// shared/types.ts

// FIX: Added the missing PaperStockOption interface at the bottom of this file.

export enum BindingType {
  PERFECT_BIND = 'Perfect Bind / Softcover',
  CASE_BIND = 'Case Bind / Hardcover',
  COIL_WIRE_O_SOFTCOVER = 'Coil / Wire-O - Softcover',
  COIL_WIRE_O_HARDCOVER = 'Coil / Wire-O - Hardcover',
}

export interface BookCoverFormData {
  bookTitle: string;
  pageCount: string;
  paperStockPPI: string;
  trimWidth: string;
  trimHeight: string;
  bindingType: BindingType | '';
}

export interface CoverCalculations {
  bookTitle?: string;
  pageCountNum?: number;
  ppiNum?: number;
  trimWidthNum: number;
  trimHeightNum: number;
  bindingType: BindingType;
  totalCoverWidth: number;
  totalCoverHeight: number;
  spineWidth?: number;
  bleedAmount?: number;
  wrapAmount?: number;
  hingeWidth?: number;
  frontPanelBoardWidth?: number;
  boardWidth?: number;
  boardHeight?: number;
  safetyMargin?: number;
  boardExtension?: number;
  safetyMarginTopBottom?: number;
  safetyMarginBindingEdge?: number;
  safetyMarginOutsideEdge?: number;
}

// Add this interface to fix the error from constants.ts
export interface PaperStockOption {
  name: string;
  ppi: number;
}