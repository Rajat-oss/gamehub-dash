import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["d68eb8929460.ngrok-free.app"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Increase warning threshold (Three.js is intentionally large)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React runtime — always tiny, always cached
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // Router — small, separate cache chunk
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'router';
          }
          // Three.js + @react-three — very large, isolated chunk so it's
          // only downloaded when the landing page shader loads
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'three';
          }
          // Framer-motion — medium, separate cache chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Firebase — large SDK, isolated
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }
          // Radix UI primitives — many small files, group together
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          // Lucide icons — tree-shaken by Vite/Rollup, but group for caching
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide';
          }
          // Tanstack Query
          if (id.includes('node_modules/@tanstack')) {
            return 'tanstack';
          }
        },
      },
    },
    // SWC already minifies JS; also minify CSS
    cssMinify: true,
    // Target modern browsers for smaller output
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  },
});
