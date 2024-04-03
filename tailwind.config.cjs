/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{jsx,js,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        georgia: ['Georgia'],
        fredokaOne: [
          'Fredoka One',
          'PingFang SC',
          'Microsoft Yahei',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        hanaleiFill: ['Hanalei Fill'],
        ruslanDisplay: ['Ruslan Display'],
        lobster: ['Lobster'],
        pacifico: ['Pacifico'],
        gloriaHallelujah: ['Gloria Hallelujah']
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
