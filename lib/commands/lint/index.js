import _ from 'golgoth/lodash.js';
import pMap from 'golgoth/pMap.js';
import consoleError from 'firost/consoleError.js';
import firostError from 'firost/error.js';
import run from 'firost/run.js';
import helper from '../../helper.js';

export default {
  types: {
    // circleci: './circleci.js',
    // css: './css.js',
    // json: './json.js',
    js: './js.js',
    // yml: './yml.js',
    // yaml: './yml.js', // Alias --yaml for --yml
  },
  /**
   * Wrapper to lint all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   **/
  async run(cliArgs) {
    const allTypesKeys = _.keys(this.types);
    const userTypes = _.intersection(_.keys(cliArgs), allTypesKeys);
    const typesToLint = _.isEmpty(userTypes) ? allTypesKeys : userTypes;

    let hasErrors = false;
    await pMap(typesToLint, async (type) => {
      const methodName = cliArgs.fix ? 'fix' : 'run';
      try {
        const configFile = _.get(cliArgs, `config.${type}`);
        const userPatterns = _.get(cliArgs, '_');
        const linter = await this.__require(this.types[type]);

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
    const options = ['--write', ...inputFiles];
    try {
      const command = `${binary} ${options.join(' ')}`;
      await run(command, { stdout: false });
    } catch (err) {
      throw firostError(
        'LINT_ERROR_FIX_PRETTIER',
        'Some files could not be automatically fixed.\nPlease run `yarn run lint` to further debug'
      );
    }
  },
  __consoleError: consoleError,
  async __require(filepath) {
    const imported = await import(filepath);
    return imported.default;
  }
};
