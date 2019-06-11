import helper from '../helper';
import path from 'path';
import { _ } from 'golgoth';
import firost from 'firost';

export default {
  /**
   * Get list of files to build.
   * Default is to read from ./lib, but if files are passed as CLI arguments,
   * then will take precedence
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} List of files to build
   **/
  inputFiles(cliArgs = {}) {
    return _.get(cliArgs, '_', ['./lib']);
  },
  /**
   * Get build directory
   * Default is to write in ./build, but can be overwritten with the --out-dir
   * cli argument
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Build directory
   **/
  outputDir(cliArgs = {}) {
    return _.get(cliArgs, 'out-dir', './build');
  },
  /**
   * Get the path to the babel config file
   * Will look for a babel.config.js in the host root by default, or anything
   * passed on the --config flag. Will fallback on the default aberlaas config
   * if nothing is found
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {String} Path to the babel config file
   **/
  async configFile(cliArgs = {}) {
    // Taking value from --config in CLI in priority
    const configFromCli = cliArgs.config;
    if (configFromCli) {
      return configFromCli;
    }

    // Checking for babel.config.js in the host
    const configFromHost = helper.hostPath('babel.config.js');
    if (await firost.exists(configFromHost)) {
      return configFromHost;
    }

    // Fallback on default config in aberlaas
    return path.join(helper.aberlaasPath('configs/babel.js'));
  },
  /**
   * Get the list of file pattern to ignore when building
   * Default is all test files, anything in node_modules and anything
   * specifically passed through the --ignore option
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of patterns to ignore
   **/
  ignorePatterns(cliArgs = {}) {
    const defaultIgnore = [
      '__tests__',
      '*.test.js',
      'test-helper.js',
      'node_modules',
    ];
    const cliPatterns = _.get(cliArgs, 'ignore', []);
    const hostRoot = helper.hostRoot();
    return _.chain(defaultIgnore)
      .concat(cliPatterns)
      .flatten()
      .compact()
      .map(glob => path.join(hostRoot, '**', glob))
      .value();
  },
  /**
   * Transform all aberlaas build cli options into suitable babel-cli options
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async babelCliArguments(cliArgs) {
    // Input files
    const inputFiles = this.inputFiles(cliArgs);
    const options = [...inputFiles];

    // Ignore files
    const ignorePatterns = this.ignorePatterns(cliArgs);
    _.each(ignorePatterns, ignorePattern => {
      options.push('--ignore');
      options.push(ignorePattern);
    });

    // Config
    const configFile = await this.configFile(cliArgs);
    options.push('--config-file');
    options.push(configFile);

    // Output
    const outputDir = this.outputDir(cliArgs);
    options.push('--out-dir');
    options.push(outputDir);

    // Misc
    options.push('--verbose');

    // Watch mode
    if (cliArgs.watch) {
      options.push('--watch');
      options.push('--source-maps');
      options.push('inline');
    }

    return options;
  },

  /**
   * Run the build, converting all js files in sources to their transpiled
   * version in destination
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Void}
   **/
  async run(cliArgs = {}) {
    const binary = await helper.which('babel');
    const options = await this.babelCliArguments(cliArgs);

    const outputDir = this.outputDir(cliArgs);
    await firost.mkdirp(outputDir);

    helper.spawn(binary, options);
  },
};
