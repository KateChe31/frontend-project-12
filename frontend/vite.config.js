import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5002, // порт фронтенда
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // порт бэкенда (чата)
        changeOrigin: true,
        secure: false, // отключает проверку SSL, полезно при dev-сервере
      },
    },
  },
})
