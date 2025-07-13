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
      }
    }
  },
  plugins: [react()],
})
