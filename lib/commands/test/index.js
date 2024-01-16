import helper from '../../helper.js';
import run from 'firost/run.js';
import _ from 'golgoth/lodash.js';

export default {
  /**
   * Test all files using Vitest
   * Usage:
   * $ aberlaas test                                # Test all files
   * $ aberlaas test ./path/to/__tests__/file.js    # Test specific files
   * $ aberlaas test ./path/to/file.js              # Test specific files
   * $ aberlaas test --related                      # Test all related files
   * $ aberlaas test --failFast                     # Stop early as soon as one test fails
   * $ aberlaas test --flags                        # Flags passed to vitest
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} true on success
   **/
  async run(cliArgs) {
    const options = await this.vitestCliOptions(cliArgs);

    await run(`yarn run vitest ${options.join(' ')}`, { stdin: true });
    return true;
  },

  /**
   * Transform all aberlaas test cli options into suitable vitest CLI options
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async vitestCliOptions(cliArgs = {}) {
    // Options that have special meaning in aberlaas and shouldn't be passed
    // as-is to vitest
    const aberlaasOptions = ['_', 'watch', 'config', 'failFast', 'related'];

    // Input files
    const inputFiles = _.isEmpty(cliArgs._) ? [helper.hostPath()] : cliArgs._;
    const vitestOptions = [...inputFiles];

    // Run "vitest related" when --related is passed
    if (cliArgs.related) {
      vitestOptions.unshift('related');
    }

    // Stop early as soon as one test fails
    if (cliArgs.failFast) {
      vitestOptions.push('--bail=1');
    }

    // Disable watch by default
    vitestOptions.push(cliArgs.watch ? '--watch=true' : '--watch=false');

    // Allow a success, even if no files are passed
    vitestOptions.push('--passWithNoTests');

    // Hide skipped tests, allowing less noisy debug with fit/fdescribe
    vitestOptions.push('--hideSkippedTests');

    // Config file
    const configFile = await helper.configFile(
      cliArgs.config,
      'vite.config.js',
      'lib/configs/vite.js',
    );
    vitestOptions.push(`--config=${configFile}`);

    // Pass any unknown options to vitest
    _.each(cliArgs, (argValue, argKey) => {
      // Skip keys that we already handled
      if (_.includes(aberlaasOptions, argKey)) {
        return;
      }

      if (argValue === true) {
        vitestOptions.push(`--${argKey}`);
        return;
      }

      vitestOptions.push(`--${argKey}=${argValue}`);
    });

    return vitestOptions;
  },
};
