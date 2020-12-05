const helper = require('../../helper.js');
const lint = require('./index.js');
const _ = require('golgoth/lodash');
const firostError = require('firost/error');
const run = require('firost/run');
module.exports = {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    return await lint.getInputFiles(['.css'], userPatterns);
  },
  /**
   * Lint all files and display results.
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @returns {boolean} True on success
   **/
  async run(userPatterns, userConfigFile) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }

    const configFile = await helper.configFile(
      userConfigFile,
      '.stylelintrc.js',
      'lib/configs/stylelint.js'
    );
    const binary = await helper.which('stylelint');
    const options = [...files, '--color', '--config', configFile];
    try {
      await run(`${binary} ${options.join(' ')}`, { stdout: false });
    } catch (error) {
      // If it fails because no files passed actually exists, it's not really
      // a failure
      const errorMessage = error.stdout;
      if (_.startsWith(errorMessage, 'Error: No files matching the pattern')) {
        return true;
      }
      throw firostError('ERROR_CSS_LINT', error.stdout);
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
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }
    // Try to pretiffy as much as we can
    await lint.fixWithPrettier(files);
    // Still run a lint on it so it can fail if not everything is fixed
    await this.run(userPatterns, userConfigFile);
    return true;
  },
  __run: run,
};
