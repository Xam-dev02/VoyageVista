import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le proxy fait croire au navigateur que l'API est sur la même origine
// que le front -> les cookies de session PHP fonctionnent sans souci CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
