import helper from '../helper';
import lint from './lint';
import lintYml from './lint-yml';
import firost from 'firost';

export default {
  configPath: '.circleci/config.yml',
  /**
   * Find the CircleCI config file
   * @returns {Array} Array of files
   **/
  async getInputFiles() {
    return await lint.getInputFiles(['.yml'], [this.configPath]);
  },
  async hasCircleCiBin() {
    const which = await firost.which('circleci');
    return !!which;
  },
  async validateConfig() {
    await firost.shell('circleci config validate');
  },

  /**
   * Lint the file, both for yml issues and if possible circleci specifics
   * @returns {boolean} True on success
   **/
  async run() {
    // Stop early if no file found
    if (!(await firost.exist(helper.hostPath(this.configPath)))) {
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
