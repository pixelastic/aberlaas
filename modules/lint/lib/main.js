import { _, pMap } from 'golgoth';
import { consoleError, firostError, firostImport } from 'firost';

export default {
  /**
   * List of all available linters, along with the --flag name
   **/
  linters: {
    circleci: './circleci.js',
    css: './css.js',
    json: './json.js',
    js: './js.js',
    yml: './yml.js',
  },

  /**
   * Returns a linter, based on its name
   * @param {string} linterType Name of the linter
   * @returns {object} Linter
   **/
  async getLinter(linterType) {
    const linterPath = this.linters[linterType];
    if (!linterPath) {
      return false;
    }

    return await firostImport(linterPath);
  },
  /**
   * Wrapper to lint all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   */
  async run(cliArgs = {}) {
    const allTypesKeys = _.keys(this.linters);
    const userTypes = _.intersection(_.keys(cliArgs), allTypesKeys);
    const typesToLint = _.isEmpty(userTypes) ? allTypesKeys : userTypes;

    let hasErrors = false;
    await pMap(typesToLint, async (type) => {
      const methodName = cliArgs.fix ? 'fix' : 'run';
      try {
        const linter = await this.getLinter(type);

        const configFile = _.get(cliArgs, `config.${type}`);
        const userPatterns = _.get(cliArgs, '_');

        await linter[methodName](userPatterns, configFile);
      } catch (error) {
        this.__consoleError(error.message);
        hasErrors = true;
      }
    });

    if (hasErrors) {
      throw firostError('ABERLAAS_LINT_FAIL', 'Fail to lint files');
    }

    return true;
  },
  __consoleError: consoleError,
};
