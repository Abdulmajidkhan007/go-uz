import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, host: true },
  resolve: {
    alias: {
      '@': path.resolve(dir, './src'),
      '@vroom/types': path.resolve(dir, '../../packages/types/src'),
      '@vroom/validation': path.resolve(dir, '../../packages/validation/src'),
      '@vroom/api': path.resolve(dir, '../../packages/api/src'),
      '@vroom/ui': path.resolve(dir, '../../packages/ui/src'),
      '@vroom/theme': path.resolve(dir, '../../packages/theme/src'),
      '@vroom/utils': path.resolve(dir, '../../packages/utils/src'),
      '@vroom/constants': path.resolve(dir, '../../packages/constants/src'),
      '@vroom/config': path.resolve(dir, '../../packages/config/src'),
    },
  },
});
