import { _, pMap } from 'golgoth';
import { consoleError, firostError } from 'firost';
import compressDummy from './dummy.js';
import compressPng from './png.js';

export let __;

/**
 * Wrapper to compress all supported formats
 * @param {object} cliArgs CLI Argument object, as created by minimist
 * @returns {boolean} True on success
 */
export async function run(cliArgs) {
  const allTypesKeys = _.keys(__.types);
  const userTypes = _.intersection(_.keys(cliArgs), allTypesKeys);
  const typesToCompress = _.isEmpty(userTypes) ? allTypesKeys : userTypes;

  let hasErrors = false;
  await pMap(typesToCompress, async (type) => {
    try {
      const userPatterns = _.get(cliArgs, '_');
      const compresser = __.types[type];

      await compresser.run(userPatterns);
    } catch (error) {
      __.consoleError(error.message);
      hasErrors = true;
    }
  });

  if (hasErrors) {
    throw firostError('ABERLAAS_COMPRESS', 'Error while compressing files');
  }

  return true;
}

__ = {
  types: {
    png: compressPng,
    dummy: compressDummy,
  },
  consoleError,
};

export default {
  run,
};
