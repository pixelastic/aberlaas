/* eslint-disable jest/no-jest-import */
import lintStaged from 'lint-staged';
import firost from 'firost';
import helper from '../helper';

export default {
  async run(cliArgs) {
    // Config
    const configPath = await helper.configFile(
      cliArgs.config,
      '.lintstagedrc.js',
      'build/configs/lintstaged.js'
    );

    try {
      const result = await lintStaged({
        configPath,
      });
      // Linting failed
      if (!result) {
        throw firost.error(
          'ERROR_PRECOMMIT_LINT_FAILED',
          'Precommit linting failed'
        );
      }
    } catch (error) {
      throw firost.error('ERROR_PRECOMMIT', 'Precommit failed');
    }
  },
};
