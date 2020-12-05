const _ = require('golgoth/lodash');
const pMap = require('golgoth/pMap');
const consoleError = require('firost/consoleError');
const firostError = require('firost/error');
const helper = require('../../helper.js');

module.exports = {
  types: {
    png: './png.js',
  },
  /**
   * Wrapper to compress all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   **/
  async run(cliArgs) {
    const allTypesKeys = _.keys(this.types);
    const userTypes = _.intersection(_.keys(cliArgs), allTypesKeys);
    const typesToCompress = _.isEmpty(userTypes) ? allTypesKeys : userTypes;

    let hasErrors = false;
    await pMap(typesToCompress, async (type) => {
      try {
        const userPatterns = _.get(cliArgs, '_');
        const compresser = require(this.types[type]);

        await compresser.run(userPatterns);
      } catch (error) {
        this.__consoleError(error.message);
        hasErrors = true;
      }
    });

    if (hasErrors) {
      throw firostError('ERROR_COMPRESS', 'Error while compressing files');
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
  __consoleError: consoleError,
};
