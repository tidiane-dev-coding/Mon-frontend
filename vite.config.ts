import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // En dev, les requêtes /api/* sont envoyées au backend local (évite ERR_CONNECTION_REFUSED si VITE_API_URL pointait vers un serveur arrêté).
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY || 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_DEV_API_PROXY || 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})


