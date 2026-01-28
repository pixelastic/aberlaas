// import { _ } from 'golgoth';
import lintStaged from 'lint-staged';
import { firostError } from 'firost';
import { getConfig } from 'aberlaas-helper';
import lintStagedConfig from '../configs/lintstaged.js';

export let __;
let additionalOptions = {};

/**
 * Runs precommit linting using lint-staged with the provided configuration
 * @param {object} cliArgs - Command line arguments object
 * @param {string} [cliArgs.config] - Path to custom configuration file
 * @returns {boolean} True on success
 */
export async function run(cliArgs = {}) {
  const config = await getConfig(
    cliArgs.config,
    'lintstaged.config.js',
    lintStagedConfig,
  );

  const options = {
    config,
    ...additionalOptions,
    shell: true,
  };

  const errors = [];
  const logger = {
    log(input) {
      console.log('Log:', input);
    },
    info(input) {
      console.log('info:', input);
    },
    warn(input) {
      console.log('warn:', input);
    },
    error(error) {
      console.log('error:', error);
      errors.push(error);
    },
  };

  const result = await __.lintStaged(options, logger);
  if (result) {
    return true;
  }

  throw __.firostError(
    'ABERLAAS_PRECOMMIT_LINT_FAILED',
    `Precommit linting failed:${errors.join('\n')}`,
  );
}

__ = {
  // Internal methods to pass additional options to lint-staged, for tests
  addOption(key, value) {
    additionalOptions[key] = value;
  },
  clearOptions() {
    additionalOptions = {};
  },
  lintStaged,
  firostError,
};

export default { run };
