import React, { useState, useEffect } from 'react';
import { CoverCalculations } from '@shared/types';
import { STANDARD_BLEED_AMOUNT_INCHES } from '../constants';

interface DustJacketPreviewProps {
  calculations: CoverCalculations | null;
  showTechnicalGuides: boolean;
}

export const DustJacketPreview = ({
  calculations,
  showTechnicalGuides,
}: DustJacketPreviewProps): React.JSX.Element | null => {
  if (!calculations?.includeDustJacket || calculations.dustJacketTotalWidth == null || calculations.dustJacketTotalHeight == null) {
    return <p className="text-center text-grey-500 dark:text-grey-400">Enable &quot;Include dust jacket&quot; for Case Bind to see preview.</p>;
  }

  const [theme, setTheme] = useState(() =>
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isNowDark = (mutation.target as HTMLElement).classList.contains('dark');
          setTheme(isNowDark ? 'dark' : 'light');
        }
      }
    });
    if (typeof window !== 'undefined') observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const totalW = calculations.dustJacketTotalWidth;
  const totalH = calculations.dustJacketTotalHeight;
  const flapWidth = calculations.dustJacketFlapWidthInches ?? 3;
  const foldInches = calculations.dustJacketFoldInches ?? 0.125;
  const flapWithFold = flapWidth + foldInches;
  const boardSizeInches = 0.098;
  const panelW = (calculations.trimWidthNum ?? 0) + boardSizeInches + 0.125; // Front/Back = (Trim width + Board size) + 0.125
  const spineW = calculations.spineWidth ?? 0;
  const safetyMargin = calculations.safetyMargin ?? 0.5;
  const bleed = STANDARD_BLEED_AMOUNT_INCHES;

  const MAX_SVG_WIDTH_REFERENCE = 500;
  const scaleFactor = MAX_SVG_WIDTH_REFERENCE / totalW;
  const svgW = totalW * scaleFactor;
  const svgH = totalH * scaleFactor;
  const bleedPt = bleed * scaleFactor;
  const innerW = svgW - 2 * bleedPt;
  const innerH = svgH - 2 * bleedPt;
  const flapPt = flapWithFold * scaleFactor;
  const foldPt = foldInches * scaleFactor;
  const flapWidthPt = flapWidth * scaleFactor; // main flap width (user: 3 or 4 in)
  const panelWPt = panelW * scaleFactor;
  const spinePt = spineW * scaleFactor;
  // Flap safety rect width: 2.87" for 3" flap, 3.87" for 4" flap (1" difference), centered in main flap only (excluding fold)
  const flapWhiteRectWidthInches = flapWidth === 4 ? 3.87 : 2.87;
  const flapWhiteRectPt = flapWhiteRectWidthInches * scaleFactor;
  const flapWhiteRectCenterInMainFlap = (flapWidthPt - flapWhiteRectPt) / 2;
  // White (safety) area height: from trim height so it scales with user trim size; clamp to inner height
  const trimHeightNum = calculations.trimHeightNum ?? 9;
  const innerHInches = totalH - 2 * bleed;
  const whiteAreaHeightInches = Math.min(trimHeightNum, Math.max(1, innerHInches - 0.02));
  const whiteAreaHeightPt = whiteAreaHeightInches * scaleFactor;
  const whiteAreaYOffset = (innerH - whiteAreaHeightPt) / 2;
  const whiteAreaY = bleedPt + whiteAreaYOffset;
  const flapInsetInches = 0.125;
  const flapInsetPt = flapInsetInches * scaleFactor;
  const backFlapWhiteRectInsetX = flapWhiteRectCenterInMainFlap + flapInsetPt;
  const frontFlapWhiteRectInsetX = foldPt + flapWhiteRectCenterInMainFlap + flapInsetPt;
  const flapWhiteRectInsetW = flapWhiteRectPt - 2 * flapInsetPt;
  const flapWhiteRectInsetY = whiteAreaY + flapInsetPt;
  const flapWhiteRectInsetH = whiteAreaHeightPt - 2 * flapInsetPt;

  const FONT_SIZE = Math.max(8, Math.min(11, svgW / 50));
  const INFO_FONT_SIZE = Math.max(6, Math.min(10, FONT_SIZE * 0.8));
  const isDarkMode = theme === 'dark';

  const colors = {
    bleedEdgeColor: '#FF6B6B',
    safetyMarginColor: '#22C55E',
    spineColor: '#9013FE',
    foldColor: '#C4A574', // 0.125" folding area on both sides of flaps
    panelColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
    textColor: isDarkMode ? '#F1F5F9' : '#0A2F5C',
    infoLabelColor: isDarkMode ? '#94A3B8' : '#4A5E78',
  };

  const DashedLine: React.FC<React.SVGProps<SVGLineElement>> = (props) => (
    <line {...props} strokeDasharray="3,2" strokeWidth={props.strokeWidth || '0.75'} />
  );

  const y = bleedPt;
  // Panel order left to right: Back flap | Back Cover | Spine | Front Cover | Front Flap
  const backFlapX = bleedPt;
  const backPanelX = backFlapX + flapPt;
  const spineX = backPanelX + panelWPt;
  const frontPanelX = spineX + spinePt;
  const frontFlapX = frontPanelX + panelWPt;

  const bleedFill = '#0d9488';
  const backgroundFill = 'rgba(27, 58, 123, 0.15)';

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet" className="max-h-full w-auto">
      {/* Base layer: full teal (bleed area) */}
      <rect x={0} y={0} width={svgW} height={svgH} fill={bleedFill} stroke={colors.bleedEdgeColor} strokeWidth={1} />
      {/* Blue background: 0.125" inset on all sides (like perfect bind) */}
      <rect x={bleedPt} y={bleedPt} width={innerW} height={innerH} fill={backgroundFill} stroke={colors.bleedEdgeColor} strokeWidth={0.5} />

      {/* Back flap: main flap width (spine color) + fold 0.125" (fold color) */}
      <rect x={backFlapX} y={y} width={flapWidthPt} height={innerH} fill={colors.spineColor} stroke={colors.spineColor} strokeWidth={0.5} opacity={0.2} />
      <rect x={backFlapX + flapWidthPt} y={y} width={foldPt} height={innerH} fill={colors.foldColor} stroke={colors.foldColor} strokeWidth={0.5} opacity={0.35} />
      {showTechnicalGuides && (
        <>
          <DashedLine x1={backFlapX + backFlapWhiteRectInsetX} y1={flapWhiteRectInsetY} x2={backFlapX + backFlapWhiteRectInsetX + flapWhiteRectInsetW} y2={flapWhiteRectInsetY} stroke={colors.safetyMarginColor} />
          <DashedLine x1={backFlapX + backFlapWhiteRectInsetX} y1={flapWhiteRectInsetY + flapWhiteRectInsetH} x2={backFlapX + backFlapWhiteRectInsetX + flapWhiteRectInsetW} y2={flapWhiteRectInsetY + flapWhiteRectInsetH} stroke={colors.safetyMarginColor} />
          <DashedLine x1={backFlapX + backFlapWhiteRectInsetX} y1={flapWhiteRectInsetY} x2={backFlapX + backFlapWhiteRectInsetX} y2={flapWhiteRectInsetY + flapWhiteRectInsetH} stroke={colors.safetyMarginColor} />
          <DashedLine x1={backFlapX + backFlapWhiteRectInsetX + flapWhiteRectInsetW} y1={flapWhiteRectInsetY} x2={backFlapX + backFlapWhiteRectInsetX + flapWhiteRectInsetW} y2={flapWhiteRectInsetY + flapWhiteRectInsetH} stroke={colors.safetyMarginColor} />
        </>
      )}
      <text x={backFlapX + flapPt / 2} y={y + innerH / 2} fontSize={FONT_SIZE} fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Back flap</text>

      {/* Back cover */}
      <rect x={backPanelX} y={y} width={panelWPt} height={innerH} fill={colors.panelColor} stroke="#444" strokeWidth={0.5} />
      <text x={backPanelX + panelWPt / 2} y={y + innerH / 2} fontSize={FONT_SIZE} fontWeight="bold" fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Back cover</text>
      {showTechnicalGuides && (
        <g fontSize={INFO_FONT_SIZE} fill={colors.infoLabelColor} textAnchor="start" dominantBaseline="hanging">
          <text x={backPanelX + 8} y={y + 8}>Bleed: {bleed}&quot;</text>
          <text x={backPanelX + 8} y={y + 8 + INFO_FONT_SIZE * 1.2}>Safety: {safetyMargin.toFixed(3)}&quot;</text>
          <text x={backPanelX + 8} y={y + 8 + INFO_FONT_SIZE * 2.4}>{totalW.toFixed(3)} × {totalH.toFixed(3)} in</text>
          <text x={backPanelX + 8} y={y + 8 + INFO_FONT_SIZE * 3.6}>Spine: {spineW.toFixed(3)} in</text>
        </g>
      )}

      {/* Spine – text rotated 90° */}
      <rect x={spineX} y={y} width={spinePt} height={innerH} fill={colors.spineColor} stroke={colors.spineColor} strokeWidth={0.5} opacity={0.25} />
      <g transform={`rotate(-90, ${spineX + spinePt / 2}, ${y + innerH / 2})`}>
        <text x={spineX + spinePt / 2} y={y + innerH / 2} fontSize={INFO_FONT_SIZE} fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Spine</text>
      </g>

      {/* Front cover */}
      <rect x={frontPanelX} y={y} width={panelWPt} height={innerH} fill={colors.panelColor} stroke="#444" strokeWidth={0.5} />
      <text x={frontPanelX + panelWPt / 2} y={y + innerH / 2} fontSize={FONT_SIZE} fontWeight="bold" fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Front cover</text>

      {/* Front flap: fold 0.125" (fold color) + main flap width (spine color) */}
      <rect x={frontFlapX} y={y} width={foldPt} height={innerH} fill={colors.foldColor} stroke={colors.foldColor} strokeWidth={0.5} opacity={0.35} />
      <rect x={frontFlapX + foldPt} y={y} width={flapWidthPt} height={innerH} fill={colors.spineColor} stroke={colors.spineColor} strokeWidth={0.5} opacity={0.2} />
      {showTechnicalGuides && (
        <>
          <DashedLine x1={frontFlapX + frontFlapWhiteRectInsetX} y1={flapWhiteRectInsetY} x2={frontFlapX + frontFlapWhiteRectInsetX + flapWhiteRectInsetW} y2={flapWhiteRectInsetY} stroke={colors.safetyMarginColor} />
          <DashedLine x1={frontFlapX + frontFlapWhiteRectInsetX} y1={flapWhiteRectInsetY + flapWhiteRectInsetH} x2={frontFlapX + frontFlapWhiteRectInsetX + flapWhiteRectInsetW} y2={flapWhiteRectInsetY + flapWhiteRectInsetH} stroke={colors.safetyMarginColor} />
          <DashedLine x1={frontFlapX + frontFlapWhiteRectInsetX} y1={flapWhiteRectInsetY} x2={frontFlapX + frontFlapWhiteRectInsetX} y2={flapWhiteRectInsetY + flapWhiteRectInsetH} stroke={colors.safetyMarginColor} />
          <DashedLine x1={frontFlapX + frontFlapWhiteRectInsetX + flapWhiteRectInsetW} y1={flapWhiteRectInsetY} x2={frontFlapX + frontFlapWhiteRectInsetX + flapWhiteRectInsetW} y2={flapWhiteRectInsetY + flapWhiteRectInsetH} stroke={colors.safetyMarginColor} />
        </>
      )}
      <text x={frontFlapX + flapPt / 2} y={y + innerH / 2} fontSize={FONT_SIZE} fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Front flap</text>
    </svg>
  );
};
