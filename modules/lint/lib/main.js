import { _, pMap } from 'golgoth';
import { consoleError, firostError, firostImport } from 'firost';

export let __;

/**
 * Wrapper to lint all supported formats
 * @param {object} cliArgs CLI Argument object, as created by minimist
 * @returns {boolean} True on success
 */
export async function run(cliArgs = {}) {
  const allTypesKeys = _.keys(__.linters);
  const userTypes = _.intersection(_.keys(cliArgs), allTypesKeys);
  const typesToLint = _.isEmpty(userTypes) ? allTypesKeys : userTypes;
  const shouldFailFast = cliArgs['fail-fast'];
  const errors = [];

  await pMap(
    typesToLint,
    async (type) => {
      const methodName = cliArgs.fix ? 'fix' : 'run';
      const linter = await __.getLinter(type);
      const configFile = _.get(cliArgs, `config.${type}`);
      const userPatterns = _.get(cliArgs, '_');

      try {
        await linter[methodName](userPatterns, configFile);
      } catch (error) {
        errors.push(error);

        if (shouldFailFast) {
          if (errors.length == 1) {
            __.consoleError(error.message);
          }
          throw firostError('ABERLAAS_LINT_FAIL_FAST', 'Fail to lint files');
        }

        __.consoleError(error.message);
      }
    },
    { stopOnError: shouldFailFast },
  );

  if (!_.isEmpty(errors)) {
    throw firostError('ABERLAAS_LINT_FAIL', 'Fail to lint files');
  }

  return true;
}

__ = {
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
    const linterPath = __.linters[linterType];
    if (!linterPath) {
      return false;
    }

    return await firostImport(linterPath);
  },

  consoleError,
};

export default {
  run,
};
