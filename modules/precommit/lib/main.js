import { consoleInfo, consoleWarn, firostError } from 'firost';
import { getConfig } from 'aberlaas-helper';
import lintStaged from 'lint-staged';
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
  const options = await __.getOptions(cliArgs);

  // Grab all errors output by lint-staged, to display later
  const errors = [];
  const logger = {
    log: consoleInfo,
    warn: consoleWarn,
    error(error) {
      errors.push(error);
    },
  };

  const canCommit = await __.lintStaged(options, logger);

  // Stop if can commit
  if (canCommit) {
    return true;
  }

  // Throw error if can't commit
  throw __.firostError('ABERLAAS_PRECOMMIT_LINT_FAILED', errors);
}

__ = {
  /**
   * Retrieves configuration options for lint-staged execution
   * @param {object} cliArgs - Command line arguments object
   * @param {string} [cliArgs.config] - Path to custom configuration file
   * @returns {object} configuration options object with config, additional options, and shell set to true
   */
  async getOptions(cliArgs) {
    // Find the most relevant config
    const config = await getConfig(
      cliArgs.config,
      'lintstaged.config.js',
      lintStagedConfig,
    );

    return {
      config,
      ...additionalOptions, // Additional overrides from tests
    };
  },
  lintStaged,
  firostError,
  // Internal methods to pass additional options to lint-staged, for tests
  addOption(key, value) {
    additionalOptions[key] = value;
  },
  clearOptions() {
    additionalOptions = {};
  },
};

export default { run };
