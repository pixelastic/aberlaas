const helper = require('../../helper.js');
const path = require('path');
const lint = require('./index.js');
const _ = require('golgoth/lib/lodash');
const pMap = require('golgoth/lib/pMap');
const firostError = require('firost/error');
const read = require('firost/read');

module.exports = {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    return await lint.getInputFiles(['.json'], userPatterns);
  },
  /**
   * Lint all files and display results.
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {boolean} True on success
   **/
  async run(userPatterns) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }

    let hasErrors = false;
    const errorMessages = [];
    await pMap(files, async (filepath) => {
      try {
        this.__parse(await read(filepath));
      } catch (error) {
        hasErrors = true;
        const relativePath = path.relative(helper.hostRoot(), filepath);
        errorMessages.push(`Invalid JSON: ${relativePath}`);
        errorMessages.push(error.message);
      }
    });

    if (hasErrors) {
      throw firostError('JsonLintError', errorMessages.join('\n'));
    }
    return true;
  },
  /**
   * Autofix files in place
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {boolean} True on success
   **/
  async fix(userPatterns) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }
    await lint.fixWithPrettier(files);
  },
  __parse: JSON.parse,
};
