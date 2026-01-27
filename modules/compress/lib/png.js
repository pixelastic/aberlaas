import { _ } from 'golgoth';
import { firostError, run as firostRun, which } from 'firost';
import { findHostPackageFiles } from 'aberlaas-helper';

export let __;

/**
 * Compress files
 * @param {Array} userPatterns Patterns to narrow the search down
 * @returns {boolean} True on success
 */
export async function run(userPatterns) {
  // Stop early if no bin
  const binaryPath = await __.getBinaryPath();
  if (!binaryPath) {
    return true;
  }

  try {
    const files = await __.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }
    const command = `${binaryPath} ${files.join(' ')}`;
    await firostRun(command, { stdout: false });
  } catch (error) {
    throw firostError('ABERLAAS_COMPRESS_PNG', error.message);
  }

  return true;
}

__ = {
  /**
   * Find the png files to compress
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   */
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns)
      ? ['./**/*.png']
      : userPatterns;
    return await findHostPackageFiles(filePatterns, ['.png']);
  },

  /**
   * Returns path to the binary to execute
   * @returns {string|boolean} Path to the binary, or false if not found
   */
  async getBinaryPath() {
    return await __.which('pngmin');
  },
  which,
};

export default {
  run,
};
