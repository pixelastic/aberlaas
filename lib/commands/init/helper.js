import path from 'path';
import Gilmore from 'gilmore';
import { copy, error as firostError, isFile, move, read, write } from 'firost';
import { _ } from 'golgoth';
import helper from '../../helper.js';
import { nodeVersion, yarnVersion } from '../../configs/node.js';

/**
 * This hold functions shared for both the monorepo and simple init scenarios
 */
export default {
  /**
   * Return name of the current project, as the name of the current directory
   * @returns {string} Name of the project
   */
  getProjectName() {
    return path.basename(helper.hostRoot());
  },

  /**
   * Return the name of the current author based on the GitHub project owner
   * @returns {string} Name of the author, or __placeholder__ if undefined
   */
  async getProjectAuthor() {
    const repo = this.__getRepo();
    return (await repo.githubRepoOwner()) || '__placeholder__';
  },

  /**
   * Copy a config template to the host
   * @param {string} source Path to source file, relative to aberlaas
   * @param {string} destination Path to destination file, relative to the host
   * @returns {boolean} False if can't copy file, true otherwise
   */
  async copyToHost(source, destination) {
    const absoluteSource = helper.aberlaasPath(source);
    const absoluteDestination = helper.hostPath(destination);

    // Source file does not exist
    if (!(await isFile(absoluteSource))) {
      throw firostError(
        'ERROR_INIT_COPY_FILE',
        `Unable to locate ${absoluteSource} file`,
      );
    }
    // Destination file already exist
    if (await isFile(absoluteDestination)) {
      // Do nothing if content is already the same
      const sourceContent = await read(absoluteSource);
      const destinationContent = await read(absoluteDestination);
      if (sourceContent === destinationContent) {
        return true;
      }

      // Otherwise create a backup
      const backupDestination = `${absoluteDestination}.backup`;
      await move(absoluteDestination, backupDestination);
    }

    await copy(absoluteSource, absoluteDestination);

    return true;
  },

  /**
   * Add MIT license file
   * @param {string} hostFilepath Path to the LICENSE file, relative to the host
   */
  async addLicenseFile(hostFilepath) {
    // Start by adding a template
    await this.copyToHost('templates/LICENSE', hostFilepath);

    // Replace placeholder with real value
    const licensePath = helper.hostPath(hostFilepath);
    const author = await this.getProjectAuthor();
    const templateContent = await read(licensePath);
    const actualContent = _.replace(templateContent, '{author}', author);

    // Write it again
    await write(actualContent, licensePath);
  },

  /**
   * Add CircleCI Config file
   */
  async addCircleCIConfigFile() {
    const configFilepath = helper.hostPath('./.circleci/config.yml');

    // Start by adding a template
    await this.copyToHost('templates/_circleci/config.yml', configFilepath);

    // Replace placeholder with real value
    const templateContent = await read(configFilepath);
    const actualContent = _.chain(templateContent)
      .replace('{nodeVersion}', nodeVersion)
      .replace('{yarnVersion}', yarnVersion)
      .value();

    // Write it again
    await write(actualContent, configFilepath);
  },

  /**
   * Add default script files
   */
  async addScripts() {
    // Common
    await this.copyToHost('templates/scripts/ci', 'scripts/ci');
    await this.copyToHost('templates/scripts/compress', 'scripts/compress');
    await this.copyToHost('templates/scripts/lint', 'scripts/lint');
    await this.copyToHost('templates/scripts/lint-fix', 'scripts/lint-fix');

    // Hooks
    await this.copyToHost(
      './templates/scripts/hooks/pre-commit',
      './scripts/hooks/pre-commit',
    );

    // Lib
    await this.copyToHost(
      'templates/scripts/lib/release',
      'scripts/lib/release',
    );
    await this.copyToHost('templates/scripts/lib/test', 'scripts/lib/test');
    await this.copyToHost(
      'templates/scripts/lib/test-watch',
      'scripts/lib/test-watch',
    );
  },

  /**
   * Add config files to the host. Each config files reference the default
   * aberlaas config for its tool. This pattern allow end-users to use aberlaas
   * default rules and overwrite them as they see fit
   */
  async addConfigFiles() {
    // Git
    await this.copyToHost('./templates/_gitignore', './.gitignore');
    await this.copyToHost('./templates/_gitattributes', './.gitattributes');

    // Yarn
    await this.copyToHost('templates/_yarnrc.yml', '.yarnrc.yml');

    // ESLint
    await this.copyToHost('templates/eslint.config.js', 'eslint.config.js');

    // Lint-staged
    await this.copyToHost(
      'templates/lintstaged.config.js',
      'lintstaged.config.js',
    );

    // Vite
    await this.copyToHost('templates/vite.config.js', 'vite.config.js');

    // Prettier
    await this.copyToHost('templates/prettier.config.js', 'prettier.config.js');

    // Stylelint
    await this.copyToHost(
      'templates/stylelint.config.js',
      'stylelint.config.js',
    );

    // Renovate
    await this.copyToHost(
      'templates/_github/renovate.json',
      '.github/renovate.json',
    );

    // CircleCI
    await this.copyToHost(
      'templates/_circleci/config.yml',
      '.circleci/config.yml',
    );
  },

  /**
   * Add default files required to have the minimum lib module
   */
  async addLibFiles() {
    await this.copyToHost('templates/lib/main.js', 'lib/main.js');
    await this.copyToHost(
      'templates/lib/__tests__/main.js',
      'lib/__tests__/main.js',
    );
  },
  __getRepo() {
    return new Gilmore(helper.hostRoot());
  },
};
