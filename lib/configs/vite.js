import { defineConfig } from 'vitest/config';
const configDir = new URL('./vitest/', import.meta.url).pathname;

export default defineConfig({
  test: {
    // Make describe, it, beforeEach and other globally available
    globals: true,
    // Tests should be in a __tests__ folder
    include: ['**/__tests__/**/*.js?(x)'],

    // Run before each test file
    setupFiles: [
      `${configDir}/testName.js`,
      `${configDir}/fit-xit-fdescribe-xdescribe.js`,
    ],
  },
});
