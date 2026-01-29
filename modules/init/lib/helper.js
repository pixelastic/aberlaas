import path from 'node:path';
import { _ } from 'golgoth';
import {
  absolute,
  consoleWarn,
  copy,
  firostError,
  isFile,
  move,
  read,
  readJson,
  remove,
  wrap,
  write,
} from 'firost';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import Gilmore from 'gilmore';

export const __ = {
  /**
   * Add config files to the host. Each config files reference the default
   * aberlaas config for its tool. This pattern allow end-users to use aberlaas
   * default rules and overwrite them as they see fit
   */
  async addConfigFiles() {
    // Editorconfig
    await __.copyTemplateToHost('_editorconfig', '.editorconfig');

    // Git
    await __.copyTemplateToHost('_gitignore', '.gitignore');
    await remove(hostGitPath('.gitattributes'));

    // README template
    await __.copyTemplateToHost('_README.template.md', '.README.template.md');

    // Yarn
    await __.copyTemplateToHost('_yarnrc.yml', '.yarnrc.yml');

    // ESLint
    await __.copyTemplateToHost('eslint.config.js');

    // Lint-staged
    await __.copyTemplateToHost('lintstaged.config.js');

    // Vite
    await __.copyTemplateToHost('vite.config.js');

    // Prettier
    await __.copyTemplateToHost('prettier.config.js');

    // Stylelint
    await __.copyTemplateToHost('stylelint.config.js');

    // Renovate
    await __.copyTemplateToHost(
      '_github/renovate.json',
      '.github/renovate.json',
    );

    // CircleCI
    await __.addCircleCIConfigFile();
  },

  /**
   * Add default files required to have the minimum lib module
   * @param {string} libPrefixPath Path to the lib files, ./lib by default
   */
  async addLibFiles(libPrefixPath = 'lib') {
    await __.copyTemplateToHost('lib/main.js', `${libPrefixPath}/main.js`);
    await __.copyTemplateToHost(
      'lib/__tests__/main.js',
      `${libPrefixPath}/__tests__/main.js`,
    );
  },

  /**
   * Add MIT license file
   * @param {string} hostFilepath Path to the LICENSE file, relative to the host
   */
  async addLicenseFile(hostFilepath) {
    // Start by adding a template
    await __.copyTemplateToHost('LICENSE', hostFilepath);

    // Replace placeholder with real value
    const licensePath = hostGitPath(hostFilepath);
    const author = await __.getProjectAuthor();
    const templateContent = await read(licensePath);
    const actualContent = _.replace(templateContent, '{author}', author);

    // Write it again
    await write(actualContent, licensePath);
  },

  /**
   * Add default script files from templates/scripts to the host
   * Excludes documentation-specific scripts (build, build-prod, cms, serve)
   */
  async addDefaultScripts() {
    await __.copyTemplateToHost('scripts/ci');
    await __.copyTemplateToHost('scripts/compress');
    await __.copyTemplateToHost('scripts/lint');
    await __.copyTemplateToHost('scripts/lint-fix');
    await __.copyTemplateToHost('scripts/release');
    await __.copyTemplateToHost('scripts/test');
    await __.copyTemplateToHost('scripts/test-watch');
    await __.copyTemplateToHost('scripts/hooks/pre-commit');
  },

  /**
   * Add documentation-specific scripts from templates/scripts to the host
   * Only includes: build, build-prod, cms, serve
   */
  async addDocsScripts() {
    await __.copyTemplateToHost('scripts/build');
    await __.copyTemplateToHost('scripts/build-prod');
    await __.copyTemplateToHost('scripts/cms');
    await __.copyTemplateToHost('scripts/serve');
  },

  /**
   * Return the name of the current author based on the GitHub project owner
   * @returns {string} Name of the author, or __placeholder__ if undefined
   */
  async getProjectAuthor() {
    const repo = __.getRepo();
    return (await repo.githubRepoOwner()) || '__placeholder__';
  },

  /**
   * Return name of the current project, as the name of the current directory
   * @returns {string} Name of the project
   */
  getProjectName() {
    return path.basename(hostGitRoot());
  },

  /**
   * Return the version of aberlaas installed in the project
   * Reads from the host package.json devDependencies or dependencies
   * @returns {string} Version number
   **/
  async getAberlaasVersion() {
    const packageJsonPath = hostGitPath('package.json');
    const packageJson = await readJson(packageJsonPath);
    return (
      packageJson?.devDependencies?.aberlaas ||
      packageJson?.dependencies?.aberlaas
    );
  },

  // === PRIVATE METHODS ===
  /**
   * Copy a config template to the host
   * @param {string} source Path to source file, relative to ./templates folder
   * @param {string} userDestination Path to destination file, relative to the host. Defaults to source if not provided.
   * @returns {boolean} False if can't copy file, true otherwise
   */
  async copyTemplateToHost(source, userDestination) {
    const destination = userDestination || source;
    const absoluteSource = absolute('../templates/', source);
    const absoluteDestination = hostGitPath(destination);

    // Source file does not exist
    if (!(await isFile(absoluteSource))) {
      throw firostError(
        'ABERLAAS_INIT_COPY_FILE_NOT_FOUND',
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

      // Otherwise create a backup in ./tmp/backup
      const backupDestination = hostGitPath(`./tmp/backup/${destination}`);
      await move(absoluteDestination, backupDestination);
      __.consoleWarn(
        `Existing ${destination} backed up in ./tmp/backup/${destination}`,
      );
    }

    await copy(absoluteSource, absoluteDestination);

    return true;
  },

  /**
   * Add CircleCI Config file
   */
  async addCircleCIConfigFile() {
    const configFilepath = hostGitPath('./.circleci/config.yml');

    // Start by adding a template
    await __.copyTemplateToHost('_circleci/config.yml', configFilepath);

    // Replace placeholder with real value
    const templateContent = await read(configFilepath);
    const actualContent = _.chain(templateContent)
      .replace('{nodeVersion}', nodeVersion)
      .replace('{yarnVersion}', yarnVersion)
      .value();

    // Write it again
    await write(actualContent, configFilepath);
  },
  getRepo() {
    return new Gilmore(hostGitRoot());
  },
  consoleWarn,
};

// Named exports of public methods, but wrapped in dynamic method so we can
// still mock the inner methods in tests
//
export const addConfigFiles = wrap(__, 'addConfigFiles');
export const addDefaultScripts = wrap(__, 'addDefaultScripts');
export const addDocsScripts = wrap(__, 'addDocsScripts');
export const addLibFiles = wrap(__, 'addLibFiles');
export const addLicenseFile = wrap(__, 'addLicenseFile');
export const getAberlaasVersion = wrap(__, 'getAberlaasVersion');
export const getProjectAuthor = wrap(__, 'getProjectAuthor');
export const getProjectName = wrap(__, 'getProjectName');
