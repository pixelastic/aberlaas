/* eslint-disable import/no-commonjs */
const path = require('path');
const jestExtendedPath = path.resolve(__dirname, './jest-extended.js');
module.exports = {
  // Default is jsdom, setting node as a default is more sensible as aberlaas is
  // geared toward creating node modules
  testEnvironment: 'node',

  // Use jest-extended (https://github.com/jest-community/jest-extended) for
  // additional matchers
  setupFilesAfterEnv: [jestExtendedPath],

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
