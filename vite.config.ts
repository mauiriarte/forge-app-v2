import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base matches the GitHub Pages project path (https://<user>.github.io/forge-app-v2/)
export default defineConfig({
  base: '/forge-app-v2/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Forge — Workout Tracker',
        short_name: 'Forge',
        description: 'Train, hydrate and track your body — all in one place.',
        theme_color: '#15161A',
        background_color: '#15161A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/forge-app-v2/',
        start_url: '/forge-app-v2/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,woff2}'],
      },
    }),
  ],
  server: { port: 5178 },
})
