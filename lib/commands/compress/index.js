import { _, pMap } from 'golgoth';
import { consoleError, firostError } from 'firost';
import compressPng from './png.js';
import compressDummy from './dummy.js';

export default {
  types: {
    png: compressPng,
    dummy: compressDummy,
  },
  /**
   * Wrapper to compress all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   */
  async run(cliArgs) {
    const allTypesKeys = _.keys(this.types);
    const userTypes = _.intersection(_.keys(cliArgs), allTypesKeys);
    const typesToCompress = _.isEmpty(userTypes) ? allTypesKeys : userTypes;

    let hasErrors = false;
    await pMap(typesToCompress, async (type) => {
      try {
        const userPatterns = _.get(cliArgs, '_');
        const compresser = this.types[type];

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
  __consoleError: consoleError,
};
