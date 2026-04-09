import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // any request starting with /api is forwarded to Express server
      // vue code calling axios.get('/api/pokemon/1') gets rewritten as
      // http://127.0.0.1:3000/pokemon/1 before it hits the network :)
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/../shared'
    }
  }
})
