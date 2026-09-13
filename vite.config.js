import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: Number(process.env.PORT) || 5188 },
  build: { chunkSizeWarningLimit: 1200 },
});
