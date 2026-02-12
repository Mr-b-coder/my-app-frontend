/**
 * PDF analysis: call backend for dimensions + page count; optionally detect color in-browser.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface PageDimensionInches {
  widthInches: number;
  heightInches: number;
}

export interface BoxInches {
  widthInches: number;
  heightInches: number;
}

export interface FirstPageBoxes {
  bleedBox: BoxInches;
  trimBox: BoxInches;
}

export interface PdfAnalysisResult {
  pageCount: number;
  pageDimensions: PageDimensionInches[];
  firstPageWidthInches: number;
  firstPageHeightInches: number;
  consistentSize: boolean;
  /** Document title from PDF metadata, when present. */
  title?: string;
  /** First page Media/Crop/Bleed/Trim boxes in inches. */
  firstPageBoxes?: FirstPageBoxes;
}

/** Analyze PDF via backend (file as base64 or URL). Returns dimensions and page count. */
export async function analyzePdfFromBackend(
  options: { fileBase64?: string; pdfUrl?: string }
): Promise<PdfAnalysisResult> {
  try {
    const { data } = await axios.post<PdfAnalysisResult>(`${API_BASE}/api/analyze-pdf`, options, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.error ?? err.response?.data?.message;
      const status = err.response?.status;
      if (status === 413) {
        throw new Error('File too large for the server. Ensure the deployed backend allows large payloads (e.g. 1GB).');
      }
      if (msg && typeof msg === 'string') {
        throw new Error(msg);
      }
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        throw new Error(
          `Cannot reach the PDF analysis server. Check that the backend is running and VITE_API_URL (e.g. ${API_BASE}) is correct.`
        );
      }
      throw new Error(err.message || 'PDF analysis failed.');
    }
    throw err;
  }
}

/** Convert File to base64 string. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64 ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
