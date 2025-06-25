
import React from 'react';

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-5 h-5 ${className || ''}`}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a3.375 3.375 0 01-3 0m-1.254-5.161a.5.5 0 00-.428.428 6.036 6.036 0 01-3.106 3.106.5.5 0 00-.428.428V18M4.936 9.31a.5.5 0 00.428-.428A6.035 6.035 0 018.47 5.776a.5.5 0 00.428-.428V3m5.162 1.254a.5.5 0 00.428.428 6.036 6.036 0 013.106 3.106.5.5 0 00.428.428V9.31m-3.75-2.355a3.375 3.375 0 013 0m4.5 4.5a12.06 12.06 0 010 4.5m-2.355 3.75a3.375 3.375 0 010 3m-5.161-1.254a.5.5 0 00-.428-.428 6.036 6.036 0 01-3.106-3.106.5.5 0 00-.428-.428V9.31M15.232 4.936a.5.5 0 00.428.428A6.035 6.035 0 0118.768 8.47a.5.5 0 00.428.428V12m-2.355-3.75a3.375 3.375 0 01-3 0M4.5 12a12.06 12.06 0 010-4.5m2.355-3.75a3.375 3.375 0 010-3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5z" />
  </svg>
);

export default LightbulbIcon;