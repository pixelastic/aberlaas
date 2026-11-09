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
  const userTypes = _.chain(cliArgs).keys().intersection(allTypesKeys).value();
  const typesToLint = _.isEmpty(userTypes) ? allTypesKeys : userTypes;
  const shouldFailFast = cliArgs['fail-fast'];
  const errors = [];

  // --versions is a special case, as it can rewrite files other linters might
  // also rewrite, thus creating conflicts. So we run it last.
  const parallelTypes = _.without(typesToLint, 'versions');

  // First, all linters in parallel
  await pMap(
    parallelTypes,
    async (type) => {
      await __.lintType(type, cliArgs, errors);
    },
    { stopOnError: shouldFailFast },
  );

  // Then, versions in sequence
  if (_.includes(typesToLint, 'versions')) {
    await __.lintType('versions', cliArgs, errors);
  }

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
    html: './html.js',
    json: './json.js',
    js: './js.js',
    markdown: './markdown.js',
    versions: './versions.js',
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

  /**
   * Lint (or fix) all files of a given type. Errors are pushed to the errors
   * array, and rethrown in fail-fast mode.
   * @param {string} type Name of the linter
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {Array} errors Array collecting the errors of all linters
   **/
  async lintType(type, cliArgs, errors) {
    const methodName = cliArgs.fix ? 'fix' : 'run';
    const linter = await __.getLinter(type);
    const configFile = _.get(cliArgs, `config.${type}`);
    const userPatterns = _.get(cliArgs, '_');

    try {
      await linter[methodName](userPatterns, configFile);
    } catch (error) {
      errors.push(error);

      if (cliArgs['fail-fast']) {
        if (errors.length === 1) {
          __.consoleError(error.message);
        }
        throw firostError('ABERLAAS_LINT_FAIL_FAST', 'Fail to lint files');
      }

      __.consoleError(error.message);
    }
  },

  consoleError,
};

export default {
  run,
};
