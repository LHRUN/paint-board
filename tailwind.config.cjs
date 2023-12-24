/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{jsx,js,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        georgia: ['Georgia', 'cursive'],
        fredokaOne: ['Fredoka One', 'cursive'],
        hanaleiFill: ['Hanalei Fill', 'cursive'],
        ruslanDisplay: ['Ruslan Display', 'cursive'],
        lobster: ['Lobster', 'cursive'],
        pacifico: ['Pacifico', 'cursive'],
        gloriaHallelujah: ['Gloria Hallelujah', 'cursive']
      },
      screens: {
        xs: {
          max: '750px'
        },
        'min-xs': {
          min: '750px'
        }
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: '',
    // eslint-disable-next-line no-dupe-keys
    themes: ['emerald']
  }
}
