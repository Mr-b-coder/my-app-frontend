import React from 'react';

const PdfFileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-4 h-4 ${className || ''}`}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125V5.25A2.25 2.25 0 0 0 11.25 3H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75V14.25Z" />
    <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">
      PDF
    </text>
  </svg>
);

export default PdfFileIcon;