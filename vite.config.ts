import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
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
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit to 1MB to reduce noise
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking strategy to split large dependencies
        manualChunks: {
          // Authentication chunk - Clerk is quite large
          'auth': ['@clerk/clerk-react'],
          
          // Database chunk - Convex client
          'convex': ['convex/react'],
          
          // UI library chunk - Radix UI components
          'ui-radix': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog', 
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot'
          ],
          
          // Form handling chunk
          'forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // Date handling chunk
          'dates': [
            'date-fns',
            'react-day-picker'
          ],
          
          // Utility libraries chunk
          'utils': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ],
          
          // Icons and notifications
          'ui-extras': [
            'lucide-react',
            'sonner'
          ],
          
          // React core (keep together for better caching)
          'react-vendor': ['react', 'react-dom']
        },
        
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        
        // Optimize asset naming
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Enable source maps for better debugging (optional, increases build size)
    sourcemap: false,
    
    // Optimize for production
    minify: 'esbuild',
    target: 'es2020',
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Additional optimizations
    reportCompressedSize: false, // Speeds up build
    emptyOutDir: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@clerk/clerk-react',
      'convex/react',
      // Pre-bundle commonly used utilities
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      // Exclude large dependencies that should be loaded on demand
    ]
  },
  
  // Performance optimizations
  server: {
    // Improve dev server performance
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
}));
