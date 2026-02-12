import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  unit?: string;
}

const Input: React.FC<InputProps> = ({ label, id, unit, ...rest }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          // --- V V V THIS IS THE ONLY LINE I CHANGED V V V ---
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 dark:focus:ring-cyan-400/50 dark:focus:border-cyan-400 transition duration-150 ease-in-out bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed"
          // --- ^ ^ ^ THIS IS THE ONLY LINE I CHANGED ^ ^ ^ ---
          {...rest}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-slate-400 sm:text-sm">{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;