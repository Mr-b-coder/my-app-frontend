import React from 'react';

const ScriptFileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2} 
    stroke="currentColor"
    className={`w-4 h-4 ${className || ''}`}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5 3 12l3.75 4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 7.5 21 12l-3.75 4.5" />
  </svg>
);

export default ScriptFileIcon;