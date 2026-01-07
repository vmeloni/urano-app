/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Rosa - Fondos
        rosa: {
          50: '#fefbfc',
          100: '#fdf8f9',
          200: '#fef3f5',
          300: '#fde8ea',
          400: '#fcd6da',
          DEFAULT: '#fdf8f9',
        },
        // Azul Grisáceo - Principal (mantener compatibilidad)
        azul: {
          50: '#f8f9fb',
          100: '#e8edf3',
          200: '#d4dce8',
          300: '#5b7388',
          400: '#4a6176',
          500: '#486581', // azul-primary
          600: '#2f3e4d',
          700: '#243240',
          DEFAULT: '#486581', // azul-primary
        },
        // Terracota - Acentos
        terracota: {
          50: '#fef5f5',
          100: '#fde8e7',
          200: '#fbd4d3',
          300: '#d67773',
          400: '#b85450',
          500: '#a84845',
          600: '#8f3c39',
          DEFAULT: '#b85450',
        },
        // Rojo Crítico - SOLO CTAs importantes
        rojo: {
          400: '#e63946',
          500: '#c00000', // rojo-destructive y rojo-brand
          600: '#a31830',
          DEFAULT: '#c00000',
        },
        // Sistema de diseño Stripe + Urano
        'azul-primary': '#486581',
        'rojo-destructive': '#c00000',
        'rojo-brand': '#c00000',
        'verde-success': '#10b981',
        'amarillo-warning': '#f59e0b',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

