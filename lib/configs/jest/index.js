const path = require('path');
const jestExtendedPath = path.resolve(__dirname, './jest-extended.js');
const setupFileAfterEnv = path.resolve(__dirname, './setupFileAfterEnv.js');
const testEnvironment = path.resolve(__dirname, './testEnvironment.js');
module.exports = {
  // Custom environment that automatically set testName and allow for --failFast
  testEnvironment,

  // Use additional Jest plugins
  setupFilesAfterEnv: [jestExtendedPath, setupFileAfterEnv],

  // We need to set rootDir to the host directory, otherwise Jest will assume
  // test are to be looked for in the directory that contains the config (ie.
  // aberlaas).
  rootDir: process.cwd(),

  // Tests should be in a __tests__ folder
  testMatch: ['**/__tests__/**/*.js?(x)'],

  // By default watch mode watches for changes in all directories, and whenever
  // a test file or associated code file changes, it re-runs tests.
  // This can cause useless re-render of tests when it catches changes in
  // directories like ./tmp, etc, so we exclude such directories
  // watchPathIgnorePatterns only accept RegExp and not globs, so we have to
  // deal with ((.*)/)? to express any depth of folders
  watchPathIgnorePatterns: [
    '<rootDir>/((.*)/)?node_modules/',
    '<rootDir>/((.*)/)?tmp/',
    '<rootDir>/((.*)/)?templates/',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/((.*)/)?fixtures/',
    '<rootDir>/((.*)/)?tmp/',
    '<rootDir>/((.*)/)?templates/',
  ],

  moduleNameMapper: {
    // When using lodash-es (which is treeshakeable, thus preferable in front-end
    // envs), it will fail in tests as it isn't compiled to ES5.
    // So, we make jest load the full lodash instead. Note that the lib still
    // needs to be added as a devDependency
    '^lodash-es$': 'lodash',
  },

  bail: true,

  resetMocks: true,
  restoreMocks: true,
};
