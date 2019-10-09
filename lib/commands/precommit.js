/* eslint-disable jest/no-jest-import */
import lintStaged from 'lint-staged';
import helper from '../helper';
// import { _ } from 'golgoth';

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
      if (!result) {
        process.exit(1);
      }
    } catch (error) {
      process.exit(1);
    }
  },
};
