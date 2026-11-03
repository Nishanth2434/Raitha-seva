/**
 * Vite config for Capacitor / Android static SPA build.
 *
 * This is a separate config that produces a plain static bundle in
 * `dist-capacitor/` — no Nitro/SSR, no Vercel preset, just client assets.
 * Capacitor's webDir points here.
 *
 * Build: npx vite build --config vite.config.capacitor.ts
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    // TanStack Router code-gen (client-only mode — no SSR)
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "dist-capacitor",
    emptyOutDir: true,
    rollupOptions: {
      input: "./capacitor-spa/index.html",
      output: {
        // In rolldown/Vite 8, manualChunks must be a function
        manualChunks(id: string) {
          if (id.includes("node_modules/@supabase")) return "supabase";
          if (id.includes("node_modules/@radix-ui")) return "radix";
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "react";
          if (id.includes("node_modules/@tanstack")) return "tanstack";
        },
      },
    },
  },
  // In Capacitor the app is loaded from the device filesystem (file://), so
  // the base must be relative.
  base: "./",
  define: {
    // Let app code detect Capacitor context
    "process.env.CAPACITOR": JSON.stringify("true"),
  },
});
