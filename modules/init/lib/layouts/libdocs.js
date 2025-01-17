import { writeJson } from 'firost';

import helper from 'aberlaas-helper';
import {
  lernaVersion,
  nodeVersion,
  norskaThemeDocsVersion,
  norskaVersion,
  yarnVersion,
} from 'aberlaas-versions';
import initHelper from '../helper.js';

export default {
  /**
   * Create the top-level workspace
   */
  async createRootWorkspace() {
    const aberlaasVersion = this.__getAberlaasVersion();
    const sharedProjectData = await this.getSharedProjectData();

    const packageContent = {
      // Visibility
      private: true,
      workspaces: ['docs', 'lib'],

      // Name and version
      name: `${sharedProjectData.name}-root`,
      version: '0.0.1',

      // Metadata
      author: sharedProjectData.author,
      description: `${sharedProjectData.name} root workspace`,
      repository: sharedProjectData.repository,
      homepage: sharedProjectData.homepage,

      // Compatibility
      type: 'module',
      license: sharedProjectData.license,
      packageManager: `yarn@${yarnVersion}`,

      // Exports

      // Dependencies
      dependencies: {},
      devDependencies: {
        aberlaas: aberlaasVersion,
        lerna: lernaVersion,
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
   */
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
        norska: norskaVersion,
        'norska-theme-docs': norskaThemeDocsVersion,
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
   */
  async createLibWorkspace() {
    const sharedProjectData = await this.getSharedProjectData();
    const engines = {
      node: `>=${nodeVersion}`,
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
      sideEffects: false,
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
   */
  async addLicenseFiles() {
    // One at the repo root, for GitHub
    await initHelper.addLicenseFile('LICENSE');
    // One in ./lib to be released with the module
    await initHelper.addLicenseFile('lib/LICENSE');
  },
  /**
   * Add config files
   */
  async addConfigFiles() {
    await initHelper.addConfigFiles();

    // Lerna
    await initHelper.copyTemplateToHost('lerna.json', 'lerna.json');
  },
  /**
   * Add scripts to the repo
   */
  async addScripts() {
    // Common scripts
    await initHelper.addCommonScripts();

    // Docs scripts
    await initHelper.copyTemplateToHost(
      'scripts/docs/build',
      'scripts/docs/build',
    );
    await initHelper.copyTemplateToHost(
      'scripts/docs/build-prod',
      'scripts/docs/build-prod',
    );
    await initHelper.copyTemplateToHost('scripts/docs/cms', 'scripts/docs/cms');
    await initHelper.copyTemplateToHost(
      'scripts/docs/serve',
      'scripts/docs/serve',
    );

    // Lib scripts
    await initHelper.copyTemplateToHost(
      'scripts/lib/release-lerna',
      'scripts/lib/release',
    );
  },
  /**
   * Returns shared project data, like name, author, scripts, etc
   * @returns {object} Object of common keys
   */
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
   * Scaffold a repo:
   * - As a monorepo
   * - With ./libs and ./docs subfolders
   */
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
  __getProjectAuthor: initHelper.getProjectAuthor.bind(initHelper),
  __getAberlaasVersion: initHelper.getAberlaasVersion,
};
