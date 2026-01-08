import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'TechOrbit - Modern E-Commerce',
        short_name: 'TechOrbit',
        description: 'Experience the future of shopping with TechOrbit.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        start_url: './',
        display: 'standalone',
        background_color: '#ffffff',
        orientation: 'portrait'
      }
    })
  ],
  server: {
    host: true, // Allow network access
    port: 5173,      // Default Vite port
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks: {
        //   'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        //   'ui-vendor': ['framer-motion', '@stripe/react-stripe-js', '@stripe/stripe-js', 'recharts']
        // }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
