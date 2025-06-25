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
    primary: 'bg-[#0A2F5C] hover:bg-[#08254A] active:bg-[#061C37] text-white focus:ring-[#0A2F5C] disabled:bg-[#E7ECF2] disabled:text-[#8DA0B9] disabled:border-transparent dark:bg-[#13B5CF] dark:hover:bg-[#109CB8] dark:active:bg-[#0E84A1] dark:text-[#0F172A] dark:focus:ring-[#13B5CF] dark:disabled:bg-[#1E293B] dark:disabled:text-[#4A5E78]',
    secondary: 'bg-[#4A5E78] hover:bg-[#324E80] active:bg-[#1A2B47] text-white focus:ring-[#4A5E78] disabled:bg-[#E7ECF2] disabled:text-[#8DA0B9] disabled:border-transparent dark:bg-[#334155] dark:hover:bg-[#475569] dark:active:bg-[#1E293B] dark:text-[#F1F5F9] dark:focus:ring-[#475569] dark:disabled:bg-[#1E293B] dark:disabled:text-[#4A5E78]',
    outline: 'bg-transparent hover:bg-[#DDE3ED] text-[#0A2F5C] border border-[#0A2F5C] focus:ring-[#0A2F5C] disabled:text-[#8DA0B9] disabled:border-[#DDE3ED] disabled:bg-transparent dark:text-[#13B5CF] dark:border-[#13B5CF] dark:hover:bg-[#1E293B] dark:focus:ring-[#13B5CF] dark:disabled:text-[#4A5E78] dark:disabled:border-[#334155]',
    link: 'bg-transparent hover:text-[#08254A] text-[#0A2F5C] underline focus:ring-[#0A2F5C] shadow-none hover:shadow-none disabled:text-[#8DA0B9] disabled:no-underline dark:text-[#13B5CF] dark:hover:text-[#0DD9F9] dark:focus:ring-[#13B5CF] dark:disabled:text-[#4A5E78]'
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