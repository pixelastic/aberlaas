const helper = require('../helper');
const lint = require('./lint');
const lintYml = require('./lint-yml');
const ciInfo = require('ci-info');
const exists = require('firost/lib/exists');
const run = require('firost/lib/run');
const which = require('firost/lib/which');
const firostError = require('firost/lib/error');

module.exports = {
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
    const binary = await which('circleci');
    return !!binary;
  },
  /**
   * Validate the CircleCI config file.
   * @returns {boolean} True if valid, throws an error if not
   **/
  async validateConfig() {
    await run('circleci config validate', { stdout: false });
  },
  /**
   * Lint the file, both for yml issues and if possible circleci specifics
   * @returns {boolean} True on success
   **/
  async run() {
    const absoluteConfigPath = helper.hostPath(this.configPath);
    const hasConfigFile = await exists(absoluteConfigPath);
    const isRunningOnCircleCi = this.isRunningOnCircleCi();

    // Stop early if no config file, or if running on CircleCI
    if (!hasConfigFile || isRunningOnCircleCi) {
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
      throw firostError('CircleCiLintError', errorMessage);
    }

    return true;
  },
  /**
   * Autofix yml issues in file
   * @returns {boolean} True on success
   **/
  async fix() {
    const absoluteConfigPath = helper.hostPath(this.configPath);
    // Fix yml issues
    await lintYml.fix([absoluteConfigPath]);

    // Check for file errors so it still fails if file is invalid
    await this.run();
  },
};