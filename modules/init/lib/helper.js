import path from 'node:path';
import Gilmore from 'gilmore';
import {
  absolute,
  copy,
  env,
  firostError,
  glob,
  isFile,
  move,
  read,
  write,
} from 'firost';
import { _, pMap } from 'golgoth';
import helper from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';

/**
 * This hold functions shared for both the monorepo and simple init scenarios
 */
export default {
  /**
   * Return name of the current project, as the name of the current directory
   * @returns {string} Name of the project
   */
  getProjectName() {
    return path.basename(helper.hostGitRoot());
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
   * Return the version of aberlaas used on the CLI
   * This should have been set by the top-level entrypoint
   * @returns {string} Version number
   **/
  getAberlaasVersion() {
    return env('ABERLAAS_VERSION');
  },

  /**
   * Copy a config template to the host
   * @param {string} source Path to source file, relative to ./templates folder
   * @param {string} destination Path to destination file, relative to the host
   * @returns {boolean} False if can't copy file, true otherwise
   */
  async copyTemplateToHost(source, destination) {
    const absoluteSource = absolute('../templates/', source);
    const absoluteDestination = helper.hostGitPath(destination);

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
    await this.copyTemplateToHost('LICENSE', hostFilepath);

    // Replace placeholder with real value
    const licensePath = helper.hostGitPath(hostFilepath);
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
    const configFilepath = helper.hostGitPath('./.circleci/config.yml');

    // Start by adding a template
    await this.copyTemplateToHost('_circleci/config.yml', configFilepath);

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
   * Add script files
   * @param {string} layoutPrefixPath Path to the subfolder in
   * ./templates/scripts that hold the script files to copy
   */
  async addScripts(layoutPrefixPath) {
    const templateFolder = absolute('../templates/scripts/', layoutPrefixPath);
    const templateScripts = await glob('**/*', {
      directories: false,
      cwd: templateFolder,
      absolutePaths: false,
    });

    await pMap(templateScripts, async (templatePath) => {
      const sourcePath = `scripts/${layoutPrefixPath}/${templatePath}`;
      const destinationPath = `scripts/${templatePath}`;
      await this.copyTemplateToHost(sourcePath, destinationPath);
    });
  },

  /**
   * Add config files to the host. Each config files reference the default
   * aberlaas config for its tool. This pattern allow end-users to use aberlaas
   * default rules and overwrite them as they see fit
   */
  async addConfigFiles() {
    // Git
    await this.copyTemplateToHost('./_gitignore', './.gitignore');
    await this.copyTemplateToHost('./_gitattributes', './.gitattributes');

    // Yarn
    await this.copyTemplateToHost('_yarnrc.yml', '.yarnrc.yml');

    // ESLint
    await this.copyTemplateToHost('eslint.config.js', 'eslint.config.js');

    // Lint-staged
    await this.copyTemplateToHost(
      'lintstaged.config.js',
      'lintstaged.config.js',
    );

    // Vite
    await this.copyTemplateToHost('vite.config.js', 'vite.config.js');

    // Prettier
    await this.copyTemplateToHost('prettier.config.js', 'prettier.config.js');

    // Stylelint
    await this.copyTemplateToHost('stylelint.config.js', 'stylelint.config.js');

    // Renovate
    await this.copyTemplateToHost(
      '_github/renovate.json',
      '.github/renovate.json',
    );

    // CircleCI
    await this.addCircleCIConfigFile();
  },

  /**
   * Add default files required to have the minimum lib module
   * @param {string} libPrefixPath Path to the lib files, ./lib by default
   */
  async addLibFiles(libPrefixPath = 'lib') {
    await this.copyTemplateToHost('lib/main.js', `${libPrefixPath}/main.js`);
    await this.copyTemplateToHost(
      'lib/__tests__/main.js',
      `${libPrefixPath}/__tests__/main.js`,
    );
  },
  __getRepo() {
    return new Gilmore(helper.hostGitRoot());
  },
};
