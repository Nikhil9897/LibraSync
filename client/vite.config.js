import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks — cached separately from app code
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-icons', 'react-hot-toast'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['axios', 'date-fns'],
        },
      },
    },
    // Increase the chunk size warning limit since vendor chunks will be large
    chunkSizeWarningLimit: 600,
  },
})
