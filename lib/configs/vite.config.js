import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Make describe, it, beforeEach and other globally available
    globals: true,
    // Tests should be in a __tests__ folder
    include: ['**/__tests__/**/*.js?(x)'],
  },
});
