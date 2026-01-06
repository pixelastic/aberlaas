import lintStaged from 'lint-staged';
import { firostError } from 'firost';
import { getConfig } from 'aberlaas-helper';
import lintStagedConfig from '../configs/lintstaged.js';

export default {
  async run(cliArgs) {
    // Config
    const config = await getConfig(
      cliArgs.config,
      'lintstaged.config.js',
      lintStagedConfig,
    );

    try {
      const result = await lintStaged({
        config,
        // Allow use extended shell syntax in config, like pipes, redirects or
        // env variables
        shell: true,
      });
      // Linting failed
      if (!result) {
        throw firostError(
          'ERROR_PRECOMMIT_LINT_FAILED',
          'Precommit linting failed',
        );
      }
    } catch (_error) {
      throw firostError('ERROR_PRECOMMIT', 'Precommit failed');
    }
  },
};
