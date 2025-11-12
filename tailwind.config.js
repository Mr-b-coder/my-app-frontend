/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    'fill-brand-orange',
    'fill-dark-brand-orange',
    'fill-dark-brand-orange-hover',
    'fill-system-info',
    'fill-system-success',
    'fill-brand-navy',
    'fill-system-warning',
    'fill-system-error',
    'stroke-brand-orange',
    'stroke-dark-brand-orange',
    'stroke-dark-brand-orange-hover',
    'stroke-system-info',
    'stroke-system-success',
    'stroke-brand-navy',
    'stroke-system-warning',
    'stroke-system-error',
    // Custom brand colors
    'bg-brand-orange-hover',
    'bg-brand-navy-hover',
    'hover:bg-brand-orange-hover',
    'hover:bg-brand-navy-hover',
    // Warning text colors
    'text-system-warning-dark',
    'hover:text-white',
    'dark:hover:text-system-warning-dark',
    // Toast positioning classes
    'top-0',
    'bottom-0',
    'left-0',
    'right-0',
    'items-start',
    'items-end',
    'justify-start',
    'justify-center',
    'justify-end',
    'flex',
    'flex-col',
    'w-full',
    'w-auto',
    'p-4',
    'space-y-3',
    'pointer-events-none',
    'pointer-events-auto',
    // Brand navy slate colors
    'bg-brand-navy-50',
    'bg-brand-navy-100',
    'bg-brand-navy-200',
    'bg-brand-navy-300',
    'bg-brand-navy-400',
    'bg-brand-navy-500',
    'bg-brand-navy-600',
    'bg-brand-navy-700',
    'bg-brand-navy-800',
    'bg-brand-navy-900',
    'hover:bg-brand-navy-50',
    'hover:bg-brand-navy-100',
    'hover:bg-brand-navy-200',
    'hover:bg-brand-navy-300',
    'hover:bg-brand-navy-400',
    'hover:bg-brand-navy-500',
    'hover:bg-brand-navy-600',
    'hover:bg-brand-navy-700',
    'hover:bg-brand-navy-800',
    'hover:bg-brand-navy-900',
    'border-brand-navy-900',
    'bg-system-success-dark-bg',
    'text-system-success-light-text',
    'text-text-primary',
    'text-dark-text-primary',
    // ToggleSwitch peer classes
    'peer-checked:translate-x-3',
    'peer-checked:translate-x-4',
    'peer-checked:translate-x-5',
    'peer-checked:translate-x-6',
    'peer-checked:translate-x-7',
    'peer-checked:bg-brand-orange',
    'peer-checked:bg-green-500',
    'peer-checked:bg-yellow-500',
    'peer-checked:bg-red-500',
    'peer-checked:bg-blue-500',
    'peer-checked:border-brand-orange',
    'peer-checked:border-green-500',
    'peer-checked:border-yellow-500',
    'peer-checked:border-red-500',
    'peer-checked:border-blue-500',
    // Tabs component colors
    'text-brand-orange',
    'text-dark-brand-orange',
    'text-dark-brand-orange-hover',
    'border-brand-orange',
    'border-dark-brand-orange',
    'border-dark-brand-orange-hover',
    'bg-brand-orange',
    'bg-dark-brand-orange',
    'bg-dark-brand-orange-hover',
    'hover:text-brand-orange',
    'hover:text-dark-brand-orange',
    'hover:text-dark-brand-orange-hover',
    'hover:border-brand-orange',
    'hover:border-dark-brand-orange',
    'hover:border-dark-brand-orange-hover',
    'hover:bg-brand-orange',
    'hover:bg-dark-brand-orange',
    'hover:bg-dark-brand-orange-hover',
    'peer-checked:text-white',
    'peer-checked:hidden',
    'peer-checked:inline',
    // Sidebar classes
    'acutrack-sidebar-transition',
    'acutrack-sidebar-collapsed',
    'acutrack-sidebar-expanded-sm',
    'acutrack-sidebar-expanded-md',
    'acutrack-sidebar-expanded-lg',
    // Tabs classes
    'tabs-root',
    'tabs-list',
    'tabs-tab',
    'tabs-panels',
    'tabs-panel',
    'tabs-indicator',
    // Width system classes
    'w-sm',
    'w-md',
    'w-lg',
    'w-full',
    'w-auto',
    'min-w-sm',
    'min-w-md',
    'min-w-lg',
    'min-w-full',
    'min-w-auto',
    'max-w-sm',
    'max-w-md',
    'max-w-lg',
    'max-w-full',
    'max-w-auto',
    'min-w-32',
    'max-w-full',
    // Animation classes
    'animate-gradient-pan',
    'animate-badge-pulse',
    'animate-fade-in',
    'animate-slide-up',
    'animate-slide-down',
    'animate-slide-left',
    'animate-slide-right',
    'animate-scale',
    // DropdownItem state colors (added for dynamic classes)
    'text-system-error-dark',
    'dark:text-system-error-light-text',
    'hover:bg-system-error-light',
    'dark:hover:bg-system-error-dark-bg',
    'hover:text-system-error-dark',
    'dark:hover:text-system-error-light-text',
    'text-system-warning-dark',
    'dark:text-system-warning-light-text',
    'hover:bg-system-warning-light',
    'dark:hover:bg-system-warning-dark-bg',
    'text-system-success-dark',
    'dark:text-system-success-light-text',
    'hover:bg-system-success-light',
    'dark:hover:bg-system-success-dark-bg',
    'text-system-info-dark',
    'dark:text-system-info-light-text',
    'hover:bg-system-info-light',
    'dark:hover:bg-system-info-dark-bg',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        heading: ['Raleway', 'sans-serif'],
      },
      width: {
        'sm': '8rem',   // 128px
        'md': '12rem',  // 192px
        'lg': '16rem',  // 256px
        'full': '100%',
        'auto': 'auto',
      },
      minWidth: {
        'sm': '8rem',   // 128px
        'md': '12rem',  // 192px
        'lg': '16rem',  // 256px
        'full': '100%',
        'auto': 'auto',
      },
      maxWidth: {
        'sm': '8rem',   // 128px
        'md': '12rem',  // 192px
        'lg': '16rem',  // 256px
        'full': '100%',
        'auto': 'auto',
      },
      colors: {
        // --- CORE BRAND PALETTE ---
        'brand-navy': '#1B3A7B',
        'brand-orange': '#0d9488',
        'brand-orange-hover': '#0a6960',
        'brand-navy-hover': '#0f2246',
        'grey-50': '#F9FAFB',
        'grey-100': '#F3F4F6',
        'grey-200': '#E5E7EB',
        'grey-300': '#D1D5DB',
        'grey-400': '#9CA3AF',
        'grey-500': '#6B7280',
        'grey-600': '#4B5563',
        'grey-700': '#374151',
        'grey-800': '#1F2937',
        'grey-900': '#111827',
        // --- Brand -navy Slate colors ---
        'brand-navy-50': '#F1F4FA',
        'brand-navy-100': '#D9E1F0',
        'brand-navy-200': '#B5C3E0',
        'brand-navy-300': '#8AA1CD',
        'brand-navy-400': '#5C7EB5',
        'brand-navy-500': '#365D9E',
        'brand-navy-600': '#274983',
        'brand-navy-700': '#1B3A7B', // base
        'brand-navy-800': '#162F63',
        'brand-navy-900': '#0F2246',
        //
        // --- GREY THEME COLORS ---
        'grey-primary': '#1F2937',
        'grey-primary-hover': '#0f1012',
        'grey-secondary': '#9CA3AF',
        'grey-secondary-hover': '#6B7280',
        'grey-accent': '#374151',
        'grey-accent-hover': '#1F2937',
        // --- LIGHT MODE PALETTE ---
        'text-primary': '#1B3A7B',
        'text-secondary': '#3C4858',
        'text-on-accent': '#FFFFFF',
        'bg-primary': '#f6f7fa',
        'bg-secondary': '#FFFFFF',
        'bg-tertiary': '#ebeff9',
        'border-color': '#DFE4E9',
        'border-strong': '#5fead4',
        // --- DARK MODE PALETTE ---
        'dark-brand-orange': '#0d9488',
        'dark-brand-orange-hover': '#5eead4',
        'dark-brand-navy': '#53e3cb',
        'dark-text-primary': '#F6F8FD',
        'dark-text-secondary': '#9CA3AF',
        'dark-text-on-accent': '#FFFFFF',
        'dark-bg-primary': '#1c212c',
        'dark-bg-secondary': '#101620',
        'dark-bg-tertiary': '#1e2a3a',
        'dark-border-color': '#1c3332',
        'dark-border-strong': '#ffffff',
        // --- DARK MODE GREY THEME COLORS ---
        'dark-grey-primary': '#f6f8fb',
        'dark-grey-primary-hover': '#e1e8f4',
        'dark-grey-secondary': '#e0e0e0',
        'dark-grey-secondary-hover': '#9CA3AF',
        'dark-grey-accent': '#D1D5DB',
        'dark-grey-accent-hover': '#F3F4F6',
        // --- SYSTEM COLORS ---
        'system-success': '#23C27D', 'system-error': '#ba4335', 'system-warning': '#f3c94f', 'system-info': '#3266d4',
        // --- WCAG AA COMPLIANT SYSTEM COLORS ---
        // Light Mode: Light backgrounds with dark text
        'system-success-light': '#dcfce7', 'system-success-dark': '#166534',
        'system-error-light': '#fee2e2', 'system-error-dark': '#991b1b',
        'system-warning-light': '#fef3c7', 'system-warning-dark': '#92400e',
        'system-info-light': '#dbeafe', 'system-info-dark': '#1e40af',
        // Dark Mode: Dark backgrounds with light text
        'system-success-dark-bg': '#14532d', 'system-success-light-text': '#bbf7d0',
        'system-error-dark-bg': '#7f1d1d', 'system-error-light-text': '#fecaca',
        'system-warning-dark-bg': '#e0921a', 'system-warning-light-text': '#fde68a',
        'system-info-dark-bg': '#1e3a8a', 'system-info-light-text': '#bfdbfe',
        // --- VIBRANT BUTTON COLORS (Properly Saturated, Still WCAG AA Compliant) ---
        'system-error-button': '#ef4444', 'system-info-button': '#3b82f6',
        'system-warning-button': '#f59e0b', 'system-success-button': '#22c55e',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'out': 'ease-out',
        'in': 'ease-in',
        'in-out': 'ease-in-out',
      },
      keyframes: {
        'bar-scale': {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'grid-fade': {
          '0%, 70%, 100%': { opacity: '0.2', transform: 'scale(0.7)' },
          '35%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulsar': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'spin-reverse': {
          'to': { transform: 'rotate(-360deg)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'toast-in': {
          'from': { opacity: '0', transform: 'translateX(100%)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-out': {
          'from': { opacity: '1', transform: 'translateX(0)' },
          'to': { opacity: '0', transform: 'translateX(100%)' },
        },
        'slide-in-left': {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' }
        },
        'slide-out-left': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(-100%)' }
        },
        'slide-in-right': {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' }
        },
        'slide-out-right': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(100%)' }
        },
        'progress-stripes': {
          'from': { backgroundPosition: '1rem 0' },
          'to': { backgroundPosition: '0 0' }
        },
        'gradient-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        'badge-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' }
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-down': {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-left': {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-right': {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' }
        },
        'scale': {
          'from': { opacity: '0', transform: 'scale(0.9)' },
          'to': { opacity: '1', transform: 'scale(1)' }
        },
      },
      animation: {
        'bar-scale': 'bar-scale 1.2s infinite ease-in-out',
        'grid-fade': 'grid-fade 1.5s infinite ease-in-out',
        'pulsar': 'pulsar 1.2s infinite cubic-bezier(0.4, 0, 0.6, 1)',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'toast-in': 'toast-in 0.3s ease-out forwards',
        'toast-out': 'toast-out 0.3s ease-in forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-out-left': 'slide-out-left 0.3s ease-in',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
        'progress-stripes': 'progress-stripes 1s linear infinite',
        'gradient-pan': 'gradient-pan 3s ease-in-out infinite',
        'badge-pulse': 'badge-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'slide-down': 'slide-down 0.3s ease-out forwards',
        'slide-left': 'slide-left 0.3s ease-out forwards',
        'slide-right': 'slide-right 0.3s ease-out forwards',
        'scale': 'scale 0.3s ease-out forwards',
      },
      fill: ({ theme }) => theme('colors'),
      stroke: ({ theme }) => theme('colors'),
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
