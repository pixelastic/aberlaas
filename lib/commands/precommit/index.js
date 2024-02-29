import lintStaged from 'lint-staged';
import { firostError, firostImport } from 'firost';
import helper from '../../helper.js';

export default {
  async run(cliArgs) {
    // Config
    const configPath = await helper.configFile(
      cliArgs.config,
      'lintstaged.config.js',
      'configs/lintstaged.js',
    );
    const config = await firostImport(configPath);

    try {
      const result = await lintStaged({
        config,
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
