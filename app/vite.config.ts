import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'index.html'),
        popup: resolve(__dirname, 'popup.html'),
        sw: resolve(__dirname, 'src/sw/service-worker.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js'
        }
      },
      external: ['popup.js'],
      onwarn(warning, warn) {
        // Suppress 'use client' directive warnings from dependencies
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        // Suppress popup.js bundling warning since it's handled separately
        if (warning.message && warning.message.includes('popup.js')) {
          return
        }
        warn(warning)
      }
    }
  },
  plugins: [react()],
})
