import helper from '../helper';
import path from 'path';
import { _ } from 'golgoth';
import firost from 'firost';
export default {
  /**
   * Get list of files to lint.
   * Default is to read from ./lib, but if files are passed as CLI arguments,
   * then will take precedence.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} List of files to lint
   **/
  async inputFiles(cliArgs = {}) {
    // Reading from CLI or linting default files
    let inputFiles = helper.inputFromCli(cliArgs, [
      './lib/**/*.js',
      './*.js',
      './.*.js',
    ]);

    // Making all path relative to the host
    const hostRoot = helper.hostRoot();
    const fullPathGlobs = _.map(inputFiles, inputFile =>
      path.resolve(hostRoot, inputFile)
    );

    // Expanding globs
    // This is required because ESLint 5.16 currently stops if input glob don't
    // match actual files
    // https://github.com/eslint/eslint/issues/10587
    const allFiles = await firost.glob(fullPathGlobs);

    // Excluding all non-js files
    const onlyJsFiles = _.filter(allFiles, filepath => {
      return path.extname(filepath) === '.js';
    });

    return onlyJsFiles;
  },
  /**
   * Get the path to the ESLint config file.
   * Will look for a .eslintrc.js in the host root by default, or anything
   * passed on the --config flag. Will fallback on the default aberlaas config
   * if nothing is found.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {string} Path to the ESLint config file
   **/
  async configFile(cliArgs = {}) {
    // Taking value from --config in CLI in priority
    const configFromCli = cliArgs.config;
    if (configFromCli) {
      return configFromCli;
    }

    // Checking for .eslintrc.js in the host
    const configFromHost = helper.hostPath('.eslintrc.js');
    if (await firost.exists(configFromHost)) {
      return configFromHost;
    }

    // Fallback on default config in aberlaas
    return path.join(helper.aberlaasPath('configs/eslint.js'));
  },
  /**
   * Transform all aberlaas lint cli options into suitable eslint-cli options.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async eslintCliArguments(cliArgs = {}) {
    // Input files
    const inputFiles = await this.inputFiles(cliArgs);
    const options = [...inputFiles];

    // Misc
    options.push('--color');

    // Fix
    if (cliArgs.fix) {
      options.push('--fix');
    }

    return options;
  },
  /**
   * Lint all files and display results.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    const binary = await helper.which('eslint');
    const options = await this.eslintCliArguments(cliArgs);
    await helper.spawn(binary, options);
  },
};
