import { configDefaults, defineConfig } from 'vitest/config';
const configDir = new URL('./vite/', import.meta.url).pathname;

export default defineConfig({
  test: {
    // Make describe, it, beforeEach and other globally available
    globals: true,
    // Tests should be in a __tests__ folder next to their code
    include: ['**/__tests__/**/*.js?(x)'],
    // We ignore additional folders
    exclude: [...configDefaults.exclude, '**/tmp/**'],
    // Restore mocks after each tests
    restoreMocks: true,

    // Run before each test file
    setupFiles: [
      `${configDir}/test/setupFiles/dedent.js`,
      `${configDir}/test/setupFiles/captureOutput.js`,
      `${configDir}/test/setupFiles/fit-xit-fdescribe-xdescribe.js`,
      `${configDir}/test/setupFiles/jest-extended.js`,
      `${configDir}/test/setupFiles/testName.js`,
    ],
  },
});
