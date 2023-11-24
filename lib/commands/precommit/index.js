import lintStaged from 'lint-staged';
import firostError from 'firost/error.js';
import helper from '../../helper.js';

export default {
  async run(cliArgs) {
    // Config
    const configPath = await helper.configFile(
      cliArgs.config,
      '.lintstagedrc.cjs',
      'lib/configs/lintstaged.cjs',
    );

    try {
      const result = await lintStaged({
        configPath,
      });
      // Linting failed
      if (!result) {
        throw firostError(
          'ERROR_PRECOMMIT_LINT_FAILED',
          'Precommit linting failed',
        );
      }
    } catch (error) {
      throw firostError('ERROR_PRECOMMIT', 'Precommit failed');
    }
  },
};
