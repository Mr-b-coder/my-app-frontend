/**
 * Detect if a PDF uses color or is grayscale by rendering sample pages to canvas
 * and checking pixel data. Uses pdfjs-dist (must be loaded before calling).
 */

import * as pdfjsLib from 'pdfjs-dist';
// Vite resolves worker URL at build time
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

let workerInitialized = false;
function ensureWorker() {
  if (workerInitialized) return;
  (pdfjsLib as typeof pdfjsLib & { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerUrl;
  workerInitialized = true;
}

const COLOR_THRESHOLD = 8; // R,G,B difference above this = color
const SAMPLE_STEP = 8;    // Sample every Nth pixel for speed
const MAX_PAGES_CHECK = 10;
const RENDER_SCALE = 0.5; // Small scale for fast render

export type ColorMode = 'color' | 'grayscale' | 'mixed';

/**
 * Detect color mode from PDF bytes (e.g. from uploaded file).
 * Renders up to MAX_PAGES_CHECK pages at low resolution and samples pixels.
 */
export async function detectPdfColorMode(pdfArrayBuffer: ArrayBuffer): Promise<ColorMode> {
  ensureWorker();
  const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pagesToCheck = Math.min(numPages, MAX_PAGES_CHECK);
  let colorPages = 0;
  let grayPages = 0;

  for (let i = 1; i <= pagesToCheck; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    await page.render({
      canvasContext: ctx,
      canvas,
      viewport,
      intent: 'print',
    }).promise;
    const hasColor = sampleCanvasForColor(ctx, viewport.width, viewport.height);
    if (hasColor) colorPages++; else grayPages++;
  }

  await pdf.destroy();
  if (colorPages > 0 && grayPages > 0) return 'mixed';
  if (colorPages > 0) return 'color';
  return 'grayscale';
}

function sampleCanvasForColor(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4 * SAMPLE_STEP) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    if (Math.abs(r - g) > COLOR_THRESHOLD || Math.abs(g - b) > COLOR_THRESHOLD || Math.abs(r - b) > COLOR_THRESHOLD) {
      return true;
    }
  }
  return false;
}
