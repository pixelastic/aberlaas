import { defaultExclude, defineConfig } from 'vitest/config';

const aberlaasVitestExclude = [...defaultExclude, '**/tmp/**'];

const configDir = new URL('./vite/', import.meta.url).pathname;

export default defineConfig({
  test: {
    // vitest default is to run in watch mode, we revert that
    watch: false,
    // Allow a success, even if no files are passed
    passWithNoTests: true,
    // Hide skipped tests, allowing less noisy debug with fit/fdescribe
    hideSkippedTests: true,

    // Tests should be in a __tests__ folder next to their code
    include: ['**/__tests__/**/*.js?(x)'],
    // We ignore temporary folders from the tests
    exclude: aberlaasVitestExclude,
    // Restore mocks after each tests
    restoreMocks: true,

    // Make describe, it, beforeEach and other globally available
    globals: true,
    // Run before each test file
    setupFiles: [
      `${configDir}/test/setupFiles/dedent.js`,
      `${configDir}/test/setupFiles/captureOutput.js`,
      `${configDir}/test/setupFiles/fit-xit-fdescribe-xdescribe.js`,
      `${configDir}/test/setupFiles/jest-extended.js`,
      `${configDir}/test/setupFiles/testName.js`,
    ],
  },
  server: {
    watch: {
      // Vitest 2.0 uses vite watcher, so files to exclude from watching are at
      // the server level
      // Source: https://vitest.dev/guide/migration.html#removal-of-the-watchexclude-option
      ignored: aberlaasVitestExclude,
    },
  },
});
