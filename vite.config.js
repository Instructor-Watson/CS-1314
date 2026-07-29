import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative paths for static hosting compatibility (GitHub Pages, Netlify, Vercel)
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Optimize bundle size using esbuild (faster than terser)
    minify: 'esbuild',
    
    // Enable source maps for debugging (can be disabled for smaller builds)
    sourcemap: false,
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          'monaco-editor': ['monaco-editor']
          // Note: Pyodide is loaded from CDN, not bundled
        },
        
        // Optimize asset naming for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      },
      
      // Externalize Node.js dependencies that Pyodide tries to import
      external: ['node-fetch', 'fs', 'path', 'url', 'crypto']
    },
    
    // Copy data directory to dist
    copyPublicDir: true,
    
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  
  // Data directory as public dir (assignments.json, test files)
  publicDir: 'data',
  
  server: {
    port: 3000,
    // Enable HTTPS in development to match production
    https: false
  },
  
  resolve: {
    alias: [
      {
        find: /^monaco-editor$/, 
        replacement: 'monaco-editor/esm/vs/editor/editor.api.js'
      }
    ]
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['monaco-editor'],
    exclude: ['pyodide'] // Pyodide should be loaded from CDN
  },
  
  // Prevent Vite from processing Pyodide's internal modules
  ssr: {
    noExternal: []
  },
  
  test: {
    globals: true,
    environment: 'jsdom'
  }
});


