import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteEslint from 'vite-plugin-eslint'
import svgr from 'vite-plugin-svgr'
import { resolve } from 'path'

import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    react(),
    viteEslint({
      failOnError: false
    }),
    svgr()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  css: {
    postcss: {
      plugins: [autoprefixer, tailwindcss]
    }
  }
})
