import lintStaged from 'lint-staged';
import firostError from 'firost/error.js';
import helper from '../../helper.js';

export default {
  async run(cliArgs) {
    // Config
    const configPath = await helper.configFile(
      cliArgs.config,
      '.lintstagedrc.js',
      'lib/configs/lintstaged.js',
    );
    const config = await helper.import(configPath);

    try {
      console.info(configPath);
      const result = await lintStaged({
        config,
      });
      console.info(result);
      // Linting failed
      if (!result) {
        throw firostError(
          'ERROR_PRECOMMIT_LINT_FAILED',
          'Precommit linting failed',
        );
      }
    } catch (error) {
      console.info(error);
      throw firostError('ERROR_PRECOMMIT', 'Precommit failed');
    }
  },
};
