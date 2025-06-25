/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- V V V NEW BRAND COLOR PALETTE V V V ---
      colors: {
        'brand-primary': {
          DEFAULT: '#0A2F5C', // Your main dark blue
          'hover': '#08254A',
          'focus': '#1545A2',
        },
        'brand-accent': {
          DEFAULT: '#13B5CF', // Your main cyan/aqua
          'hover': '#109CB8',
        },
        'brand-light': '#F8FAFC', // Very light gray for backgrounds
        'brand-dark': '#1E293B',  // Your main card background in dark mode
      },
      // --- V V V NEW FONT FAMILY DEFINITIONS V V V ---
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Raleway', ...defaultTheme.fontFamily.serif],
        mono: ['"Courier New"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
}