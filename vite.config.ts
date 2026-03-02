import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      port: 5173,
    },
    fs: {
      strict: false,
    },
    // Do not set Cross-Origin-Opener-Policy: Google Sign-In (GSI) requires postMessage
    // from its iframe; COOP blocks that and causes "COOP policy would block postMessage" errors.
    proxy: {
      '/api': {
        target: 'http://localhost:5241',  // Use HTTP for Docker backend
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  optimizeDeps: {
    exclude: [],
  },
  appType: 'spa',
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        // Manual chunk splitting for vendor libraries
        manualChunks(id) {
          // React core - rarely changes
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          // Radix UI components - frequently used, medium change frequency
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-ui';
          }
          // Rich text editor - large, rarely changes
          if (id.includes('node_modules/@tiptap/')) {
            return 'vendor-editor';
          }
          // Charts and data visualization - large bundle
          if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // Icons - frequently imported but static
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          // Animation library - large
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-animation';
          }
          // PDF rendering - large, rarely used
          if (id.includes('node_modules/@react-pdf/')) {
            return 'vendor-pdf';
          }
        },
      },
    },
    // Enable source maps for production debugging (can be disabled if not needed)
    sourcemap: false,
    // Minification options
    minify: 'esbuild',
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Chunk size warning threshold (500KB)
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
  },
});