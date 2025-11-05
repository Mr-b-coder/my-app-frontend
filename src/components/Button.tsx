import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  className,
  ...rest
}) => {
  // This line is already correct, no changes needed here.
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-150 ease-in-out disabled:cursor-not-allowed active:scale-[0.98]";

  const variantStyles = {
    primary: 'bg-brand-navy hover:bg-brand-navy-hover active:bg-brand-navy-800 text-white focus:ring-brand-navy disabled:bg-grey-200 disabled:text-grey-500 disabled:border-transparent dark:bg-brand-orange dark:hover:bg-brand-orange-hover dark:active:bg-brand-orange-hover dark:text-dark-text-primary dark:focus:ring-brand-orange dark:disabled:bg-dark-bg-primary dark:disabled:text-grey-500',
    secondary: 'bg-grey-600 hover:bg-grey-700 active:bg-grey-800 text-white focus:ring-grey-600 disabled:bg-grey-200 disabled:text-grey-500 disabled:border-transparent dark:bg-grey-700 dark:hover:bg-grey-600 dark:active:bg-dark-bg-primary dark:text-dark-text-primary dark:focus:ring-grey-600 dark:disabled:bg-dark-bg-primary dark:disabled:text-grey-500',
    outline: 'bg-transparent hover:bg-grey-200 text-brand-navy border border-brand-navy focus:ring-brand-navy disabled:text-grey-500 disabled:border-border-color disabled:bg-transparent dark:text-brand-orange dark:border-brand-orange dark:hover:bg-dark-bg-primary dark:focus:ring-brand-orange dark:disabled:text-grey-500 dark:disabled:border-dark-border-color',
    link: 'bg-transparent hover:text-brand-navy-hover text-brand-navy underline focus:ring-brand-navy shadow-none hover:shadow-none disabled:text-grey-500 disabled:no-underline dark:text-brand-orange dark:hover:text-dark-brand-orange-hover dark:focus:ring-brand-orange dark:disabled:text-grey-500'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const linkSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${variant === 'link' ? linkSizeStyles[size] : sizeStyles[size]} ${className || ''}`}
      {...rest}
    >
      {/* --- V V V THIS IS THE LINE WE ARE CHANGING V V V --- */}
      {leftIcon && <span className="flex items-center mr-2 -ml-1 h-4 w-4">{leftIcon}</span>}
      {/* --- ^ ^ ^ THIS IS THE LINE WE ARE CHANGING ^ ^ ^ --- */}
      {children}
    </button>
  );
};

export default Button;