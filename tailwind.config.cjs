/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{jsx,js,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        georgia: ['Georgia'],
        fredokaOne: [
          'Fredoka One',
          'ZCOOL KuaiLe',
          'system-ui',
          'PingFang SC',
          'Microsoft YaHei',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        sans: [
          'ui-sans-serif',
          'system-ui',
          'ZCOOL KuaiLe',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
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
      },
      backgroundImage: {
        transparent:
          "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')"
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['emerald']
  }
}
