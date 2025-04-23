/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#C32222', // Rojo alemán
            dark: '#A10000',
            light: '#E55555',
          },
          secondary: {
            DEFAULT: '#E5A51C', // Amarillo alemán
            dark: '#C38600',
            light: '#FFC44D',
          },
          dark: {
            DEFAULT: '#333333',
            light: '#666666',
          },
          light: {
            DEFAULT: '#FFFFFF',
            dark: '#F4F4F4',
          }
        },
        fontFamily: {
          sans: ['Montserrat', 'sans-serif'],
        },
        fontSize: {
          'xxl': '1.75rem', // Para botones grandes
          'xxxl': '2rem',   // Para títulos principales
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
        },
        padding: {
          'button': '1rem 2rem',
        },
        boxShadow: {
          'button': '0 4px 6px rgba(0, 0, 0, 0.1)',
          'card': '0 10px 15px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    plugins: [],
  }