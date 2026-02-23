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
          // ── DO NOT manually chunk React or Radix UI ──────────────────────
          // React must be co-located with Radix UI in the same chunk (or the
          // entry chunk). If React is split out, Rollup cannot guarantee it
          // evaluates before Radix UI calls React.forwardRef() at module-init
          // time — causing: "Cannot read properties of undefined (reading
          // 'forwardRef')". Let Rollup handle React + Radix naturally.

          // Three.js — very large, safe to isolate (no React.forwardRef deps)
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'three';
          }
          // Firebase — large SDK, no init-time React dependency
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }
          // Framer-motion — self-contained, safe chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Tanstack Query — self-contained
          if (id.includes('node_modules/@tanstack')) {
            return 'tanstack';
          }
          // React Router — safe to isolate (lazy-loaded after React is ready)
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'router';
          }
          // Everything else (React, Radix, Lucide, shadcn) → let Rollup decide
          // Rollup will bundle them together in dependency order automatically.
        },
      },
    },
    // SWC already minifies JS; also minify CSS
    cssMinify: true,
    // Target modern browsers for smaller output
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  },
});
