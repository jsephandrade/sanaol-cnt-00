/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        peach: {
          50: '#FFF3E6',
          100: '#FFE0C2',
          200: '#FFC999',
          300: '#FFB066',
          400: '#FF9833',
          500: '#F07F13',
        },
        cream: '#FFF6ED',
        text: '#1E1E1E',
        sub: '#5F5F5F',
      },
    },
  },
  plugins: [],
};
