/* eslint-disable jest/no-jest-import */
const lintStaged = require('lint-staged');
const firostError = require('firost/lib/error');
const helper = require('../helper');

module.exports = {
  async run(cliArgs) {
    // Config
    const configPath = await helper.configFile(
      cliArgs.config,
      '.lintstagedrc.js',
      'lib/configs/lintstaged.js'
    );

    try {
      const result = await lintStaged({
        configPath,
      });
      // Linting failed
      if (!result) {
        throw firostError(
          'ERROR_PRECOMMIT_LINT_FAILED',
          'Precommit linting failed'
        );
      }
    } catch (error) {
      throw firostError('ERROR_PRECOMMIT', 'Precommit failed');
    }
  },
};
