/* eslint-disable jest/no-jest-import */
import lintStaged from 'lint-staged';
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
        // quiet: true,
        // debug: true
      });
      // Linting failed
      if (!result) {
        process.exit(1);
      }
    } catch (error) {
      // Linting errored
      console.info(error);
      process.exit(1);
    }
  },
};
