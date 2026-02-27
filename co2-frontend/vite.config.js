import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    },
    fs: {
      allow: [
        '.',      // 현재 폴더
        '..'     // 상위 폴더 (co2_stream/node_modules 포함)
      ]
    }
  }
})