import { dirname } from 'firost';
import { defaultExclude, defineConfig } from 'vitest/config';

const aberlaasVitestExclude = [...defaultExclude, '**/tmp/**', '**/*.bench.js'];

const configDir = dirname();

export default defineConfig({
  test: {
    // vitest default is to run in watch mode, we revert that
    watch: false,
    // Allow a success, even if no files are passed
    passWithNoTests: true,
    // Hide skipped tests, allowing less noisy debug with fit/fdescribe
    hideSkippedTests: true,

    // Display details of tests as they run
    reporters: ['tree'],

    // Tests should be in a __tests__ folder next to their code
    include: ['**/__tests__/**/*.js?(x)'],
    // We ignore temporary folders from the tests
    exclude: aberlaasVitestExclude,

    // Restore mocks to their real implementation between tests
    restoreMocks: true,
    // Clear the number of time a mock has been called between tests
    clearMocks: true,

    // Make describe, it, beforeEach and other globally available
    globals: true,
    // Run before each test file
    setupFiles: [
      `${configDir}/setupFiles/bench.js`,
      `${configDir}/setupFiles/captureOutput.js`,
      `${configDir}/setupFiles/dedent.js`,
      `${configDir}/setupFiles/describeName.js`,
      `${configDir}/setupFiles/focus.js`,
      `${configDir}/setupFiles/jest-extended.js`,
      `${configDir}/setupFiles/skip.js`,
      `${configDir}/setupFiles/slow.js`,
      `${configDir}/setupFiles/testName.js`,
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
