import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import viteEslint from 'vite-plugin-eslint'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const getCache = ({ name, pattern }: any) => ({
  urlPattern: pattern,
  handler: 'StaleWhileRevalidate' as const,
  options: {
    cacheName: name,
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
    }
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  base: '/paint-board',
  optimizeDeps: {
    esbuildOptions: { supported: { bigint: true } }
  },
  esbuild: {
    supported: {
      bigint: true
    }
  },
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    react(),
    viteEslint({
      failOnError: false
    }),
    svgr(),
    splitVendorChunkPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'PAINT-BOARD',
        short_name: 'paint-board',
        start_url: '/paint-board/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/paint-board/pwa-32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: '/paint-board/pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/paint-board/pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'],
        runtimeCaching: [
          getCache({
            pattern: /^https:\/\/raw\.githubusercontent\.com\//,
            name: 'github-raw-content'
          }),
          getCache({
            pattern: /^https:\/\/fonts\.googleapis\.com\//,
            name: 'google-fonts-stylesheets'
          }),
          getCache({
            pattern: /^https:\/\/fonts\.gstatic\.com\//,
            name: 'google-fonts-webfonts'
          }),
          getCache({
            pattern: /^https:\/\/fonts\.font\.im\//,
            name: 'font-im'
          })
        ]
      }
    })
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
