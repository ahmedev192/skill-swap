import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Add headers for development to allow SignalR
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' ws: wss: http://localhost:51423 https://localhost:51423; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'"
    }
  },
  preview: {
    // Add headers for preview mode as well
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' ws: wss: http://localhost:51423 https://localhost:51423; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'"
    }
  },
  build: {
    // Ensure the CSP meta tag is preserved in the build
    rollupOptions: {
      output: {
        // This ensures the HTML template is processed correctly
        manualChunks: undefined
      }
    }
  }
});
