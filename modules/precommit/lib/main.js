import lintStaged from 'lint-staged';
import { firostError, firostImport } from 'firost';
import helper from 'aberlaas-helper';

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
