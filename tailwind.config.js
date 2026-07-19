/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Enforced strict palette based on user request
        neutral: {
          50:  '#F8FAFC', // Background
          100: '#F3F4F6', // Hover background
          200: '#E5E7EB', // Border
          300: '#D1D5DB', 
          400: '#9CA3AF', // Muted Text
          500: '#6B7280', // Secondary Text
          600: '#4B5563', 
          700: '#374151',
          800: '#1F2937',
          900: '#111827', // Primary Text
          950: '#030712', 
        },
        accent: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563EB', // Exact Blue requested
          700: '#1d4ed8',
        },
        success: {
          50:  '#f0fdf4',
          500: '#16A34A', // Exact Green requested
          600: '#16A34A', 
        },
        warning: {
          50:  '#fffbeb',
          500: '#D97706', // Exact Amber requested
          600: '#D97706',
        },
        danger: {
          50:  '#fef2f2',
          500: '#DC2626', // Exact Red requested
          600: '#DC2626',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
