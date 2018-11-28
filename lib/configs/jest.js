/* eslint-disable import/no-commonjs */
module.exports = {
  // We need to set rootDir to the host directory, otherwise Jest will assume
  // test are to be looked for in the directory that contains the config (ie.
  // aberlaas).
  rootDir: process.cwd(),

  // Tests should be in a __tests__ folder
  testMatch: ['**/__tests__/**/*.js?(x)'],

  bail: true,
  resetMocks: true,
  restoreMocks: true,
};
