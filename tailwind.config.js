/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Playfair Display"', 'Montserrat', 'serif'],
      },
      colors: {
        // PRIMARY — warm peach / coral (matches the reference design)
        primary: {
          50: '#fff5f0',
          100: '#ffe6d8',
          200: '#fecbb0',
          300: '#fba87e',
          400: '#f6885a',
          500: '#ef6c3d',
          600: '#e0552a',
          700: '#ba421f',
          800: '#94371e',
          900: '#78311d',
          950: '#41160b',
        },
        // SECONDARY — soft blush rose (feminine support tone)
        secondary: {
          50: '#fff1f5',
          100: '#ffe4ec',
          200: '#fecdd9',
          300: '#fda4bb',
          400: '#fb7099',
          500: '#f43f78',
          600: '#e11d5c',
          700: '#be124b',
          800: '#9f1244',
          900: '#88133f',
          950: '#4c041f',
        },
        // ACCENT — rose-pink (highlights, badges, CTAs)
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        // CREAM — warm neutral backgrounds for the light theme
        cream: {
          50: '#fffaf6',
          100: '#fff4ec',
          200: '#fde9da',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.7s ease-out',
        pulse: 'pulse 2s infinite',
        float: 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'peach-radial': 'radial-gradient(ellipse at top right, #ffe6d8 0%, #fff5f0 45%, #ffffff 100%)',
        'rose-gradient': 'linear-gradient(135deg, #ef6c3d 0%, #ec4899 100%)',
      },
    },
  },
  plugins: [],
};
