import { _ } from 'golgoth';
import { firostError, run, which } from 'firost';
import { findHostPackageFiles } from 'aberlaas-helper';

export default {
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
    return await this.__which('pngmin');
  },
  /**
   * Compress files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {boolean} True on success
   */
  async run(userPatterns) {
    // Stop early if no bin
    const binaryPath = await this.getBinaryPath();
    if (!binaryPath) {
      return true;
    }

    try {
      const files = await this.getInputFiles(userPatterns);
      if (_.isEmpty(files)) {
        return true;
      }
      const command = `${binaryPath} ${files.join(' ')}`;
      await run(command, { stdout: false });
    } catch (error) {
      throw firostError('ABERLAAS_COMPRESS_PNG', error.message);
    }

    return true;
  },
  __which: which,
};
