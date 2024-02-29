import path from 'path';
import { _, pMap } from 'golgoth';
import { firostError, read } from 'firost';
import helper from '../../helper.js';
import { fix as prettierFix } from './helpers/prettier.js';

export default {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns)
      ? ['./**/*.json']
      : userPatterns;
    return await helper.findHostFiles(filePatterns, ['.json']);
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
        JSON.parse(await read(filepath));
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
    await prettierFix(files);
  },
};
