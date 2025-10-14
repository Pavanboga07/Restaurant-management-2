import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use SWC for faster refresh
      fastRefresh: true,
      // Exclude large files from fast refresh
      exclude: /node_modules/,
    })
  ],
  
  // Performance optimizations
  build: {
    // Reduce chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          'state-vendor': ['zustand', 'axios'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
  
  // Development server optimizations
  server: {
    port: 5173,
    strictPort: true,
    // Faster file watching
    watch: {
      usePolling: false,
      // Ignore node_modules and more
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.vscode/**'],
    },
    // Fast HMR
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
    },
    // Proxy API calls to avoid CORS delays
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // Optimize dependencies (pre-bundle for faster dev server)
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'axios', 
      'zustand',
      'lucide-react',
      'react-hot-toast',
      'recharts',
      'react-dropzone'
    ],
    // Don't exclude common packages
    exclude: [],
    // Eagerly optimize
    esbuildOptions: {
      target: 'esnext',
    },
  },
  
  // Faster CSS processing
  css: {
    devSourcemap: false,
    // Improve Tailwind performance
    postcss: {
      plugins: [],
    },
  },
  
  // Resolve aliases for faster imports
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
