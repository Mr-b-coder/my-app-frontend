
import { PaperStockOption, BindingType } from "@shared/types";

// Shared Bleed Amount
export const STANDARD_BLEED_AMOUNT_INCHES = 0.125;

// Perfect Bind Specific
export const PERFECT_BIND_SAFETY_MARGIN_INCHES = 0.375;

// Case Bind Specific
export const CASE_BIND_WRAP_MARGIN_INCHES = 0.75;
export const CASE_BIND_HINGE_WIDTH_INCHES = 0.5;
export const CASE_BIND_SAFETY_MARGIN_INCHES = 0.5;

// Coil Bind & Wire-O Bind Specific (Softcover)
export const COIL_WIRE_O_SAFETY_MARGIN_TOP_BOTTOM_INCHES = 0.5;
export const COIL_WIRE_O_SAFETY_MARGIN_OUTSIDE_EDGE_INCHES = 0.5;
export const COIL_WIRE_O_SAFETY_MARGIN_BINDING_EDGE_INCHES = 0.625;

// Coil Bind & Wire-O Bind Specific (Hardcover)
export const HARDCOVER_COIL_WIRE_O_WRAP_AMOUNT_INCHES = 0.75; // Per side
export const HARDCOVER_COIL_WIRE_O_BOARD_EXTENSION_INCHES = 0.25; // Total extension to trim size for board
export const HARDCOVER_COIL_WIRE_O_SAFETY_TOP_BOTTOM_INCHES = 1.0;
export const HARDCOVER_COIL_WIRE_O_SAFETY_OUTSIDE_EDGE_INCHES = 1.0;
export const HARDCOVER_COIL_WIRE_O_SAFETY_BINDING_EDGE_INCHES = 1.375;


export const PAPER_STOCK_OPTIONS: PaperStockOption[] = [
  { name: "Select Paper Stock", ppi: 0 },
  //{ name: "50# Uncoated – 510 PPI", ppi: 510 },
  { name: "60# Uncoated", ppi: 435 },
  { name: "70# Uncoated", ppi: 415 },
  //{ name: "80# Gloss Text – 520 PPI", ppi: 520 },
  { name: " 80# coated (silk, gloss, matte)", ppi: 475 },
  //{ name: "80# Uncoated – 333 PPI", ppi: 333 },
  { name: "100# coated (silk, gloss, matte)", ppi: 360 },
  { name: "100# Uncoated", ppi: 256 },
];

export const DEFAULT_BINDING_TYPE = BindingType.PERFECT_BIND;

// General constants
export const INCH_TO_POINTS = 72;