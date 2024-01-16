import helper from '../../helper.js';
import { fix as prettierFix } from './helpers/prettier.js';
import firostError from 'firost/error.js';
import read from 'firost/read.js';
import _ from 'golgoth/lodash.js';
import pMap from 'golgoth/pMap.js';
import yamlLint from 'yaml-lint';
import path from 'path';

export default {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns)
      ? ['./**/*.yml', './**/*.yaml']
      : userPatterns;
    return await helper.findHostFiles(filePatterns, ['.yml', '.yaml']);
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
      const input = await read(filepath);
      try {
        await yamlLint.lint(input);
      } catch (error) {
        hasErrors = true;
        const relativePath = path.relative(helper.hostRoot(), filepath);
        errorMessages.push(`Invalid YAML: ${relativePath}`);
        errorMessages.push(error.message);
      }
    });

    if (hasErrors) {
      throw firostError('YamlLintError', errorMessages.join('\n'));
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
