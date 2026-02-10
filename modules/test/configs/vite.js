import { dirname } from 'firost';
import { defaultExclude, defineConfig } from 'vitest/config';

const aberlaasVitestExclude = [...defaultExclude, '**/tmp/**'];

const configDir = dirname();

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
      `${configDir}/setupFiles/dedent.js`,
      `${configDir}/setupFiles/captureOutput.js`,
      `${configDir}/setupFiles/fit-xit-fdescribe-xdescribe.js`,
      `${configDir}/setupFiles/slow.js`,
      `${configDir}/setupFiles/jest-extended.js`,
      `${configDir}/setupFiles/describeName-testName.js`,
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
