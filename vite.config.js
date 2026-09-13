import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: { port: Number(process.env.PORT) || 5188 },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
        legal: resolve(__dirname, 'legal/index.html'),
      },
    },
  },
});
