import ciInfo from 'ci-info';
import { firostError, run, which } from 'firost';
import { findHostPackageFiles, hostGitPath } from 'aberlaas-helper';
import lintYml from './yml.js';

export default {
  configPath: '.circleci/config.yml',
  /**
   * Find the CircleCI config file
   * @returns {Array} Array of files
   */
  async getInputFile() {
    const files = await findHostPackageFiles([this.configPath]);
    return files[0] || false;
  },
  /**
   * Check if the code is currently running on CircleCI
   * @returns {boolean} True if running on CircleCI, false otherwise
   */
  isRunningOnCircleCi() {
    return ciInfo.CIRCLE;
  },
  /**
   * Check if the circleci binary is available in the $PATH
   * @returns {boolean} True if available, false otherwise
   */
  async hasCircleCiBin() {
    const binary = await which('circleci');
    return !!binary;
  },
  /**
   * Validate the CircleCI config file.
   * @returns {boolean} True if valid, throws an error if not
   */
  async validateConfig() {
    await run('circleci config validate', { stdout: false });
  },
  /**
   * Lint the file, both for yml issues and if possible circleci specifics
   * @returns {boolean} True on success
   */
  async run() {
    const absoluteConfigPath = await this.getInputFile();
    const isRunningOnCircleCi = this.isRunningOnCircleCi();

    // Stop early if no config file, or if running on CircleCI
    if (!absoluteConfigPath || isRunningOnCircleCi) {
      return true;
    }

    // Lint as yml first
    await lintYml.run([absoluteConfigPath]);

    // Stop early if no circleci bin available
    if (!(await this.hasCircleCiBin())) {
      return true;
    }

    // Validate the config
    try {
      await this.validateConfig();
    } catch (error) {
      const errorMessage = `CircleCI config error on ${this.configPath}\n${error.message}`;
      throw firostError('ABERLAAS_LINT_CIRCLECI', errorMessage);
    }

    return true;
  },
  /**
   * Autofix yml issues in file
   * @returns {boolean} True on success
   */
  async fix() {
    const absoluteConfigPath = hostGitPath(this.configPath);
    // Fix yml issues
    await lintYml.fix([absoluteConfigPath]);

    // Check for file errors so it still fails if file is invalid
    await this.run();
  },
};
