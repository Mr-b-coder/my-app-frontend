import React, { useState, useEffect } from 'react';
import { Input, Button, Icon, Tabs, FileUploader, Alert, useToast } from '@acutrack-bookprint/acutrack-ds';
import {
  analyzePdfFromBackend,
  fileToBase64,
  type PdfAnalysisResult,
} from '../services/pdfAnalyzerService';
import { detectPdfColorMode, type ColorMode } from '../utils/pdfColorDetection';

const CheckPdfPage: React.FC = () => {
  const [pdfCheckerMode, setPdfCheckerMode] = useState<'upload' | 'url'>('upload');
  const [pdfCheckerFiles, setPdfCheckerFiles] = useState<File[]>([]);
  const pdfCheckerFile = pdfCheckerFiles[0] ?? null;
  const [pdfCheckerUrl, setPdfCheckerUrl] = useState('');
  const [pdfAnalysisResult, setPdfAnalysisResult] = useState<PdfAnalysisResult | null>(null);
  const [pdfColorMode, setPdfColorMode] = useState<ColorMode | null>(null);
  const [pdfCheckerError, setPdfCheckerError] = useState<string | null>(null);
  const [isPdfAnalyzing, setIsPdfAnalyzing] = useState(false);
  const [analysisStepText, setAnalysisStepText] = useState<string | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [detailsCopied, setDetailsCopied] = useState(false);
  const { showToast } = useToast();

  // Object URL for uploaded file preview; revoke on change/unmount
  useEffect(() => {
    if (pdfCheckerMode !== 'upload' || !pdfCheckerFile) {
      setPreviewObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(pdfCheckerFile);
    setPreviewObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfCheckerMode, pdfCheckerFile]);

  const previewSrc =
    pdfCheckerMode === 'upload'
      ? previewObjectUrl
      : pdfCheckerMode === 'url' && pdfCheckerUrl.trim() && pdfAnalysisResult
        ? pdfCheckerUrl.trim()
        : null;

  const isGoogleDriveUrl = (url: string) => /drive\.google\.com/i.test(url);
  const isShareFileViewUrl = (url: string) => /\.sharefile\.com\/share\/view\//i.test(url);
  const showDriveMessage = previewSrc != null && isGoogleDriveUrl(previewSrc);
  const showShareFileHelper =
    pdfCheckerMode === 'url' &&
    isShareFileViewUrl(pdfCheckerUrl.trim());
  const hasPreview = !!previewSrc;
  const hasDetails = !!pdfAnalysisResult;

  const trimSizeStr = pdfAnalysisResult?.firstPageBoxes?.trimBox
    ? `${Number(pdfAnalysisResult.firstPageBoxes.trimBox.widthInches).toFixed(2)}W × ${Number(pdfAnalysisResult.firstPageBoxes.trimBox.heightInches).toFixed(2)}H inches`
    : pdfAnalysisResult
      ? `${Number(pdfAnalysisResult.firstPageWidthInches).toFixed(2)}W × ${Number(pdfAnalysisResult.firstPageHeightInches).toFixed(2)}H inches`
      : '';
  const colorStr = pdfColorMode === 'color' ? 'Color' : pdfColorMode === 'grayscale' ? 'Black & white (grayscale)' : pdfColorMode === 'mixed' ? 'Mixed (some color, some B&W)' : '—';
  const titleStr = pdfAnalysisResult?.title != null && pdfAnalysisResult.title !== '' ? pdfAnalysisResult.title : '—';

  const resetAnalysisState = () => {
    setPdfCheckerError(null);
    setPdfAnalysisResult(null);
    setPdfColorMode(null);
    setDetailsCopied(false);
    setAnalysisStepText(null);
  };

  const handleAnalyzeAnotherFile = () => {
    resetAnalysisState();
    if (pdfCheckerMode === 'upload') {
      setPdfCheckerFiles([]);
      // Move focus to file input so AM can pick next file immediately.
      window.setTimeout(() => {
        const fileInput = document.querySelector<HTMLInputElement>('#check-pdf-upload input[type="file"]');
        if (fileInput) {
          fileInput.focus();
          return;
        }
        const uploader = document.getElementById('check-pdf-upload');
        uploader?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    } else {
      setPdfCheckerUrl('');
      // Focus URL field for the next quick analysis.
      window.setTimeout(() => {
        const urlInput = document.getElementById('pdfCheckerUrl') as HTMLInputElement | null;
        urlInput?.focus();
      }, 0);
    }
  };

  const handleCopyDetailsSummary = () => {
    if (!pdfAnalysisResult) return;
    const summaryLines = [
      `Title: ${titleStr}`,
      `Book Trim Size: ${trimSizeStr}${!pdfAnalysisResult.consistentSize ? ' (first page)' : ''}`,
      `No. of Pages: ${pdfAnalysisResult.pageCount}`,
      `Color: ${colorStr}`,
    ];
    navigator.clipboard.writeText(summaryLines.join('\n')).then(() => {
      setDetailsCopied(true);
      showToast({ title: 'PDF details copied.', variant: 'success' });
      setTimeout(() => setDetailsCopied(false), 2200);
    }).catch(() => {
      alert('Failed to copy details to clipboard.');
    });
  };

  const handleAnalyzePdf = async () => {
    resetAnalysisState();
    if (pdfCheckerMode === 'upload') {
      if (!pdfCheckerFile) {
        setPdfCheckerError('Please select a PDF file.');
        return;
      }
      setIsPdfAnalyzing(true);
      setAnalysisStepText('Reading PDF metadata...');
      try {
        const base64 = await fileToBase64(pdfCheckerFile);
        const result = await analyzePdfFromBackend({ fileBase64: base64 });
        setPdfAnalysisResult(result);
        setAnalysisStepText('Detecting color mode...');
        const arrayBuffer = await pdfCheckerFile.arrayBuffer();
        const colorMode = await detectPdfColorMode(arrayBuffer);
        setPdfColorMode(colorMode);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'PDF analysis failed.';
        setPdfCheckerError(message);
        showToast({ title: 'Error fetching PDF details.', variant: 'error' });
      } finally {
        setIsPdfAnalyzing(false);
        setAnalysisStepText(null);
      }
    } else {
      const url = pdfCheckerUrl.trim();
      if (!url) {
        setPdfCheckerError('Please enter a PDF URL.');
        return;
      }
      if (!/^https?:\/\//i.test(url)) {
        setPdfCheckerError('URL must start with http:// or https://');
        return;
      }
      setIsPdfAnalyzing(true);
      setAnalysisStepText('Reading PDF metadata...');
      try {
        const result = await analyzePdfFromBackend({ pdfUrl: url });
        setPdfAnalysisResult(result);
        setPdfColorMode(null);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'PDF analysis failed.';
        setPdfCheckerError(message);
        showToast({ title: 'Error fetching PDF details.', variant: 'error' });
      } finally {
        setIsPdfAnalyzing(false);
        setAnalysisStepText(null);
      }
    }
  };

  const isLinkPermissionError =
    !!pdfCheckerError &&
    (pdfCheckerMode === 'url' ||
      /Google Drive|ShareFile|page instead of the file|Anyone with the link|direct link|link permission/i.test(pdfCheckerError));

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full max-w-6xl mx-auto">
        {/* Left: form and results */}
        <div className="lg:col-span-5 space-y-4">
        <h1 className="text-2xl font-semibold text-brand-navy dark:text-dark-brand-navy mb-2 border-b border-border-color dark:border-dark-border-color pb-3">
          Check your PDF
        </h1>
        <p className="text-sm text-grey-600 dark:text-grey-400 mb-6">
          Upload a PDF or paste a link to see page dimensions, page count, and color vs black & white.
        </p>
        <div className="bg-bg-secondary dark:bg-dark-bg-primary p-6 rounded-lg border border-border-color dark:border-dark-border-color shadow-md">
          <Tabs
            value={pdfCheckerMode}
            onValueChange={({ value }) => {
              if (value === 'upload' || value === 'url') {
                setPdfCheckerMode(value);
                setPdfCheckerError(null);
                setPdfAnalysisResult(null);
                setPdfColorMode(null);
                setDetailsCopied(false);
                if (value === 'url') setPdfCheckerFiles([]);
              }
            }}
            variant="line"
            fitted={true}
            size="md"
          >
            <Tabs.List className="mb-4">
              <Tabs.Tab value="upload">Upload PDF</Tabs.Tab>
              <Tabs.Tab value="url">PDF link</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panels>
              <Tabs.Panel value="upload">
                <FileUploader
                  id="check-pdf-upload"
                  label="Choose a PDF file"
                  files={pdfCheckerFiles}
                  onFilesChange={(files) => {
                    const latestFileOnly = files.length > 0 ? [files[files.length - 1]] : [];
                    setPdfCheckerFiles(latestFileOnly);
                    resetAnalysisState();
                    setDetailsCopied(false);
                  }}
                  accept=".pdf,application/pdf"
                  maxFiles={2}
                  maxSize={1024 * 1024 * 1024}
                  showFileList={true}
                  showDragInstructions={true}
                  description="PDF only. Max 1 GB. File is not stored—used only for analysis."
                  variant="outlined"
                  size="md"
                />
              </Tabs.Panel>
              <Tabs.Panel value="url">
                <div className="space-y-4">
                  <Input
                    label="PDF URL"
                    id="pdfCheckerUrl"
                    name="pdfCheckerUrl"
                    value={pdfCheckerUrl}
                    onChange={(e) => {
                      setPdfCheckerUrl(e.target.value);
                      resetAnalysisState();
                    }}
                    placeholder="https://example.com/document.pdf"
                  />
                  <p className="text-xs text-grey-500 dark:text-grey-400">
                    Google Drive view links are auto-converted to download. Color detection is only available for uploads.
                  </p>
                  {showShareFileHelper && (
                    <p className="text-xs text-system-warning-dark dark:text-system-warning-light-text bg-system-warning-light dark:bg-system-warning-dark-bg border border-system-warning dark:border-system-warning rounded px-3 py-2">
                      ShareFile <code>/share/view/</code> links may not provide direct PDF bytes. If analysis fails, use <strong>Upload PDF</strong>.
                    </p>
                  )}
                </div>
              </Tabs.Panel>
            </Tabs.Panels>
          </Tabs>
          <div className="mt-7 space-y-2">
            <Button
              onClick={handleAnalyzePdf}
              variant="primary"
              size="md"
              leftIcon={
                isPdfAnalyzing ? (
                  <Icon size="sm" className="animate-spin">progress_activity</Icon>
                ) : (
                  <Icon size="sm">search</Icon>
                )
              }
              isDisabled={isPdfAnalyzing || hasDetails || (pdfCheckerMode === 'upload' ? !pdfCheckerFile : !pdfCheckerUrl.trim())}
            >
              Analyze PDF
            </Button>
            {isPdfAnalyzing && (
              <p className="text-xs text-grey-600 dark:text-grey-400">
                {analysisStepText}
              </p>
            )}
            {hasDetails && !isPdfAnalyzing && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="grey-primary"
                  size="sm"
                  leftIcon={<Icon size="sm">upload_file</Icon>}
                  onClick={handleAnalyzeAnotherFile}
                >
                  Analyze another file
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={
                    <Icon size="sm" className={detailsCopied ? 'text-system-success' : undefined}>
                      {detailsCopied ? 'check_circle' : 'content_copy'}
                    </Icon>
                  }
                  onClick={handleCopyDetailsSummary}
                >
                  {detailsCopied ? 'Copied' : 'Copy details'}
                </Button>
              </div>
            )}
          </div>
          {pdfCheckerError && (
            <div className="mt-4 space-y-2">
              {isLinkPermissionError ? (
                <Alert
                  variant="error"
                  title="Issue with link permission"
                  description="Please download the file and use the Upload PDF section."
                />
              ) : (
                <p className="text-system-error text-sm">{pdfCheckerError}</p>
              )}
            </div>
          )}
          {pdfAnalysisResult && (
            <div className="mt-7 p-5 bg-bg-tertiary dark:bg-dark-bg-secondary rounded-lg border border-border-color dark:border-dark-border-color space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-border-color dark:border-dark-border-color pb-3">
                <h2 className="font-semibold text-brand-navy dark:text-dark-brand-navy">
                  Book / PDF details
                </h2>
              </div>
              <Alert variant="info" title="Please confirm the Title in PDF preview." />
              <dl className="grid gap-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-[150px_minmax(0,1fr)] gap-1 md:gap-4 items-start">
                  <dt className="text-grey-600 dark:text-grey-400">Title</dt>
                  <dd className="font-semibold text-grey-900 dark:text-grey-100 break-words md:text-right">
                    {titleStr}
                  </dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_minmax(0,1fr)] gap-1 md:gap-4 items-start">
                  <dt className="text-grey-600 dark:text-grey-400">Book Trim Size</dt>
                  <dd className="font-semibold tabular-nums text-grey-900 dark:text-grey-100 md:text-right">
                    {trimSizeStr}
                    {!pdfAnalysisResult.consistentSize && ' (first page)'}
                  </dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_minmax(0,1fr)] gap-1 md:gap-4 items-start">
                  <dt className="text-grey-600 dark:text-grey-400">No. of Pages</dt>
                  <dd className="font-semibold tabular-nums text-grey-900 dark:text-grey-100 md:text-right">{pdfAnalysisResult.pageCount}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_minmax(0,1fr)] gap-1 md:gap-4 items-start">
                  <dt className="text-grey-600 dark:text-grey-400">Color</dt>
                  <dd className="font-semibold text-grey-900 dark:text-grey-100 md:text-right">
                    {colorStr}
                  </dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[150px_minmax(0,1fr)] gap-1 md:gap-4 items-start">
                  <dt className="text-grey-600 dark:text-grey-400">Trim box</dt>
                  <dd className="font-semibold text-grey-900 dark:text-grey-100 md:text-right">
                    {pdfAnalysisResult.firstPageBoxes?.trimBox ? 'Available' : 'Not available'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
        </div>

        {/* Right: PDF preview */}
        <div className="lg:col-span-7">
          <div
            className={`sticky top-4 bg-bg-secondary dark:bg-dark-bg-primary rounded-lg border border-border-color dark:border-dark-border-color shadow-md overflow-hidden flex flex-col ${
              hasPreview && !showDriveMessage ? 'min-h-[840px] lg:min-h-[92vh]' : 'min-h-[200px] lg:min-h-[240px]'
            }`}
          >
            <h2 className="text-lg font-semibold text-brand-navy dark:text-dark-brand-navy px-4 py-3 border-b border-border-color dark:border-dark-border-color">
              Preview
            </h2>
            <div className={`flex-1 flex min-h-0 bg-grey-100 dark:bg-grey-900 ${hasPreview && !showDriveMessage ? 'min-h-[680px] lg:min-h-[calc(92vh-4rem)]' : ''}`}>
              {isPdfAnalyzing ? (
                <div className="w-full flex flex-col items-center justify-center text-grey-700 dark:text-grey-300 text-sm p-6 text-center">
                  <Icon size="lg" className="animate-spin mb-3">progress_activity</Icon>
                  <p className="font-medium mb-1">{analysisStepText ?? 'Analyzing PDF...'}</p>
                  <p className="text-grey-600 dark:text-grey-400">Please wait while we process your file.</p>
                </div>
              ) : pdfCheckerError ? (
                <div className="w-full flex flex-col items-center justify-center text-system-error text-sm p-6 text-center">
                  <Icon size="lg" className="mb-3">error_outline</Icon>
                  <p className="font-medium mb-1">Could not analyze this PDF</p>
                  <p className="text-grey-600 dark:text-grey-400">Fix the file or URL and click Analyze PDF again.</p>
                </div>
              ) : showDriveMessage ? (
                <div className="w-full flex flex-col items-center justify-center text-grey-700 dark:text-grey-300 text-sm p-6 text-center">
                  <Icon size="lg" className="mb-3">open_in_new</Icon>
                  <p className="mb-4">
                    Preview isn&apos;t available for Google Drive links in this viewer (access may be restricted in the embed).
                  </p>
                  <p className="mb-4 text-grey-600 dark:text-grey-400">
                    Use <strong>Upload PDF</strong> to see a preview, or open the link in a new tab.
                  </p>
                  <a
                    href={previewSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-navy text-white hover:opacity-90 dark:bg-brand-orange dark:text-dark-brand-navy font-medium text-sm"
                  >
                    Open in new tab
                  </a>
                </div>
              ) : previewSrc ? (
                <iframe
                  src={previewSrc}
                  title="PDF preview"
                  className="w-full h-full min-h-[680px] lg:min-h-[calc(92vh-4rem)]"
                />
              ) : (
                <div className="w-full flex flex-col items-center justify-center text-grey-500 dark:text-grey-400 text-sm p-6 text-center">
                  <Icon size="lg" className="mb-3">{pdfCheckerMode === 'upload' ? 'upload_file' : 'link'}</Icon>
                  <p className="font-medium mb-1">
                    {pdfCheckerMode === 'upload' ? 'No PDF selected yet' : 'No PDF URL entered yet'}
                  </p>
                  <p>
                    {pdfCheckerMode === 'upload'
                      ? 'Select a PDF file and click Analyze PDF.'
                      : 'Enter a PDF URL and click Analyze PDF.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckPdfPage;
