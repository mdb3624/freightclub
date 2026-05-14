/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Determine API target based on environment
const apiTarget = process.env.VITE_API_URL || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '9090'),
    host: true,
    allowedHosts: ['mikebarnes.tail67dcb4.ts.net', ...(process.env.VITE_ALLOWED_HOST ? [process.env.VITE_ALLOWED_HOST] : [])],
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
