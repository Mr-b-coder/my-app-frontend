import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string | number; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, ...rest }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </label>
      {/* --- V V V THIS IS THE LINE WE ARE EDITING V V V --- */}
      <select
        id={id}
        name={id}
        // I have added "appearance-none" to hide the ugly default arrow,
        // and "bg-no-repeat bg-right" along with background image styles
        // to add our own clean, custom arrow icon.
        className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 dark:focus:ring-cyan-400/50 dark:focus:border-cyan-400 transition duration-150 ease-in-out disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.5em 1.5em',
        }}
        {...rest}
      >
      {/* --- ^ ^ ^ THIS IS THE LINE WE ARE EDITING ^ ^ ^ --- */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;