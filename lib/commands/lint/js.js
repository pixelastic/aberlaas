import helper from '../../helper.js';
import _ from 'golgoth/lodash.js';
import firostError from 'firost/error.js';
import run from 'firost/run.js';

export default {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    return await helper.findHostFiles(userPatterns, ['.js']);
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
      '.eslintrc.cjs',
      'lib/configs/eslint.cjs',
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
      await this.__run(`${binary} ${options.join(' ')}`, { stdout: false });
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
