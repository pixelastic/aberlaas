import { pMap, _ } from 'golgoth';
import helper from '../helper';
import execa from 'execa';
import lintJs from './lint-js';
import lintJson from './lint-json';
import lintCss from './lint-css';
import lintYml from './lint-yml';

export default {
  /**
   * Wrapper to lint all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   **/
  async run(cliArgs) {
    const allTypes = {
      css: lintCss,
      json: lintJson,
      js: lintJs,
      yml: lintYml,
    };
    const allTypesKeys = _.keys(allTypes);
    const userTypes = _.intersection(_.keys(cliArgs), allTypesKeys);
    const typesToLint = _.isEmpty(userTypes) ? allTypesKeys : userTypes;

    let hasErrors = false;
    await pMap(typesToLint, async type => {
      const methodName = cliArgs.fix ? 'fix' : 'run';
      try {
        const configFile = _.get(cliArgs, `config.${type}`);
        const userPatterns = _.get(cliArgs, '_');

        await allTypes[type][methodName](userPatterns, configFile);
      } catch (error) {
        helper.consoleError(error.message);
        hasErrors = true;
      }
    });

    if (hasErrors) {
      process.exit(1);
    }

    return true;
  },
  /**
   * Find all relevant files of the specified extension in the host
   * Note: Should be used by child classes
   * @param {Array} safeListExtension List of allowed extensions to keep
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(safeListExtension, userPatterns = []) {
    const inputPatterns = _.isEmpty(userPatterns) ? '.' : userPatterns;
    return await helper.findHostFiles(inputPatterns, safeListExtension);
  },
  /**
   * Fix all files using prettier
   * Note: Will be called by child classes
   * Note: Prettier does not output any information as to why it failed, so
   * we'll manually run the command on each file individually so we can catch
   * the file that errors and display it
   * @param {Array} inputFiles Files to auto-fix
   **/
  async fixWithPrettier(inputFiles) {
    const binary = await helper.which('prettier');
    const options = ['--write', '--loglevel=silent', ...inputFiles];
    try {
      await this.__execa(binary, options);
    } catch {
      throw helper.error(
        'LINT_ERROR_FIX_PRETTIER',
        'Some files could not be automatically fixed.\nPlease run `yarn run lint` to further debug'
      );
    }
  },
  __execa: execa,
};
