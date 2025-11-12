import React from 'react';

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-6 h-6 ${className || ''}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.364l-1.591 1.591M21 12h-2.25m-.364 6.364l-1.591-1.591M12 18.75V21m-6.364-.364l1.591-1.591M3 12h2.25m.364-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25c0 1.37.296 2.652.834 3.829c.144.31.29.613.458.911M12 12a2.25 2.25 0 012.25 2.25c0 1.37-.296 2.652-.834 3.829c-.144.31-.29.613-.458.911"
    />
  </svg>
);

export default SunIcon;