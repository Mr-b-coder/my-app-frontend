import React from 'react';

interface ChevronIconProps {
  isOpen: boolean;
  className?: string;
}

const ChevronIcon: React.FC<ChevronIconProps> = ({ isOpen, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${className || ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export default ChevronIcon;