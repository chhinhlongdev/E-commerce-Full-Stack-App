import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./lib/tests/setup.tsx'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['app/**/*.tsx', 'components/**/*.tsx', 'lib/**/*.ts'],
      exclude: ['**/*.test.*', 'lib/tests/**'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
