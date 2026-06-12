import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    // Use CJS interop so vi.mock works with require()-based modules
    server: {
      deps: { inline: ['mongoose', 'bcryptjs'] },
    },
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/tests/**', 'src/index.js'],
    },
  },
});
