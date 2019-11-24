import helper from '../helper';
import lint from './lint';
import lintYml from './lint-yml';
import firost from 'firost';
import ciInfo from 'ci-info';

export default {
  configPath: '.circleci/config.yml',
  /**
   * Find the CircleCI config file
   * @returns {Array} Array of files
   **/
  async getInputFiles() {
    return await lint.getInputFiles(['.yml'], [this.configPath]);
  },
  /**
   * Check if the code is currently running on CircleCI
   * @returns {boolean} True if running on CircleCI, false otherwise
   **/
  isRunningOnCircleCi() {
    return ciInfo.CIRCLE;
  },
  /**
   * Check if the circleci binary is available in the $PATH
   * @returns {boolean} True if available, false otherwise
   **/
  async hasCircleCiBin() {
    const which = await firost.which('circleci');
    return !!which;
  },
  /**
   * Validate the CircleCI config file.
   * @returns {boolean} True if valid, throws an error if not
   **/
  async validateConfig() {
    await firost.shell('circleci config validate');
  },
  /**
   * Lint the file, both for yml issues and if possible circleci specifics
   * @returns {boolean} True on success
   **/
  async run() {
    const hasConfigFile = await firost.exist(helper.hostPath(this.configPath));
    const isRunningOnCircleCi = this.isRunningOnCircleCi();

    // Stop early if no config file, or if running on CircleCI
    if (!hasConfigFile || isRunningOnCircleCi) {
      return true;
    }

    // Lint as yml first
    await lintYml.run([this.configPath]);

    // Stop early if no circleci bin available
    if (!(await this.hasCircleCiBin())) {
      return true;
    }

    // Validate the config
    try {
      await this.validateConfig();
    } catch (error) {
      const errorMessage = `CircleCI config error on ${this.configPath}\n${error.message}`;
      throw helper.error('CircleCiLintError', errorMessage);
    }

    return true;
  },
  /**
   * Autofix yml issues in file
   * @returns {boolean} True on success
   **/
  async fix() {
    // Fix yml issues
    await lintYml.fix([this.configPath]);

    // Check for file errors so it still fails if file is invalid
    await this.run();
  },
};
