/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
  ],
  theme: {
    extend: {
      width: {
        128: '32rem',
      },
      colors: {
        'dark-green': '#083328ff',
        'hunter-green': '#3E5335ff',
        'reseda-green': '#738952ff',
        'rust-orange': '#AA552Cff',
        'almond-beige': '#F2DECAff',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
}
