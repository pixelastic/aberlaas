import helper from '../helper';
import { _, pMap } from 'golgoth';
import yamlLint from 'yaml-lint';
import lint from './lint';
import firost from 'firost';
import path from 'path';
export default {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    return await lint.getInputFiles(['.yml', '.yaml'], userPatterns);
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
      const input = await firost.read(filepath);
      try {
        await this.__lint(input);
      } catch (error) {
        hasErrors = true;
        const relativePath = path.relative(helper.hostRoot(), filepath);
        errorMessages.push(`Invalid YAML: ${relativePath}`);
        errorMessages.push(error.message);
      }
    });

    if (hasErrors) {
      throw helper.error('YamlLintError', errorMessages.join('\n'));
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
  __lint: yamlLint.lint,
};
