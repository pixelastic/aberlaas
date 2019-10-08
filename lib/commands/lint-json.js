import helper from '../helper';
import firost from 'firost';
import path from 'path';
import lint from './lint';
import { _, pMap } from 'golgoth';
export default {
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
    await pMap(files, async filepath => {
      try {
        this.__parse(await firost.read(filepath));
      } catch (error) {
        hasErrors = true;
        const relativePath = path.relative(helper.hostRoot(), filepath);
        errorMessages.push(`Invalid JSON: ${relativePath}`);
        errorMessages.push(error.message);
      }
    });

    if (hasErrors) {
      throw helper.error('JsonLintError', errorMessages.join('\n'));
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
