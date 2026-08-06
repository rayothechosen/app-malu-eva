import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const standaloneApp = mode === "eva" || mode === "malu" || mode === "malu-lp" ? mode : null;
  const appRoot = standaloneApp ? path.resolve(__dirname, "apps", standaloneApp) : __dirname;

  return {
  root: appRoot,
  envDir: __dirname,
  server: {
    host: "::",
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: standaloneApp ? path.resolve(__dirname, "dist", standaloneApp) : "dist",
    emptyOutDir: standaloneApp ? true : undefined,
    rollupOptions: {
      input: standaloneApp ? path.resolve(appRoot, "index.html") : undefined,
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
};
});
