/* eslint-disable import/no-commonjs */
module.exports = {
  // We need to set rootDir to the host directory, otherwise Jest will assume
  // test are to be looked for in the directory that contains the config (ie.
  // aberlaas).
  rootDir: process.cwd(),

  // Tests should be in a __tests__ folder
  testMatch: ['**/__tests__/**/*.js?(x)'],

  // By default watch mode watches for changes in all directories, and whenever
  // a test file or associated code file changes, it re-runs tests.
  // This can cause uselessre-render of tests when it catches changes in directories like ./build,
  // ./tmp, etc, so we exclude such directories
  // watchPathIgnorePatterns only accept RegExp and not globs, so we have to
  // deal with ((.*)/)? to express any depth of folders
  watchPathIgnorePatterns: [
    '<rootDir>/((.*)/)?build/',
    '<rootDir>/((.*)/)?node_modules/',
    '<rootDir>/((.*)/)?tmp/',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/((.*)/)?build/',
    '<rootDir>/((.*)/)?fixtures/',
  ],

  bail: true,
  resetMocks: true,
  restoreMocks: true,
};
