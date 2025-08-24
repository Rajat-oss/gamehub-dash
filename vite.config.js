import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["a2a3629b5d60.ngrok-free.app", "6f1c396dd69b.ngrok-free.app", "b19c144873fb.ngrok-free.app", "b15c490c12b4.ngrok-free.app", "b9480a671c6f.ngrok-free.app"],
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
});
