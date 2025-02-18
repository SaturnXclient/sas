/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      scale: {
        '102': '1.02',
      },
      aspectRatio: {
        'w-16': '16',
        'h-9': '9',
      },
      transitionProperty: {
        'transform': 'transform',
      },
    },
  },
  plugins: [],
};