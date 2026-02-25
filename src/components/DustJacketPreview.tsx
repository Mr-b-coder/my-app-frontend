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
  const panelW = calculations.trimWidthNum ?? 0; // front/back panel = trim size (matches dust jacket formula)
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
  const panelWPt = panelW * scaleFactor;
  const spinePt = spineW * scaleFactor;
  const safetyPt = safetyMargin * scaleFactor;

  const FONT_SIZE = Math.max(8, Math.min(11, svgW / 50));
  const INFO_FONT_SIZE = Math.max(6, Math.min(10, FONT_SIZE * 0.8));
  const isDarkMode = theme === 'dark';

  const colors = {
    bleedEdgeColor: '#FF6B6B',
    safetyMarginColor: '#22C55E',
    spineColor: '#9013FE',
    panelColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
    textColor: isDarkMode ? '#F1F5F9' : '#0A2F5C',
    infoLabelColor: isDarkMode ? '#94A3B8' : '#4A5E78',
  };

  const DashedLine: React.FC<React.SVGProps<SVGLineElement>> = (props) => (
    <line {...props} strokeDasharray="3,2" strokeWidth={props.strokeWidth || '0.75'} />
  );

  const y = bleedPt;
  const leftFlapX = bleedPt;
  const frontPanelX = leftFlapX + flapPt;
  const spineX = frontPanelX + panelWPt;
  const backPanelX = spineX + spinePt;
  const rightFlapX = backPanelX + panelWPt;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet" className="max-h-full w-auto">
      <rect x={0} y={0} width={svgW} height={svgH} fill="transparent" stroke={colors.bleedEdgeColor} strokeWidth={1} />
      <rect x={bleedPt} y={bleedPt} width={innerW} height={innerH} fill={colors.panelColor} stroke={colors.bleedEdgeColor} strokeWidth={0.5} />

      {/* Left flap */}
      <rect x={leftFlapX} y={y} width={flapPt} height={innerH} fill={colors.spineColor} stroke={colors.spineColor} strokeWidth={0.5} opacity={0.2} />
      {showTechnicalGuides && (
        <>
          <DashedLine x1={leftFlapX + safetyPt} y1={y + safetyPt} x2={leftFlapX + flapPt - safetyPt} y2={y + safetyPt} stroke={colors.safetyMarginColor} />
          <DashedLine x1={leftFlapX + safetyPt} y1={y + innerH - safetyPt} x2={leftFlapX + flapPt - safetyPt} y2={y + innerH - safetyPt} stroke={colors.safetyMarginColor} />
          <DashedLine x1={leftFlapX + safetyPt} y1={y + safetyPt} x2={leftFlapX + safetyPt} y2={y + innerH - safetyPt} stroke={colors.safetyMarginColor} />
          <DashedLine x1={leftFlapX + flapPt - safetyPt} y1={y + safetyPt} x2={leftFlapX + flapPt - safetyPt} y2={y + innerH - safetyPt} stroke={colors.safetyMarginColor} />
        </>
      )}
      <text x={leftFlapX + flapPt / 2} y={y + innerH / 2} fontSize={FONT_SIZE} fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Left flap</text>

      {/* Front panel */}
      <rect x={frontPanelX} y={y} width={panelWPt} height={innerH} fill={colors.panelColor} stroke="#444" strokeWidth={0.5} />
      <text x={frontPanelX + panelWPt / 2} y={y + innerH / 2} fontSize={FONT_SIZE} fontWeight="bold" fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Front</text>

      {/* Spine */}
      <rect x={spineX} y={y} width={spinePt} height={innerH} fill={colors.spineColor} stroke={colors.spineColor} strokeWidth={0.5} opacity={0.25} />
      <text x={spineX + spinePt / 2} y={y + innerH / 2} fontSize={INFO_FONT_SIZE} fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Spine</text>

      {/* Back panel */}
      <rect x={backPanelX} y={y} width={panelWPt} height={innerH} fill={colors.panelColor} stroke="#444" strokeWidth={0.5} />
      <text x={backPanelX + panelWPt / 2} y={y + innerH / 2} fontSize={FONT_SIZE} fontWeight="bold" fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Back</text>

      {/* Right flap */}
      <rect x={rightFlapX} y={y} width={flapPt} height={innerH} fill={colors.spineColor} stroke={colors.spineColor} strokeWidth={0.5} opacity={0.2} />
      {showTechnicalGuides && (
        <>
          <DashedLine x1={rightFlapX + safetyPt} y1={y + safetyPt} x2={rightFlapX + flapPt - safetyPt} y2={y + safetyPt} stroke={colors.safetyMarginColor} />
          <DashedLine x1={rightFlapX + safetyPt} y1={y + innerH - safetyPt} x2={rightFlapX + flapPt - safetyPt} y2={y + innerH - safetyPt} stroke={colors.safetyMarginColor} />
          <DashedLine x1={rightFlapX + safetyPt} y1={y + safetyPt} x2={rightFlapX + safetyPt} y2={y + innerH - safetyPt} stroke={colors.safetyMarginColor} />
          <DashedLine x1={rightFlapX + flapPt - safetyPt} y1={y + safetyPt} x2={rightFlapX + flapPt - safetyPt} y2={y + innerH - safetyPt} stroke={colors.safetyMarginColor} />
        </>
      )}
      <text x={rightFlapX + flapPt / 2} y={y + innerH / 2} fontSize={FONT_SIZE} fill={colors.textColor} textAnchor="middle" dominantBaseline="central">Right flap</text>

      {showTechnicalGuides && (
        <>
          <text x={INFO_FONT_SIZE * 0.35} y={INFO_FONT_SIZE * 1.25} textAnchor="start" dominantBaseline="hanging" fontSize={INFO_FONT_SIZE} fill={colors.infoLabelColor}>Bleed: {bleed}&quot;</text>
          <text x={INFO_FONT_SIZE * 0.35} y={INFO_FONT_SIZE * 2.5} textAnchor="start" dominantBaseline="hanging" fontSize={INFO_FONT_SIZE} fill={colors.infoLabelColor}>Safety: {safetyMargin.toFixed(3)}&quot;</text>
          <text x={INFO_FONT_SIZE * 0.35} y={INFO_FONT_SIZE * 3.75} textAnchor="start" dominantBaseline="hanging" fontSize={INFO_FONT_SIZE} fill={colors.infoLabelColor}>{totalW.toFixed(3)} × {totalH.toFixed(3)} in</text>
        </>
      )}
    </svg>
  );
};
