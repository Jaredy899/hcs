import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Packages that get their own chunk, keyed by chunk name.
const CHUNK_GROUPS: Record<string, string[]> = {
  // React and its runtime
  vendor: ["react", "react-dom", "scheduler"],
  auth: ["@clerk/clerk-react"],
  convex: ["convex"],
  ui: [
    "@radix-ui/react-popover",
    "@radix-ui/react-select",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-label",
    "@radix-ui/react-slot",
  ],
  date: ["date-fns", "@daypicker/react"],
  utils: ["clsx", "class-variance-authority", "tailwind-merge", "lucide-react"],
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
    // The code below enables dev tools like taking screenshots of your site
    // while it is being developed on chef.convex.dev.
    // Feel free to remove this code if you're no longer developing your app with Chef.
    mode === "development"
      ? {
          name: "inject-chef-dev",
          transform(code: string, id: string) {
            if (id.includes("main.tsx")) {
              return {
                code: `
window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});
              ${code}
            `,
                map: null,
              };
            }
            return null;
          },
        }
      : null,
    // End of code for taking screenshots on chef.convex.dev.
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit to 600kb to reduce noise
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large dependencies into their own chunks. Rolldown only
        // accepts the function form.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          for (const [chunk, packages] of Object.entries(CHUNK_GROUPS)) {
            if (packages.some((pkg) => id.includes(`node_modules/${pkg}/`))) {
              return chunk;
            }
          }
        },
      },
    },
    // Enable minification and tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
    // Enable source maps for debugging (optional)
    sourcemap: false,
    // Additional optimizations
    target: 'esnext',
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@clerk/clerk-react', 'convex/react'],
    exclude: ['@vite/client', '@vite/env'],
  },
}));
