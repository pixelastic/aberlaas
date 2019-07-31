import helper from '../helper';
import { _ } from 'golgoth';
import firost from 'firost';

export default {
  /**
   * Get build directory
   * Default is to write in ./build, but can be overwritten with the --out-dir
   * cli argument
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Build directory
   **/
  outputDir(cliArgs = {}) {
    return _.get(cliArgs, 'out-dir', './build');
  },
  /**
   * Get the list of file pattern to ignore when building
   * Default is all test files, anything in node_modules and anything
   * specifically passed through the --ignore option
   * @param {object} cliArgs CLI Argument object, as created by minimist
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
    return _.chain(defaultIgnore)
      .concat(cliPatterns)
      .flatten()
      .compact()
      .map(glob => helper.hostPath(`**/${glob}`))
      .value();
  },
  /**
   * Transform all aberlaas build cli options into suitable babel-cli options
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async babelCliArguments(cliArgs) {
    // Input files
    const inputFiles = helper.inputFromCli(cliArgs, ['./lib']);
    const options = [...inputFiles];

    // Ignore files
    const ignorePatterns = this.ignorePatterns(cliArgs);
    _.each(ignorePatterns, ignorePattern => {
      options.push('--ignore');
      options.push(ignorePattern);
    });

    // Config
    const configFile = await helper.configFile(
      cliArgs,
      'babel.config.js',
      'build/configs/babel.js'
    );
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
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs = {}) {
    const binary = await helper.which('babel');
    const options = await this.babelCliArguments(cliArgs);

    const outputDir = this.outputDir(cliArgs);
    await firost.mkdirp(outputDir);

    helper.spawn(binary, options);
  },
};
