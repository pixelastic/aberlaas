import { _ } from 'golgoth';
import {
  consoleInfo,
  copy,
  firostError,
  isFile,
  move,
  read,
  readJson,
  run,
  spinner,
  write,
  writeJson,
} from 'firost';

import Gilmore from 'gilmore';
import helper from '../../helper.js';
import nodeConfig from '../../configs/node.cjs';

export default {
  /**
   * Configure git hooks to use scripts/hooks instead of .git/hooks
   **/
  async configureGit() {
    const repo = new Gilmore(helper.hostRoot());
    await repo.setConfig('core.hooksPath', 'scripts/hooks');
  },
  /**
   * Pin the node version through nvm
   **/
  async configureNode() {
    const nvmrcPath = helper.hostPath('.nvmrc');
    await write(nodeConfig.nodeVersion, nvmrcPath);
  },
  /**
   * Create the top-level monorepo root workspace
   **/
  async createRootWorkspace() {
    const aberlaasData = await readJson(helper.aberlaasPath('./package.json'));
    const sharedProjectData = await this.getSharedProjectData();

    const packageContent = {
      // Visibility
      private: true,
      workspaces: ['docs', 'lib'],

      // Name and version
      name: `${sharedProjectData.name}-monorepo`,
      version: '0.0.1',

      // Metadata
      author: sharedProjectData.author,
      description: `${sharedProjectData.name} monorepo`,
      repository: sharedProjectData.repository,
      homepage: sharedProjectData.homepage,

      // Compatibility
      type: 'module',
      license: sharedProjectData.license,
      packageManager: `yarn@${nodeConfig.yarnVersion}`,

      // Exports

      // Dependencies
      dependencies: {},
      devDependencies: {
        aberlaas: aberlaasData.version,
        lerna: nodeConfig.lernaVersion,
      },

      // Scripts
      scripts: {
        // ==> Docs-specific
        build: './scripts/docs/build',
        'build:prod': './scripts/docs/build-prod',
        cms: './scripts/docs/cms',
        serve: './scripts/docs/serve',
        // ==> Lib-specific
        release: './scripts/lib/release',
        test: './scripts/lib/test',
        'test:watch': './scripts/lib/test-watch',
        // Common
        ci: './scripts/ci',
        compress: './scripts/compress',
        lint: './scripts/lint',
        'lint:fix': './scripts/lint-fix',

        // Global (called as aliases from any workspace)
        // ==> Docs-specific
        'g:build': './scripts/docs/build',
        'g:build:prod': './scripts/docs/build-prod',
        'g:cms': './scripts/docs/cms',
        'g:serve': './scripts/docs/serve',
        // ==> Lib-specific
        'g:release': './scripts/lib/release',
        'g:test': './scripts/lib/test',
        'g:test:watch': './scripts/lib/test-watch',
        // Common
        'g:compress': './scripts/compress',
        'g:lint': './scripts/lint',
        'g:lint:fix': './scripts/lint-fix',
      },
    };
    await writeJson(packageContent, helper.hostPath('./package.json'), {
      sort: false,
    });
  },
  /**
   * Create the docs workspace
   **/
  async createDocsWorkspace() {
    const sharedProjectData = await this.getSharedProjectData();

    const packageContent = {
      // Visibility
      private: true,

      // Name & Version
      name: `${sharedProjectData.name}-docs`,
      version: '0.0.1',

      // Metadata
      author: sharedProjectData.author,
      description: `${sharedProjectData.name} docs`,
      repository: sharedProjectData.repository,
      homepage: sharedProjectData.homepage,

      // Compatibility
      license: sharedProjectData.license,

      // Exports

      // Dependencies
      dependencies: {
        norska: nodeConfig.norskaVersion,
        'norska-theme-docs': nodeConfig.norskaThemeDocsVersion,
      },
      devDependencies: {},

      // Scripts
      scripts: sharedProjectData.scripts,
    };
    await writeJson(packageContent, helper.hostPath('./docs/package.json'), {
      sort: false,
    });
  },
  /**
   * Create the lib workspace
   **/
  async createLibWorkspace() {
    const sharedProjectData = await this.getSharedProjectData();

    const packageContent = {
      // Visibility
      private: false,

      // Name and version
      name: sharedProjectData.name,
      version: '0.0.1',

      // Metadata
      author: sharedProjectData.author,
      description: '',
      keywords: [],
      repository: sharedProjectData.repository,
      homepage: sharedProjectData.homepage,

      // Compatibility
      type: 'module',
      license: sharedProjectData.license,
      engines: sharedProjectData.engines,

      // Exports
      files: ['*.js'],
      exports: {
        '.': './main.js',
      },
      main: './main.js',

      // Dependencies
      dependencies: {},
      devDependencies: {},

      // Scripts
      scripts: sharedProjectData.scripts,
    };
    await writeJson(packageContent, helper.hostPath('./lib/package.json'), {
      sort: false,
    });
  },
  /**
   * Add config files to the host. Each config files reference the default
   * aberlaas config for its tool. This pattern allow end-users to use aberlaas
   * default rules and overwrite them as they see fit
   **/
  async addConfigFiles() {
    // Git
    await this.copyToHost('./templates/_gitignore', './.gitignore');
    await this.copyToHost('./templates/_gitattributes', './.gitattributes');

    // Yarn
    await this.copyToHost('templates/_yarnrc.yml', '.yarnrc.yml');

    // Lerna
    await this.copyToHost('templates/lerna.json', 'lerna.json');

    // ESLint
    await this.copyToHost('templates/_eslintrc.cjs', '.eslintrc.cjs');
    await this.copyToHost('templates/_eslintignore.conf', '.eslintignore');

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
   * Add default script files
   **/
  async addScripts() {
    // Docs
    await this.copyToHost('templates/scripts/docs/build', 'scripts/docs/build');
    await this.copyToHost(
      'templates/scripts/docs/build-prod',
      'scripts/docs/build-prod',
    );
    await this.copyToHost('templates/scripts/docs/cms', 'scripts/docs/cms');
    await this.copyToHost('templates/scripts/docs/serve', 'scripts/docs/serve');

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

    // Common
    await this.copyToHost('templates/scripts/ci', 'scripts/ci');
    await this.copyToHost('templates/scripts/compress', 'scripts/compress');
    await this.copyToHost('templates/scripts/lint', 'scripts/lint');
    await this.copyToHost('templates/scripts/lint-fix', 'scripts/lint-fix');
  },
  /**
   * Add MIT license files to the repository
   **/
  async addLicenseFiles() {
    // Add the LICENSE template to the root
    await this.copyToHost('templates/LICENSE', 'LICENSE');

    // Replace placeholder with real value
    const sharedProjectData = await this.getSharedProjectData();
    const licensePath = helper.hostPath('LICENSE');
    const templateContent = await read(licensePath);
    const actualContent = _.replace(
      templateContent,
      '{author}',
      sharedProjectData.author,
    );

    // Write the LICENSE to root and lib
    await write(actualContent, licensePath);
    await write(actualContent, helper.hostPath('lib/LICENSE'));
  },
  /**
   * Add default files required to have the minimum lib module
   **/
  async addLibFiles() {
    await this.copyToHost('templates/lib/main.js', 'lib/main.js');
    await this.copyToHost(
      'templates/lib/__tests__/main.js',
      'lib/__tests__/main.js',
    );
  },
  /**
   * Copy a config template to the host
   * @param {string} source Path to source file, relative to aberlaas
   * @param {string} destination Path to destination file, relative to the host
   * @returns {boolean} False if can't copy file, true otherwise
   **/
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
   * Return name of the current project based on the GitHub project name
   * @returns {string} Name of the project
   **/
  async getProjectName() {
    const repo = new Gilmore(helper.hostRoot());
    return await repo.githubRepoName();
  },
  /**
   * Return the name of the current author based on the GitHub project owner
   * @returns {string} Name of the author
   **/
  async getProjectAuthor() {
    const repo = new Gilmore(helper.hostRoot());
    return await repo.githubRepoOwner();
  },
  /**
   * Returns shared project data, like name, author, scripts, etc
   * @returns {object} Object of common keys
   **/
  async getSharedProjectData() {
    const name = await this.getProjectName();
    const author = await this.getProjectAuthor();
    const homepage = `https://projects.pixelastic.com/${name}`;
    const repository = `${author}/${name}`;
    const license = 'MIT';
    const engines = {
      node: `>=${nodeConfig.nodeVersion}`,
    };
    const scripts = {
      // Docs
      build: 'ABERLAAS_CWD=$INIT_CWD yarn g:build',
      'build:prod': 'ABERLAAS_CWD=$INIT_CWD yarn g:build:prod',
      cms: 'ABERLAAS_CWD=$INIT_CWD yarn g:cms',
      serve: 'ABERLAAS_CWD=$INIT_CWD yarn g:serve',

      // Lib
      release: 'ABERLAAS_CWD=$INIT_CWD yarn g:release',
      test: 'ABERLAAS_CWD=$INIT_CWD yarn g:test',
      'test:watch': 'ABERLAAS_CWD=$INIT_CWD yarn g:test:watch',

      // Common
      compress: 'ABERLAAS_CWD=$INIT_CWD yarn g:compress',
      lint: 'ABERLAAS_CWD=$INIT_CWD yarn g:lint',
      'lint:fix': 'ABERLAAS_CWD=$INIT_CWD yarn g:lint:fix',
    };
    return {
      author,
      engines,
      homepage,
      license,
      name,
      repository,
      scripts,
    };
  },
  /**
   * Copy all config files and configure the scripts
   **/
  async run() {
    const progress = spinner();

    progress.tick('Configuring Git & Node');
    await this.configureGit();
    await this.configureNode();

    progress.tick('Configuring workspaces');
    await this.createRootWorkspace();
    await this.createDocsWorkspace();
    await this.createLibWorkspace();

    progress.tick('Adding files');
    await this.addLicenseFiles();
    await this.addConfigFiles();
    await this.addScripts();
    await this.addLibFiles();

    progress.success('aberlaas project initialized');

    this.__consoleInfo('Synchronizing dependencies');
    await run('yarn install');

    this.__consoleInfo(
      "Don't forget to run aberlaas setup after pushing your repository",
    );
  },
  __run: run,
  __consoleInfo: consoleInfo,
};
