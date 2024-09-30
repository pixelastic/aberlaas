import { readJson, writeJson } from 'firost';

import helper from '../../helper.js';
import nodeConfig from '../../configs/node.cjs';
import initHelper from './helper.js';

export default {
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
    const engines = {
      node: `>=${nodeConfig.nodeVersion}`,
    };

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
      engines,

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
   * Add MIT license files to the repository
   **/
  async addLicenseFiles() {
    // One at the repo root, for GitHub
    await initHelper.addLicenseFile('LICENSE');
    // One in ./lib to be released with the module
    await initHelper.addLicenseFile('lib/LICENSE');
  },
  /**
   * Add config files
   **/
  async addConfigFiles() {
    await initHelper.addConfigFiles();

    // Lerna
    await initHelper.copyToHost('templates/lerna.json', 'lerna.json');
  },
  /**
   * Add scripts to the repo
   **/
  async addScripts() {
    // Common scripts
    await initHelper.addScripts('LICENSE');

    // Docs scripts
    await initHelper.copyToHost(
      'templates/scripts/docs/build',
      'scripts/docs/build',
    );
    await initHelper.copyToHost(
      'templates/scripts/docs/build-prod',
      'scripts/docs/build-prod',
    );
    await initHelper.copyToHost(
      'templates/scripts/docs/cms',
      'scripts/docs/cms',
    );
    await initHelper.copyToHost(
      'templates/scripts/docs/serve',
      'scripts/docs/serve',
    );
  },
  /**
   * Returns shared project data, like name, author, scripts, etc
   * @returns {object} Object of common keys
   **/
  async getSharedProjectData() {
    const name = await this.__getProjectName();
    const author = await this.__getProjectAuthor();
    const homepage = `https://projects.pixelastic.com/${name}`;
    const repository = `${author}/${name}`;
    const license = 'MIT';
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
      homepage,
      license,
      name,
      repository,
      scripts,
    };
  },
  /**
   * Scaffold a repo for use in a monorepo module contexte
   **/
  async run() {
    await this.createRootWorkspace();
    await this.createDocsWorkspace();
    await this.createLibWorkspace();

    await this.addLicenseFiles();
    await this.addScripts();
    await this.addConfigFiles();
    await initHelper.addLibFiles();
  },
  __getProjectName: initHelper.getProjectName,
  __getProjectAuthor: initHelper.getProjectAuthor,
};
