import lint from './index.js';
import run from 'firost/run.js';
import which from 'firost/which.js';
import firostError from 'firost/error.js';

export default {
  /**
   * Find the png files to compress
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    return await lint.getInputFiles(['.png'], userPatterns);
  },
  /**
   * Check if the binary is available in the $PATH
   * @returns {boolean} True if available, false otherwise
   **/
  async hasBin() {
    const binary = await which('pngmin');
    return !!binary;
  },
  /**
   * Compress files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {boolean} True on success
   **/
  async run(userPatterns) {
    // Stop early if no bin
    if (!(await this.hasBin())) {
      return true;
    }

    try {
      const files = await this.getInputFiles(userPatterns);
      const command = `pngmin ${files.join(' ')}`;
      await run(command, { stdout: false });
    } catch (error) {
      throw firostError('PngCompressError', error.message);
    }
  },
};
