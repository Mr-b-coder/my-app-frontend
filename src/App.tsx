import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import bwipjs from 'bwip-js';
import { BookCoverFormData, CoverCalculations, BindingType } from '@shared/types';
import {
  PAPER_STOCK_OPTIONS,
  STANDARD_BLEED_AMOUNT_INCHES,
  PERFECT_BIND_SAFETY_MARGIN_INCHES,
  CASE_BIND_WRAP_MARGIN_INCHES,
  CASE_BIND_HINGE_WIDTH_INCHES,
  CASE_BIND_SAFETY_MARGIN_INCHES,
  COIL_WIRE_O_SAFETY_MARGIN_TOP_BOTTOM_INCHES,
  COIL_WIRE_O_SAFETY_MARGIN_BINDING_EDGE_INCHES,
  COIL_WIRE_O_SAFETY_MARGIN_OUTSIDE_EDGE_INCHES,
  HARDCOVER_COIL_WIRE_O_WRAP_AMOUNT_INCHES,
  HARDCOVER_COIL_WIRE_O_BOARD_EXTENSION_INCHES,
  HARDCOVER_COIL_WIRE_O_SAFETY_TOP_BOTTOM_INCHES,
  HARDCOVER_COIL_WIRE_O_SAFETY_BINDING_EDGE_INCHES,
  HARDCOVER_COIL_WIRE_O_SAFETY_OUTSIDE_EDGE_INCHES
} from './constants';
import Input from './components/Input';
import Select from './components/Select';
import Button from './components/Button';
import CheckIcon from './components/CheckIcon';
import InteractiveInteriorSetup from './components/InteractiveInteriorSetup';
import { TemplatePreview } from './components/TemplatePreview';
import { ClipboardIcon } from './components/ClipboardIcons';
import ZipFileIcon from './components/ZipFileIcon';
import ChevronIcon from './components/ChevronIcon';
import BarcodeIcon from './components/BarcodeIcon';
import { ThemeToggleButton } from './components/ThemeSwitcher';

// Helper function to calculate EAN-13 check digit
const calculateEAN13CheckDigit = (isbnWithoutCheck: string): number => {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbnWithoutCheck[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
};

interface SummaryLine {
  label: string;
  value: string;
}

// Function to generate lines for the condensed summary
const getCondensedSummaryLines = (calculations: CoverCalculations | null): SummaryLine[] => {
  if (!calculations) return [];
  const {
    bookTitle,
    bindingType, trimWidthNum, trimHeightNum, pageCountNum,
    spineWidth, totalCoverWidth, totalCoverHeight
  } = calculations;

  const formatNumber = (num: number | undefined, precision: number = 3): string => {
    if (typeof num === 'number' && !isNaN(num)) {
      return num.toFixed(precision);
    }
    return 'N/A';
  };

  const lines: SummaryLine[] = [];

  if (bookTitle) {
    lines.push({ label: "Book Title:", value: bookTitle });
  }
  lines.push({ label: "Book Trim Size:", value: `${formatNumber(trimWidthNum)}W x ${formatNumber(trimHeightNum)}H inches` });
  if (pageCountNum) {
    lines.push({ label: "Pages:", value: `${pageCountNum}` });
  }
  lines.push({ label: "Cover Size:", value: `${formatNumber(totalCoverWidth)}W x ${formatNumber(totalCoverHeight)}H inches` });
  lines.push({ label: "Binding:", value: bindingType });
  if (spineWidth !== undefined && spineWidth > 0) {
    lines.push({ label: "Spine Width:", value: `${formatNumber(spineWidth)} inches` });
  }

  return lines;
};


const App: React.FC = () => {
  const [formData, setFormData] = useState<BookCoverFormData>({
    bookTitle: '',
    pageCount: '',
    paperStockPPI: PAPER_STOCK_OPTIONS[0]?.ppi.toString() || '0',
    trimWidth: '',
    trimHeight: '',
    bindingType: '',
  });
  const [calculatedDimensions, setCalculatedDimensions] = useState<CoverCalculations | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingFormat, setCurrentProcessingFormat] = useState<string | null>(null);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const summaryTimeoutRef = useRef<number | null>(null);
  const [showTechnicalGuides, setShowTechnicalGuides] = useState(true);
  const [showDownloadOptionsSet, setShowDownloadOptionsSet] = useState(false);
  const [activePreviewSection, setActivePreviewSection] = useState<'cover' | 'interior' | null>(null);
  const [showBookSpecAndSummary, setShowBookSpecAndSummary] = useState(true);
  const [showBarcodeGeneratorUI, setShowBarcodeGeneratorUI] = useState(false);
  const [selectedCustomBarcodeType, setSelectedCustomBarcodeType] = useState<'isbn' | 'datamatrix'>('isbn');
  const [rawIsbnInput, setRawIsbnInput] = useState('');
  const [rawPriceInput, setRawPriceInput] = useState('');
  const [displayIsbnText, setDisplayIsbnText] = useState('');
  const [displayPriceText, setDisplayPriceText] = useState('');
  const [ean13Data, setEan13Data] = useState<string | null>(null);
  const [isbnBarcodeError, setIsbnBarcodeError] = useState<string | null>(null);
  const [ean13ImageDataUrl, setEan13ImageDataUrl] = useState<string | null>(null);
  const [ean5ImageDataUrl, setEan5ImageDataUrl] = useState<string | null>(null);
  const [isIsbnBarcodeProcessing, setIsIsbnBarcodeProcessing] = useState(false);
  const [combinedIsbnPricePreviewUrl, setCombinedIsbnPricePreviewUrl] = useState<string | null>(null);
  const ean13CanvasRef = useRef<HTMLCanvasElement>(null);
  const ean5CanvasRef = useRef<HTMLCanvasElement>(null);
  const combinedScratchCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dataMatrixInput, setDataMatrixInput] = useState('');
  const [dataMatrixImageDataUrl, setDataMatrixImageDataUrl] = useState<string | null>(null);
  const [dataMatrixError, setDataMatrixError] = useState<string | null>(null);
  const [isDataMatrixProcessing, setIsDataMatrixProcessing] = useState(false);
  const dataMatrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPageDetailsRequired = useCallback((bindingType: BindingType | '') => {
    if (!bindingType) return false;
    return bindingType === BindingType.PERFECT_BIND || bindingType === BindingType.CASE_BIND;
  }, []);
  const currentBindingRequiresPageData = useMemo(() => isPageDetailsRequired(formData.bindingType), [formData.bindingType, isPageDetailsRequired]);

  const handleTemplateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setError(null);
    setCalculatedDimensions(null);
    setActivePreviewSection(null);
    setShowDownloadOptionsSet(false);

    if (name === "bindingType") {
      const newBindingType = value as BindingType | '';
      if (newBindingType === '' || !isPageDetailsRequired(newBindingType)) {
        setFormData(prev => ({ ...prev, pageCount: '', paperStockPPI: PAPER_STOCK_OPTIONS[0]?.ppi.toString() || '0', bindingType: newBindingType }));
      } else {
        setFormData(prev => ({ ...prev, bindingType: newBindingType }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRawIsbnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawIsbnInput(e.target.value);
    setIsbnBarcodeError(null);
  };
  const handleRawPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => { setRawPriceInput(e.target.value); };
  const handleDataMatrixInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { setDataMatrixInput(e.target.value); setDataMatrixError(null); };

  const formatISBNForAltext = (isbn: string): string => {
    if (isbn.length === 13 && !isbn.includes('-')) {
      const pattern1 = /(\d{3})(\d{1})(\d{3})(\d{5})(\d{1})/; const pattern2 = /(\d{3})(\d{2})(\d{2})(\d{5})(\d{1})/; const pattern3 = /(\d{3})(\d{1})(\d{4})(\d{4})(\d{1})/;
      if (pattern1.test(isbn)) return `ISBN ${isbn.replace(pattern1, '$1-$2-$3-$4-$5')}`;
      if (pattern2.test(isbn)) return `ISBN ${isbn.replace(pattern2, '$1-$2-$3-$4-$5')}`;
      if (pattern3.test(isbn)) return `ISBN ${isbn.replace(pattern3, '$1-$2-$3-$4-$5')}`;
    } return isbn.startsWith('ISBN ') ? isbn : `ISBN ${isbn}`;
  };

  useEffect(() => {
    const originalInput = rawIsbnInput; const cleaned = rawIsbnInput.replace(/[-\s]/g, '');
    setIsbnBarcodeError(null); setEan13ImageDataUrl(null);
    if (!cleaned) { setEan13Data(null); setDisplayIsbnText(''); return; }
    let finalEan13 = ''; let displayIsbnForText = originalInput.trim();
    if (cleaned.length === 10) {
      if (!/^\d{9}[\dX]$/i.test(cleaned)) { setIsbnBarcodeError('Invalid ISBN-10 format.'); setEan13Data(null); return; }
      const eanPrefix = '978' + cleaned.substring(0, 9); const checkDigit = calculateEAN13CheckDigit(eanPrefix); finalEan13 = eanPrefix + checkDigit;
      const p1 = finalEan13.substring(0, 3), p2 = finalEan13.substring(3, 4), p3 = finalEan13.substring(4, 7), p4 = finalEan13.substring(7, 12), p5 = finalEan13.substring(12, 13);
      displayIsbnForText = `${p1}-${p2}-${p3}-${p4}-${p5}`;
    } else if (cleaned.length === 13) {
      if (!/^\d{13}$/.test(cleaned)) { setIsbnBarcodeError('Invalid ISBN-13 characters.'); setEan13Data(null); return; }
      const calculatedCheck = calculateEAN13CheckDigit(cleaned.substring(0, 12));
      if (parseInt(cleaned[12], 10) !== calculatedCheck) { setIsbnBarcodeError('Invalid ISBN-13 check digit.'); setEan13Data(null); return; }
      finalEan13 = cleaned;
      if (!originalInput.includes('-')) {
        const p1 = finalEan13.substring(0, 3), p2 = finalEan13.substring(3, 4), p3 = finalEan13.substring(4, 7), p4 = finalEan13.substring(7, 12), p5 = finalEan13.substring(12, 13);
        displayIsbnForText = `${p1}-${p2}-${p3}-${p4}-${p5}`;
      } else { displayIsbnForText = originalInput; }
    } else { setIsbnBarcodeError('ISBN must be 10 or 13 digits.'); setEan13Data(null); setDisplayIsbnText(''); return; }
    setEan13Data(finalEan13);
    setDisplayIsbnText(formatISBNForAltext(displayIsbnForText));
    if (finalEan13 && ean13CanvasRef.current) {
      const canvas = ean13CanvasRef.current; canvas.width = 800; canvas.height = 600;
      try {
        bwipjs.toCanvas(canvas, { bcid: 'ean13', text: finalEan13, scale: 4, height: 20, includetext: true, textxalign: 'center' });
        setEan13ImageDataUrl(canvas.toDataURL('image/png'));
      } catch (e) { console.error("EAN-13 generation error:", e); setIsbnBarcodeError('Failed to generate ISBN barcode.'); setEan13ImageDataUrl(null); }
    }
  }, [rawIsbnInput]);

  useEffect(() => {
    const priceInput = rawPriceInput.trim();

    if (priceInput === '') {
      setDisplayPriceText('');
      setEan5ImageDataUrl(null);
      return;
    }

    let ean5Data = '';
    let priceDisplayText = '';
    const priceNum = parseFloat(priceInput);

    if (priceInput === '90000') {
      ean5Data = '90000';
      priceDisplayText = 'NPI >';
    } 
    else if (!isNaN(priceNum) && priceNum >= 0 && priceNum <= 999.99) {
      const currencyPrefix = '5';
      const cents = Math.round(priceNum * 100).toString().padStart(4, '0');
      ean5Data = currencyPrefix + cents;
      priceDisplayText = `$${priceNum.toFixed(2)} >`;
    } 
    else {
      setDisplayPriceText('');
      setEan5ImageDataUrl(null);
      return;
    }

    setDisplayPriceText(priceDisplayText);

    if (ean5Data && ean5CanvasRef.current && ean13Data) {
      const canvas = ean5CanvasRef.current;
      canvas.width = 400;
      canvas.height = 600;
      try {
        bwipjs.toCanvas(canvas, {
          bcid: 'ean5',
          text: ean5Data,
          scale: 4,
          height: 20,
          includetext: true,
          textxalign: 'center',
        });
        setEan5ImageDataUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error("EAN-5 generation error:", e);
        setEan5ImageDataUrl(null);
      }
    } else {
      setEan5ImageDataUrl(null);
    }
  }, [rawPriceInput, ean13Data]);

  useEffect(() => {
    const generateCombinedPreview = async () => {
      if (!ean13ImageDataUrl || !displayIsbnText || !combinedScratchCanvasRef.current) { setCombinedIsbnPricePreviewUrl(null); return; }
      const canvas = combinedScratchCanvasRef.current; const ctx = canvas.getContext('2d');
      if (!ctx) { setCombinedIsbnPricePreviewUrl(null); return; }

      const ean13Image = new Image();
      const ean5Image = new Image();
      const imageLoadPromises = [];
      let ean13Loaded = false;
      let ean5Loaded = false;

      imageLoadPromises.push(new Promise<void>((resolve, reject) => { ean13Image.onload = () => { ean13Loaded = true; resolve(); }; ean13Image.onerror = () => reject(new Error("Failed to load EAN-13 image for preview.")); ean13Image.src = ean13ImageDataUrl; }));
      
      const showPriceArea = rawPriceInput.trim() !== '' && ean5ImageDataUrl && displayPriceText;

      if (showPriceArea) { 
        imageLoadPromises.push(new Promise<void>((resolve, reject) => { ean5Image.onload = () => { ean5Loaded = true; resolve(); }; ean5Image.onerror = () => reject(new Error("Failed to load EAN-5 image for preview.")); ean5Image.src = ean5ImageDataUrl!; })); 
      }
      
      try {
        await Promise.all(imageLoadPromises);
        if (!ean13Loaded) { setCombinedIsbnPricePreviewUrl(null); return; }

        const PREVIEW_FONT_SIZE_PX = 12; const PREVIEW_TEXT_FONT = `bold ${PREVIEW_FONT_SIZE_PX}px 'Courier New', Courier, monospace`;
        const PREVIEW_PADDING = 5; const PREVIEW_TEXT_IMAGE_GAP = 3; const PREVIEW_SECTION_GAP = showPriceArea ? 10 : 0;
        
        ctx.font = PREVIEW_TEXT_FONT;
        const isbnTextMetrics = ctx.measureText(displayIsbnText);
        const priceTextMetrics = showPriceArea ? ctx.measureText(displayPriceText!) : { width: 0 };
        const isbnSectionWidth = Math.max(isbnTextMetrics.width, ean13Image.naturalWidth);
        const priceSectionWidth = showPriceArea ? Math.max(priceTextMetrics.width, ean5Image.naturalWidth) : 0;
        const totalTextHeight = PREVIEW_FONT_SIZE_PX;
        const maxImageHeight = Math.max(ean13Image.naturalHeight, showPriceArea && ean5Loaded ? ean5Image.naturalHeight : 0);
        
        canvas.width = PREVIEW_PADDING * 2 + isbnSectionWidth + (showPriceArea ? PREVIEW_SECTION_GAP + priceSectionWidth : 0);
        canvas.height = PREVIEW_PADDING * 2 + totalTextHeight + PREVIEW_TEXT_IMAGE_GAP + maxImageHeight;
        
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#000000';
        ctx.font = PREVIEW_TEXT_FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        
        const isbnTextX = PREVIEW_PADDING + isbnSectionWidth / 2;
        const textY = PREVIEW_PADDING + totalTextHeight / 2;
        
        ctx.fillText(displayIsbnText, isbnTextX, textY);
        ctx.drawImage(ean13Image, PREVIEW_PADDING + (isbnSectionWidth - ean13Image.naturalWidth) / 2, PREVIEW_PADDING + totalTextHeight + PREVIEW_TEXT_IMAGE_GAP);
        
        if (showPriceArea && ean5Loaded) {
          const priceTextX = PREVIEW_PADDING + isbnSectionWidth + PREVIEW_SECTION_GAP + priceSectionWidth / 2;
          ctx.fillText(displayPriceText!, priceTextX, textY);
          ctx.drawImage(ean5Image, PREVIEW_PADDING + isbnSectionWidth + PREVIEW_SECTION_GAP + (priceSectionWidth - ean5Image.naturalWidth) / 2, PREVIEW_PADDING + totalTextHeight + PREVIEW_TEXT_IMAGE_GAP);
        }

        setCombinedIsbnPricePreviewUrl(canvas.toDataURL('image/png'));
      } catch (err) { console.error("Error generating combined preview:", err); setCombinedIsbnPricePreviewUrl(null); setIsbnBarcodeError("Preview generation failed."); }
    };
    generateCombinedPreview();
  }, [displayIsbnText, ean13ImageDataUrl, rawPriceInput, displayPriceText, ean5ImageDataUrl, ean13Data]);

  useEffect(() => {
    setDataMatrixError(null); setDataMatrixImageDataUrl(null);
    if (!dataMatrixInput.trim()) { return; }
    if (dataMatrixCanvasRef.current) {
      const canvas = dataMatrixCanvasRef.current; canvas.width = 300; canvas.height = 300;
      try {
        bwipjs.toCanvas(canvas, { bcid: 'datamatrix', text: dataMatrixInput, scale: 5, width: 25, height: 25, backgroundcolor: "FFFFFF" });
        setDataMatrixImageDataUrl(canvas.toDataURL('image/png'));
      } catch (e) { console.error("Data Matrix generation error:", e); setDataMatrixError('Failed to generate Data Matrix barcode. Check input data.'); setDataMatrixImageDataUrl(null); }
    }
  }, [dataMatrixInput]);

  const calculateCoverDimensions = useCallback(() => {
    setError(null);
    if (!formData.bindingType) { setError("Please select a binding type."); return null; }
    const pageCountNum = parseInt(formData.pageCount);
    const ppiNum = parseFloat(formData.paperStockPPI);
    const trimWidthNum = parseFloat(formData.trimWidth);
    const trimHeightNum = parseFloat(formData.trimHeight);

    if (trimWidthNum <= 0 || trimHeightNum <= 0) { setError("Trim width and height must be positive numbers."); return null; }
    if (isPageDetailsRequired(formData.bindingType)) {
      if (isNaN(pageCountNum) || pageCountNum <= 0) { setError("Page count must be a positive number for this binding type."); return null; }
      if (isNaN(ppiNum) || ppiNum <= 0) { setError("Please select a valid paper stock for this binding type."); return null; }
    }

    let calculations: CoverCalculations = {
      bookTitle: formData.bookTitle?.trim() || undefined,
      pageCountNum: !isNaN(pageCountNum) ? pageCountNum : undefined,
      ppiNum: !isNaN(ppiNum) ? ppiNum : undefined,
      trimWidthNum,
      trimHeightNum,
      bindingType: formData.bindingType as BindingType,
      totalCoverWidth: 0,
      totalCoverHeight: 0,
      spineWidth: 0,
      bleedAmount: 0,
      wrapAmount: 0,
      hingeWidth: 0,
      boardWidth: 0,
      boardHeight: 0,
      boardExtension: 0,
      frontPanelBoardWidth: 0,
      safetyMargin: 0,
      safetyMarginTopBottom: 0,
      safetyMarginBindingEdge: 0,
      safetyMarginOutsideEdge: 0
    };

    if (formData.bindingType === BindingType.PERFECT_BIND) {
      const spineWidth = (pageCountNum / ppiNum);
      calculations.spineWidth = spineWidth;
      calculations.bleedAmount = STANDARD_BLEED_AMOUNT_INCHES;
      calculations.totalCoverWidth = (trimWidthNum * 2) + spineWidth + (calculations.bleedAmount * 2);
      calculations.totalCoverHeight = trimHeightNum + (calculations.bleedAmount * 2);
      calculations.safetyMargin = PERFECT_BIND_SAFETY_MARGIN_INCHES;
    } else if (formData.bindingType === BindingType.CASE_BIND) {
      const boardThickness = 0.098;
      const textBlockThickness = pageCountNum / ppiNum;
      const spineSqueezeFactor = 0.03;
      const spineBoardWidth = textBlockThickness + (2 * boardThickness) - spineSqueezeFactor;
      calculations.spineWidth = spineBoardWidth > 0 ? spineBoardWidth : 0;
      calculations.frontPanelBoardWidth = trimWidthNum - 0.125;
      calculations.boardHeight = trimHeightNum + 0.25;
      calculations.hingeWidth = CASE_BIND_HINGE_WIDTH_INCHES;
      calculations.wrapAmount = CASE_BIND_WRAP_MARGIN_INCHES;
      calculations.safetyMargin = CASE_BIND_SAFETY_MARGIN_INCHES;
      const boardAssemblyWidth = (calculations.frontPanelBoardWidth * 2) + (calculations.hingeWidth * 2) + calculations.spineWidth;
      calculations.boardWidth = boardAssemblyWidth;
      calculations.totalCoverWidth = (trimWidthNum * 2) + (boardThickness * 2) + calculations.spineWidth + (2 * calculations.wrapAmount) + 0.25;
      calculations.totalCoverHeight = calculations.boardHeight + (calculations.wrapAmount * 2);
      calculations.bleedAmount = 0;
    } else if (formData.bindingType === BindingType.COIL_WIRE_O_SOFTCOVER) {
        calculations.bleedAmount = STANDARD_BLEED_AMOUNT_INCHES;
        calculations.totalCoverWidth = trimWidthNum + (calculations.bleedAmount * 2);
        calculations.totalCoverHeight = trimHeightNum + (calculations.bleedAmount * 2);
        calculations.safetyMargin = COIL_WIRE_O_SAFETY_MARGIN_OUTSIDE_EDGE_INCHES;
        calculations.safetyMarginTopBottom = COIL_WIRE_O_SAFETY_MARGIN_TOP_BOTTOM_INCHES;
        calculations.safetyMarginBindingEdge = COIL_WIRE_O_SAFETY_MARGIN_BINDING_EDGE_INCHES;
        calculations.safetyMarginOutsideEdge = COIL_WIRE_O_SAFETY_MARGIN_OUTSIDE_EDGE_INCHES;
    } else if (formData.bindingType === BindingType.COIL_WIRE_O_HARDCOVER) {
        calculations.wrapAmount = HARDCOVER_COIL_WIRE_O_WRAP_AMOUNT_INCHES;
        calculations.boardExtension = HARDCOVER_COIL_WIRE_O_BOARD_EXTENSION_INCHES;
        calculations.boardHeight = trimHeightNum + calculations.boardExtension;
        calculations.totalCoverWidth = (trimWidthNum + calculations.boardExtension) + (calculations.wrapAmount * 2);
        calculations.totalCoverHeight = calculations.boardHeight + (calculations.wrapAmount * 2);
        calculations.safetyMargin = HARDCOVER_COIL_WIRE_O_SAFETY_OUTSIDE_EDGE_INCHES;
        calculations.safetyMarginTopBottom = HARDCOVER_COIL_WIRE_O_SAFETY_TOP_BOTTOM_INCHES;
        calculations.safetyMarginBindingEdge = HARDCOVER_COIL_WIRE_O_SAFETY_BINDING_EDGE_INCHES;
        calculations.safetyMarginOutsideEdge = HARDCOVER_COIL_WIRE_O_SAFETY_OUTSIDE_EDGE_INCHES;
        calculations.bleedAmount = 0;
    }
    return calculations;
  }, [formData, isPageDetailsRequired]);

  const handleTemplateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dimensions = calculateCoverDimensions();
    setCalculatedDimensions(dimensions);
    setShowDownloadOptionsSet(!!dimensions);
    if (dimensions) {
      setActivePreviewSection('cover');
      setShowBookSpecAndSummary(true);
    } else {
      setActivePreviewSection(null);
    }
  };

  const handleDownload = async (packageType: 'all' | 'cover' | 'interior') => {
    if (!calculatedDimensions) return;
    let formatLabel = "Package";
    if (packageType === 'all') formatLabel = "Full Production Package";
    if (packageType === 'cover') formatLabel = "Cover Package";
    if (packageType === 'interior') formatLabel = "Interior Package";

    setIsProcessing(true);
    setCurrentProcessingFormat(formatLabel);
    setError(null);

    try {
      const selectedPaper = PAPER_STOCK_OPTIONS.find(opt => opt.ppi.toString() === formData.paperStockPPI);
      
      const payload = {
        packageType: packageType,
        bindingName: calculatedDimensions.bindingType,
        bindingType: formData.bindingType,
        pageCount: calculatedDimensions.pageCountNum ?? 0,
        paperStock: selectedPaper ? selectedPaper.name : 'N/A',
        totalWidth: calculatedDimensions.totalCoverWidth,
        totalHeight: calculatedDimensions.totalCoverHeight,
        trimWidth: calculatedDimensions.trimWidthNum,
        trimHeight: calculatedDimensions.trimHeightNum,
        spineWidth: calculatedDimensions.spineWidth ?? 0,
        bleed: calculatedDimensions.bleedAmount ?? 0,
        wrapAmount: calculatedDimensions.wrapAmount ?? 0,
        hingeWidth: calculatedDimensions.hingeWidth ?? 0,
        boardWidth: calculatedDimensions.boardWidth ?? 0,
        boardHeight: calculatedDimensions.boardHeight ?? 0,
        boardExtension: calculatedDimensions.boardExtension ?? 0,
        frontPanelBoardWidth: calculatedDimensions.frontPanelBoardWidth ?? 0,
        safetyMargin: calculatedDimensions.safetyMargin ?? 0,
        safetyMarginTopBottom: calculatedDimensions.safetyMarginTopBottom ?? 0,
        safetyMarginBindingEdge: calculatedDimensions.safetyMarginBindingEdge ?? 0,
        safetyMarginOutsideEdge: calculatedDimensions.safetyMarginOutsideEdge ?? 0,
        bookTitle: calculatedDimensions.bookTitle || 'Untitled',
      };

      const response = await fetch('http://localhost:3001/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errData.error || `Server responded with status ${response.status}.`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = "template-package.zip";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err: any) {
      console.error(`Download ${packageType} error:`, err);
      setError(`Failed to generate package: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setCurrentProcessingFormat(null);
    }
  };

  const summaryForClipboard = (): string => {
    return getCondensedSummaryLines(calculatedDimensions).map(line => `${line.label} ${line.value}`).join('\n');
  };

  const copySummaryToClipboard = () => {
    const textToCopy = summaryForClipboard();
    navigator.clipboard.writeText(textToCopy).then(() => {
      setSummaryCopied(true);
      if (summaryTimeoutRef.current) {
        clearTimeout(summaryTimeoutRef.current);
      }
      summaryTimeoutRef.current = window.setTimeout(() => {
        setSummaryCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy summary: ', err);
      alert('Failed to copy summary to clipboard.');
    });
  };

  const handleDownloadCustomBarcode = async (format: 'JPEG' | 'PDF') => {
    if (!ean13Data || !ean13ImageDataUrl) {
      setIsbnBarcodeError("No valid ISBN barcode data to download."); return;
    }
    
    const shouldIncludePriceAddon = rawPriceInput.trim() !== '' && ean5ImageDataUrl;
    
    if (rawPriceInput.trim() !== '' && !ean5ImageDataUrl) {
      setIsbnBarcodeError("Price barcode image not yet rendered or failed."); return;
    }

    setIsIsbnBarcodeProcessing(true);
    setCurrentProcessingFormat(format === 'JPEG' ? 'BARCODE_JPEG' : 'BARCODE_PDF');
    setIsbnBarcodeError(null);

    try {
      const ean13Image = new Image(); const ean5Image = new Image();
      const imageLoadPromises = [];
      
      imageLoadPromises.push(new Promise<void>((resolve, reject) => {
        ean13Image.onload = () => resolve();
        ean13Image.onerror = () => reject(new Error("Failed to load EAN-13 image."));
        ean13Image.src = ean13ImageDataUrl;
      }));

      if (shouldIncludePriceAddon) {
        imageLoadPromises.push(new Promise<void>((resolve, reject) => {
          ean5Image.onload = () => resolve();
          ean5Image.onerror = () => reject(new Error("Failed to load EAN-5 image."));
          ean5Image.src = ean5ImageDataUrl!;
        }));
      }

      await Promise.all(imageLoadPromises);
      
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) { throw new Error("Could not get canvas context for download."); }
      
      const FONT_SIZE_PX = 30; const TEXT_FONT = `bold ${FONT_SIZE_PX}px 'Courier New', Courier, monospace`;
      const PADDING = 20; const SECTION_GAP = shouldIncludePriceAddon ? 20 : 0;
      const TEXT_IMAGE_GAP = 10;
      
      ctx.font = TEXT_FONT;
      const isbnTextMetrics = ctx.measureText(displayIsbnText);
      const priceTextMetrics = shouldIncludePriceAddon ? ctx.measureText(displayPriceText) : { width: 0 };
      const isbnSectionWidth = Math.max(isbnTextMetrics.width, ean13Image.naturalWidth);
      const priceSectionWidth = shouldIncludePriceAddon ? Math.max(priceTextMetrics.width, ean5Image.naturalWidth) : 0;
      const totalTextHeight = FONT_SIZE_PX;
      const maxImageHeight = Math.max(ean13Image.naturalHeight, shouldIncludePriceAddon ? ean5Image.naturalHeight : 0);
      
      tempCanvas.width = PADDING * 2 + isbnSectionWidth + (shouldIncludePriceAddon ? SECTION_GAP + priceSectionWidth : 0);
      tempCanvas.height = PADDING * 2 + totalTextHeight + TEXT_IMAGE_GAP + maxImageHeight;
      
      ctx.font = TEXT_FONT; ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.fillStyle = '#000000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      
      const isbnTextX = PADDING + isbnSectionWidth / 2;
      const textY = PADDING + totalTextHeight / 2;
      
      ctx.fillText(displayIsbnText, isbnTextX, textY);
      ctx.drawImage(ean13Image, PADDING + (isbnSectionWidth - ean13Image.naturalWidth) / 2, PADDING + totalTextHeight + TEXT_IMAGE_GAP);
      
      if (shouldIncludePriceAddon) {
        const priceTextX = PADDING + isbnSectionWidth + SECTION_GAP + priceSectionWidth / 2;
        ctx.fillText(displayPriceText, priceTextX, textY);
        ctx.drawImage(ean5Image, PADDING + isbnSectionWidth + SECTION_GAP + (priceSectionWidth - ean5Image.naturalWidth) / 2, PADDING + totalTextHeight + TEXT_IMAGE_GAP);
      }
      
      const fileNameBase = `barcode-${ean13Data}`;
      if (format === 'JPEG') {
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 1.0);
        const link = document.createElement('a');
        link.href = dataUrl; link.download = `${fileNameBase}.jpeg`;
        link.click();
      } else if (format === 'PDF') {
        const imgData = tempCanvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: tempCanvas.width > tempCanvas.height ? 'l' : 'p', unit: 'pt', format: [tempCanvas.width, tempCanvas.height] });
        pdf.addImage(imgData, 'PNG', 0, 0, tempCanvas.width, tempCanvas.height);
        pdf.save(`${fileNameBase}.pdf`);
      }
    } catch (err) {
      console.error("Error downloading custom ISBN barcode:", err);
      setIsbnBarcodeError("Failed to download ISBN barcode. " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsIsbnBarcodeProcessing(false);
      setCurrentProcessingFormat(null);
    }
  };

  const handleDownloadDataMatrixBarcode = async (format: 'JPEG' | 'PDF') => {
    if (!dataMatrixImageDataUrl || !dataMatrixInput.trim()) {
      setDataMatrixError("No valid Data Matrix barcode data to download."); return;
    }
    setIsDataMatrixProcessing(true);
    setCurrentProcessingFormat(format === 'JPEG' ? 'DATAMATRIX_JPEG' : 'DATAMATRIX_PDF');
    setDataMatrixError(null);
    try {
      const dataMatrixImage = new Image();
      await new Promise<void>((resolve, reject) => {
        dataMatrixImage.onload = () => resolve();
        dataMatrixImage.onerror = () => reject(new Error("Failed to load Data Matrix image for download."));
        dataMatrixImage.src = dataMatrixImageDataUrl;
      });
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) { throw new Error("Could not get canvas context for Data Matrix download."); }
      const FONT_SIZE_PX_DM = 96; const TEXT_FONT_DM = `${FONT_SIZE_PX_DM}px sans-serif`;
      const PADDING_DM = 20; const TEXT_IMAGE_GAP_DM = 15;
      ctx.font = TEXT_FONT_DM; const textMetrics = ctx.measureText(dataMatrixInput);
      const approxTextHeight = FONT_SIZE_PX_DM * 1.2;
      tempCanvas.width = PADDING_DM * 2 + Math.max(dataMatrixImage.naturalWidth, textMetrics.width);
      tempCanvas.height = PADDING_DM * 2 + dataMatrixImage.naturalHeight + TEXT_IMAGE_GAP_DM + approxTextHeight;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const imageX = (tempCanvas.width - dataMatrixImage.naturalWidth) / 2;
      const imageY = PADDING_DM;
      ctx.drawImage(dataMatrixImage, imageX, imageY);
      ctx.font = TEXT_FONT_DM; ctx.fillStyle = '#000000';
      const textX = tempCanvas.width / 2;
      const textY = imageY + dataMatrixImage.naturalHeight + TEXT_IMAGE_GAP_DM + approxTextHeight / 2;
      ctx.fillText(dataMatrixInput, textX, textY);
      const safeFilenamePart = dataMatrixInput.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
      const fileNameBase = `datamatrix-${safeFilenamePart || 'barcode'}`;
      if (format === 'JPEG') {
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.href = dataUrl; link.download = `${fileNameBase}.jpeg`;
        link.click();
      } else if (format === 'PDF') {
        const imgData = tempCanvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: tempCanvas.width > tempCanvas.height ? 'l' : 'p', unit: 'pt', format: [tempCanvas.width, tempCanvas.height] });
        pdf.addImage(imgData, 'PNG', 0, 0, tempCanvas.width, tempCanvas.height);
        pdf.save(`${fileNameBase}.pdf`);
      }
    } catch (err) {
      console.error("Error downloading Data Matrix barcode:", err);
      setDataMatrixError("Failed to download Data Matrix barcode image. " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDataMatrixProcessing(false);
      setCurrentProcessingFormat(null);
    }
  };

  useEffect(() => {
    return () => {
      if (summaryTimeoutRef.current) {
        clearTimeout(summaryTimeoutRef.current);
      }
    };
  }, []);

  const paperStockOptionsForSelect = PAPER_STOCK_OPTIONS.map(opt => ({ value: opt.ppi.toString(), label: opt.name }));
  const bindingTypeOptionsForSelect = [{ value: '', label: "Select Binding Type" }, ...Object.values(BindingType).map(bt => ({ value: bt, label: bt }))];
  const condensedSummaryLines = useMemo(() => getCondensedSummaryLines(calculatedDimensions), [calculatedDimensions]);
  const legendColorMapping = { bleed: '#FF6B6B', wrap: '#FF6B6B', trim: '#4A90E2', safety: '#22C55E', spine: '#9013FE', hinge: '#F5A623', board: '#444444', };
  const currentLegendItems = useMemo(() => {
    if (!calculatedDimensions) return [];
    const items: { label: string, color: string, type: 'line' | 'line-dashed' | 'box' }[] = [];
    const { bindingType } = calculatedDimensions;
    if (bindingType === BindingType.PERFECT_BIND) {
      items.push({ label: 'Bleed Edge', color: legendColorMapping.bleed, type: 'line' }, { label: 'Trim Line / Fold', color: legendColorMapping.trim, type: 'line' }, { label: 'Spine Area', color: legendColorMapping.spine, type: 'box' }, { label: 'Safety Margin', color: legendColorMapping.safety, type: 'line-dashed' });
    } else if (bindingType === BindingType.CASE_BIND) {
      items.push({ label: 'Wrap Edge', color: legendColorMapping.wrap, type: 'line' }, { label: 'Board Area / Fold', color: legendColorMapping.board, type: 'box' }, { label: 'Hinge Area', color: legendColorMapping.hinge, type: 'box' }, { label: 'Spine Board Area', color: legendColorMapping.spine, type: 'box' }, { label: 'Safety Margin', color: legendColorMapping.safety, type: 'line-dashed' });
    } else if (bindingType === BindingType.COIL_WIRE_O_SOFTCOVER) {
      items.push({ label: 'Bleed Edge', color: legendColorMapping.bleed, type: 'line' }, { label: 'Trim Line', color: legendColorMapping.trim, type: 'line' }, { label: 'Safety Margin', color: legendColorMapping.safety, type: 'line-dashed' });
    } else if (bindingType === BindingType.COIL_WIRE_O_HARDCOVER) {
      items.push({ label: 'Wrap Edge', color: legendColorMapping.wrap, type: 'line' }, { label: 'Board Area / Fold', color: legendColorMapping.board, type: 'box' }, { label: 'Safety Margin', color: legendColorMapping.safety, type: 'line-dashed' });
    }
    return items;
  }, [calculatedDimensions, legendColorMapping]);
  const togglePreviewSection = (section: 'cover' | 'interior') => { setActivePreviewSection(prev => (prev === section ? null : section)); };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col min-h-screen">
      <header className="mb-6 md:mb-8">
        <div className="flex justify-between items-center">
          <div className="text-2xl md:text-3xl font-bold">Acutrack</div>
          <div className="flex items-center space-x-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Template Generator</h1>
            <ThemeToggleButton />
          </div>
        </div>
      </header>

      <canvas ref={ean13CanvasRef} style={{ display: 'none' }}></canvas>
      <canvas ref={ean5CanvasRef} style={{ display: 'none' }}></canvas>
      <canvas ref={dataMatrixCanvasRef} style={{ display: 'none' }}></canvas>
      <canvas ref={combinedScratchCanvasRef} style={{ display: 'none' }}></canvas>

      <div className="grid lg:grid-cols-12 gap-8 items-start flex-grow">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[#1E293B] p-0 shadow-lg rounded-lg border border-[#DDE3ED] dark:border-[#334155]" aria-labelledby="barcode-generator-heading">
            <button
              onClick={() => setShowBarcodeGeneratorUI(!showBarcodeGeneratorUI)}
              className="w-full p-4 bg-[#DDE3ED] dark:bg-[#334155] hover:bg-[#A8B8D0] dark:hover:bg-[#475569] rounded-t-lg flex justify-between items-center text-left"
              aria-expanded={showBarcodeGeneratorUI}
              aria-controls="barcode-generator-content"
            >
              <div className="flex items-center space-x-2">
                <BarcodeIcon className="text-[#0A2F5C] dark:text-[#13B5CF]" />
                <h2 id="barcode-generator-heading" className="text-xl font-semibold">
                  Generate Barcode Image
                </h2>
              </div>
              <ChevronIcon isOpen={showBarcodeGeneratorUI} />
            </button>
            {showBarcodeGeneratorUI && (
              <div id="barcode-generator-content" className="p-6 bg-white dark:bg-[#1E293B] rounded-b-lg border-t border-[#DDE3ED] dark:border-[#334155]">
                <div className="mb-6 flex space-x-1 border-b border-[#DDE3ED] dark:border-[#334155]">
                  <Button
                    variant={selectedCustomBarcodeType === 'isbn' ? 'primary' : 'outline'}
                    onClick={() => setSelectedCustomBarcodeType('isbn')}
                    className={`flex-1 rounded-b-none py-2 px-3 text-sm sm:text-base ${selectedCustomBarcodeType === 'isbn' ? 'border-b-transparent -mb-px !bg-[#0A2F5C] dark:!bg-[#13B5CF] !text-white dark:!text-[#0F172A]' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    ISBN Barcode
                  </Button>
                  <Button
                    variant={selectedCustomBarcodeType === 'datamatrix' ? 'primary' : 'outline'}
                    onClick={() => setSelectedCustomBarcodeType('datamatrix')}
                    className={`flex-1 rounded-b-none py-2 px-3 text-sm sm:text-base ${selectedCustomBarcodeType === 'datamatrix' ? 'border-b-transparent -mb-px !bg-[#0A2F5C] dark:!bg-[#13B5CF] !text-white dark:!text-[#0F172A]' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    Data Matrix
                  </Button>
                </div>
                {selectedCustomBarcodeType === 'isbn' && (
                  <div>
                    <div className="space-y-4 mb-6">
                      <Input
                        label="ISBN (10 or 13 digits)"
                        id="customIsbn"
                        name="customIsbn"
                        value={rawIsbnInput}
                        onChange={handleRawIsbnChange}
                        placeholder="e.g., 978-3-16-148410-0"
                      />
                      <Input
                        label="Price (USD) - Optional"
                        id="customPrice"
                        name="customPrice"
                        type="text"
                        value={rawPriceInput}
                        onChange={handleRawPriceChange}
                        placeholder="e.g., 24.95 or 90000 for NPI"
                      />
                      {isbnBarcodeError && <p className="text-red-500 text-sm mt-1">{isbnBarcodeError}</p>}
                    </div>
                    <div className="mt-6 pt-6 border-t border-[#DDE3ED] dark:border-[#334155]">
                      <div className="p-4 border border-[#A8B8D0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] rounded-md min-h-[150px] flex items-center justify-center mb-4">
                        {combinedIsbnPricePreviewUrl ? (
                          <img
                            src={combinedIsbnPricePreviewUrl}
                            alt="ISBN/Price Barcode Preview"
                            className="max-w-full h-auto object-contain mx-auto"
                          />
                        ) : (rawIsbnInput.trim() ? (
                          <div className="text-slate-500 text-sm text-center">
                            {isbnBarcodeError ? isbnBarcodeError : 'Generating preview...'}
                          </div>
                        ) : (
                          <div className="text-slate-500 text-sm text-center">
                            Your ISBN barcode will appear here.
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex space-x-3 justify-center">
                        <Button
                          onClick={() => handleDownloadCustomBarcode('JPEG')}
                          disabled={!ean13Data || !!isbnBarcodeError || isIsbnBarcodeProcessing}
                          variant="primary" size="sm"
                        >
                          {isIsbnBarcodeProcessing && currentProcessingFormat === 'BARCODE_JPEG' ? 'Processing...' : 'Download Barcode (JPEG)'}
                        </Button>
                        <Button
                          onClick={() => handleDownloadCustomBarcode('PDF')}
                          disabled={!ean13Data || !!isbnBarcodeError || isIsbnBarcodeProcessing}
                          variant="secondary" size="sm"
                        >
                          {isIsbnBarcodeProcessing && currentProcessingFormat === 'BARCODE_PDF' ? 'Processing...' : 'Download Barcode (PDF)'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {selectedCustomBarcodeType === 'datamatrix' && (
                  <div>
                    <div className="space-y-4 mb-6">
                      <Input
                        label="Data Matrix Text"
                        id="dataMatrixText"
                        name="dataMatrixText"
                        value={dataMatrixInput}
                        onChange={handleDataMatrixInputChange}
                        placeholder="e.g., INH27385"
                      />
                      {dataMatrixError && <p className="text-red-500 text-sm mt-1">{dataMatrixError}</p>}
                    </div>
                    <div className="mt-6 pt-6 border-t border-[#DDE3ED] dark:border-[#334155]">
                      <div className="p-4 border border-[#A8B8D0] dark:border-[#334155] rounded-md bg-[#F8FAFC] dark:bg-[#0F172A] min-h-[150px] flex flex-col items-center justify-center mb-4 space-y-2">
                        {dataMatrixImageDataUrl ? (
                          <>
                            <img src={dataMatrixImageDataUrl} alt="Data Matrix Barcode" className="max-w-[150px] max-h-[150px] object-contain" />
                            <div className="text-4xl mt-2 font-sans break-all text-center">{dataMatrixInput}</div>
                          </>
                        ) : (dataMatrixInput.trim() !== '' ? (
                          <div className="text-slate-500 text-sm text-center">
                            {dataMatrixError ? dataMatrixError : 'Generating preview...'}
                          </div>
                        ) : (
                          <div className="text-slate-500 text-sm text-center">
                            Your Data Matrix code will appear here.
                          </div>
                        )
                        )}
                      </div>
                      <div className="mt-4 flex space-x-3 justify-center">
                        <Button
                          onClick={() => handleDownloadDataMatrixBarcode('JPEG')}
                          disabled={!dataMatrixImageDataUrl || !!dataMatrixError || isDataMatrixProcessing}
                          variant="primary" size="sm"
                        >
                          {isDataMatrixProcessing && currentProcessingFormat === 'DATAMATRIX_JPEG' ? 'Processing...' : 'Download Barcode (JPEG)'}
                        </Button>
                        <Button
                          onClick={() => handleDownloadDataMatrixBarcode('PDF')}
                          disabled={!dataMatrixImageDataUrl || !!dataMatrixError || isDataMatrixProcessing}
                          variant="secondary" size="sm"
                        >
                          {isDataMatrixProcessing && currentProcessingFormat === 'DATAMATRIX_PDF' ? 'Processing...' : 'Download Barcode (PDF)'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-0 shadow-lg rounded-lg border border-[#DDE3ED] dark:border-[#334155]" aria-labelledby="book-spec-summary-heading">
            <button
              onClick={() => setShowBookSpecAndSummary(!showBookSpecAndSummary)}
              className="w-full p-4 bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#DDE3ED] dark:hover:bg-[#334155] rounded-t-lg flex justify-between items-center text-left"
              aria-expanded={showBookSpecAndSummary}
              aria-controls="book-spec-summary-content"
            >
              <h2 id="book-spec-summary-heading" className="text-xl font-semibold">
                Book Specifications & Summary
              </h2>
              <ChevronIcon isOpen={showBookSpecAndSummary} />
            </button>
            {showBookSpecAndSummary && (
              <div id="book-spec-summary-content" className="p-6 bg-white dark:bg-[#1E293B] rounded-b-lg border-t border-[#DDE3ED] dark:border-[#334155]">
                <h3 className="text-lg font-medium mb-4 border-b border-[#DDE3ED] dark:border-[#334155] pb-2">
                  1. Book Specifications
                </h3>
                <form onSubmit={handleTemplateFormSubmit} className="space-y-5">
                  <Input label="Book Title (Optional)" id="bookTitle" name="bookTitle" value={formData.bookTitle || ''} onChange={handleTemplateFormChange} placeholder="e.g., My Awesome Novel" />
                  <Input label="Trim Width" id="trimWidth" type="number" name="trimWidth" value={formData.trimWidth} onChange={handleTemplateFormChange} unit="inches" placeholder="e.g., 6" required step="0.001" min="1" />
                  <Input label="Trim Height" id="trimHeight" type="number" name="trimHeight" value={formData.trimHeight} onChange={handleTemplateFormChange} unit="inches" placeholder="e.g., 9" required step="0.001" min="1" />
                  <Select
                    label="Binding Type"
                    id="bindingType"
                    name="bindingType"
                    value={formData.bindingType}
                    onChange={handleTemplateFormChange}
                    options={bindingTypeOptionsForSelect}
                    required
                  />
                  {currentBindingRequiresPageData && (
                    <>
                      <Input label="Page Count (Total)" id="pageCount" type="number" name="pageCount" value={formData.pageCount} onChange={handleTemplateFormChange} placeholder="e.g., 200" required={currentBindingRequiresPageData} min="2" />
                      <Select label="Paper Stock (Interior)" id="paperStockPPI" name="paperStockPPI" value={formData.paperStockPPI} onChange={handleTemplateFormChange} options={paperStockOptionsForSelect} required={currentBindingRequiresPageData} />
                    </>
                  )}
                  {!currentBindingRequiresPageData && formData.bindingType && ( <p className="text-sm text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">Page count and paper stock are not required for <span className="font-semibold">{formData.bindingType}</span> template generation.</p> )}
                  <Button type="submit" variant="primary" className="w-full" disabled={isProcessing}>Get your files</Button>
                  {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}
                </form>

                {calculatedDimensions && (
                  <div className="mt-8 pt-6 border-t border-[#DDE3ED] dark:border-[#334155]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Book Summary:</h3>
                      <Button onClick={copySummaryToClipboard} variant="outline" size="sm" leftIcon={summaryCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4" />}> {summaryCopied ? 'Copied!' : 'Copy'} </Button>
                    </div>
                    <div className="text-sm bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-md overflow-x-auto custom-scrollbar leading-normal">
                      {condensedSummaryLines.map((line, index) => ( <p key={index} className="whitespace-pre-wrap">{line.label} <strong className="font-semibold">{line.value}</strong></p> ))}
                      {showDownloadOptionsSet && (
                        <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700 space-y-4">
                          <h3 className="text-lg font-medium">Download Your Files</h3>
                          {isProcessing && currentProcessingFormat && ( <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-sm text-center"> Generating {currentProcessingFormat}... Please wait. </div> )}
                          <Button onClick={() => handleDownload('all')} leftIcon={<ZipFileIcon />} disabled={isProcessing} variant="primary" className="w-full"> Download All Files (Cover & Interior) </Button>
                          <div className="flex space-x-3">
                            <Button onClick={() => handleDownload('cover')} leftIcon={<ZipFileIcon />} disabled={isProcessing} variant="secondary" className="flex-1"> Download Cover Files </Button>
                            <Button onClick={() => handleDownload('interior')} leftIcon={<ZipFileIcon />} disabled={isProcessing} variant="secondary" className="flex-1"> Download Interior Files </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <section className="bg-white dark:bg-[#1E293B] p-6 shadow-lg rounded-lg border border-[#DDE3ED] dark:border-[#334155] lg:col-span-8" aria-labelledby="results-preview-heading">
          <h2 id="results-preview-heading" className="text-2xl font-semibold mb-6 border-b border-[#DDE3ED] dark:border-[#334155] pb-3"> Previews & Setup Guides </h2>
          {calculatedDimensions ? (
            <div className="space-y-6">
              <div className="border border-[#DDE3ED] dark:border-[#334155] rounded-lg">
                <button onClick={() => togglePreviewSection('cover')} className="w-full p-3 bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#DDE3ED] dark:hover:bg-[#334155] rounded-t-lg flex justify-between items-center text-left font-medium" aria-expanded={activePreviewSection === 'cover'} aria-controls="cover-preview-content">
                  <span>Cover Template Preview:</span>
                  <ChevronIcon isOpen={activePreviewSection === 'cover'} />
                </button>
                {activePreviewSection === 'cover' && (
                  <div id="cover-preview-content" className="p-4 bg-white dark:bg-[#1E293B] rounded-b-lg border-t border-[#DDE3ED] dark:border-[#334155]">
                    <div className="flex justify-end items-center mb-1">
                      <label htmlFor="showTechnicalGuidesToggle" className="flex items-center text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" id="showTechnicalGuidesToggle" checked={showTechnicalGuides} onChange={() => setShowTechnicalGuides(!showTechnicalGuides)} className="mr-1 h-3 w-3 rounded border-slate-300 dark:border-slate-600 text-blue-600 dark:text-cyan-400 focus:ring-blue-500 dark:focus:ring-cyan-500 dark:focus:ring-offset-slate-800" /> Show Technical Guides
                      </label>
                    </div>
                    <div className="border border-[#DDE3ED] dark:border-[#334155] rounded p-2 bg-[#F8FAFC] dark:bg-[#0F172A] aspect-[1.414] md:aspect-[1.6] lg:aspect-[1.7] flex items-center justify-center">
                      <TemplatePreview calculations={calculatedDimensions} showTechnicalGuides={showTechnicalGuides} />
                    </div>
                    {calculatedDimensions && currentLegendItems.length > 0 && (
                      <div className="mt-3 text-sm">
                        <h4 className="font-medium text-slate-600 dark:text-slate-400 mb-2">Legend:</h4>
                        <div className="flex flex-wrap justify-start items-center gap-x-4 gap-y-1">
                          {currentLegendItems.map(item => (
                            <div key={item.label} className="flex items-center">
                              {item.type === 'box' ? ( <span className="w-3 h-3 inline-block mr-1.5 border border-slate-400 dark:border-slate-600" style={{ backgroundColor: item.color }} aria-hidden="true"></span> ) : ( <span className="w-4 h-0.5 inline-block mr-1.5" style={{ backgroundColor: item.color, borderStyle: item.type === 'line-dashed' ? 'dashed' : 'solid', borderWidth: '2px', borderColor: item.color }} aria-hidden="true"></span> )}
                              <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="border border-[#DDE3ED] dark:border-[#334155] rounded-lg">
                <button onClick={() => togglePreviewSection('interior')} className="w-full p-3 bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#DDE3ED] dark:hover:bg-[#334155] rounded-t-lg flex justify-between items-center text-left font-medium" aria-expanded={activePreviewSection === 'interior'} aria-controls="interior-setup-content">
                  <span>Interior Page Setup Guide</span>
                  <ChevronIcon isOpen={activePreviewSection === 'interior'} />
                </button>
                {activePreviewSection === 'interior' && calculatedDimensions && (
                  <div id="interior-setup-content" className="p-0 bg-white dark:bg-[#1E293B] rounded-b-lg border-t border-[#DDE3ED] dark:border-[#334155]">
                    <InteractiveInteriorSetup pageCount={calculatedDimensions.pageCountNum} trimWidth={calculatedDimensions.trimWidthNum} trimHeight={calculatedDimensions.trimHeightNum} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-10"> Complete the book specifications and click "Get your files" to see your previews and download links. </p>
          )}
        </section>
      </div>

      <footer className="mt-auto pt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Template Generator. All rights reserved.</p>
        <p className="mt-1">Important: Always confirm template dimensions with your printer before final production.</p>
      </footer>
    </div>
  );
};

export default App;