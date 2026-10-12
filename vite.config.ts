import { defineConfig } from 'vite'
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
      failOnError: false,
      exclude: [
        '/registerSW.js',
        'dist',
        'node_modules',
        'dev-dist',
        '/dev-sw.js'
      ],
      eslintPath: 'eslint'
    }),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Paint Board - Creative Canvas',
        short_name: 'Paint Board',
        description:
          'A powerful web-based creative canvas for drawing, designing, and digital art creation.',
        start_url: '/paint-board/',
        scope: '/paint-board/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#eef1ff',
        theme_color: '#eef1ff',
        categories: ['graphics', 'productivity', 'utilities'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          {
            src: '/paint-board/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/paint-board/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/paint-board/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'],
        globIgnores: [
          '**/node_modules/**/*',
          'sw.js',
          'workbox-*.js',
          '**/huggingface*.js'
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
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
      // Autoprefixer's overload is not a PostCSS AcceptedPlugin.
      plugins: [tailwindcss, autoprefixer] as any
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          huggingface: ['@huggingface/transformers'],
          fabric: ['fabric'],
          'react-vendor': ['react', 'react-dom'],
          'ui-libs': ['daisyui', 'react-best-gradient-color-picker'],
          utils: ['lodash-es', 'uuid', 'immer', 'jsondiffpatch'],
          i18n: ['i18next', 'react-i18next'],
          'canvas-libs': ['roughjs', 'gradient-parser'],
          misc: ['idb-keyval', 'zustand', 'sortablejs', 'react-image-crop']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
