import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@vroom/types': path.resolve(__dirname, '../../packages/types/src'),
      '@vroom/validation': path.resolve(__dirname, '../../packages/validation/src'),
      '@vroom/api': path.resolve(__dirname, '../../packages/api/src'),
      '@vroom/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@vroom/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@vroom/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@vroom/constants': path.resolve(__dirname, '../../packages/constants/src'),
      '@vroom/config': path.resolve(__dirname, '../../packages/config/src'),
      '@vroom/assets': path.resolve(__dirname, '../../packages/assets/src'),
    },
  },
});
