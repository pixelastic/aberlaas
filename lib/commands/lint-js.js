const helper = require('../helper');
const lint = require('./lint');
const _ = require('golgoth/lib/lodash');
const firostError = require('firost/lib/error');
const run = require('firost/lib/run');
module.exports = {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    return await lint.getInputFiles(['.js'], userPatterns);
  },
  /**
   * Lint all files and display results.
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @param {Array} additionalOptions Other options to pass to the eslint CLI
   * @returns {boolean} True on success
   **/
  async run(userPatterns, userConfigFile, additionalOptions = []) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }

    const configFile = await helper.configFile(
      userConfigFile,
      '.eslintrc.js',
      'lib/configs/eslint.js'
    );
    const pluginResolveDir = helper.aberlaasRoot();
    const options = [
      ...files,
      ...additionalOptions,
      '--color',
      `--config=${configFile}`,
      `--resolve-plugins-relative-to=${pluginResolveDir}`,
    ];
    const binary = await helper.which('eslint');

    try {
      await run(`${binary} ${options.join(' ')}`, { stdout: false });
    } catch (error) {
      throw firostError('JavaScriptLintError', error.stdout);
    }
    return true;
  },
  /**
   * Autofix files in place
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @returns {boolean} True on success
   **/
  async fix(userPatterns, userConfigFile) {
    return await this.run(userPatterns, userConfigFile, ['--fix']);
  },
  __run: run,
};
