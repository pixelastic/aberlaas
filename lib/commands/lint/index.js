import { _, pMap } from 'golgoth';
import { consoleError, firostError } from 'firost';
import linterCircleCI from './circleci.js';
import linterCss from './css.js';
import linterJson from './json.js';
import linterJs from './js.js';
import linterYml from './yml.js';

export default {
  linters: {
    circleci: linterCircleCI,
    css: linterCss,
    json: linterJson,
    js: linterJs,
    yml: linterYml,
  },
  /**
   * Wrapper to lint all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   **/
  async run(cliArgs = {}) {
    const allTypesKeys = _.keys(this.linters);
    const userTypes = _.intersection(_.keys(cliArgs), allTypesKeys);
    const typesToLint = _.isEmpty(userTypes) ? allTypesKeys : userTypes;

    let hasErrors = false;
    await pMap(typesToLint, async (type) => {
      const methodName = cliArgs.fix ? 'fix' : 'run';
      try {
        const linter = this.linters[type];

        const configFile = _.get(cliArgs, `config.${type}`);
        const userPatterns = _.get(cliArgs, '_');

        await linter[methodName](userPatterns, configFile);
      } catch (error) {
        this.__consoleError(error.message);
        hasErrors = true;
      }
    });

    if (hasErrors) {
      throw firostError('ERROR_LINT', 'Error while linting files');
    }

    return true;
  },
  __consoleError: consoleError,
};
