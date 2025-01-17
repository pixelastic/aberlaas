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
   * Scaffold a repo:
   * - As a monorepo
   * - With ./modules holding all modules, including ./lib and ./docs
   */
  async createRootWorkspace() {
    const aberlaasVersion = this.__getAberlaasVersion();
    const sharedProjectData = await this.getSharedProjectData();

    const packageContent = {
      // Visibility
      private: true,
      workspaces: ['modules/*'],

      // Name and version
      name: `${sharedProjectData.name}-monorepo`,

      // Metadata
      author: sharedProjectData.author,
      description: `${sharedProjectData.name} monorepo`,
      repository: sharedProjectData.repository,
      homepage: sharedProjectData.homepage,

      // Compatibility
      type: 'module',
      license: sharedProjectData.license,
      packageManager: `yarn@${yarnVersion}`,

      // Dependencies
      dependencies: {},
      devDependencies: {
        aberlaas: aberlaasVersion,
        lerna: lernaVersion,
      },

      // Scripts
      scripts: {
        // Docs
        build: './scripts/meta/build',
        'build:prod': './scripts/meta/build-prod',
        cms: './scripts/meta/cms',
        serve: './scripts/meta/serve',

        // Lib
        release: './scripts/meta/release',
        test: './scripts/meta/test',
        'test:watch': './scripts/meta/test-watch',
        ci: './scripts/meta/ci',
        compress: './scripts/meta/compress',
        lint: './scripts/meta/lint',
        'lint:fix': './scripts/meta/lint-fix',

        // Typo
        learn: 'lerna',
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
      // "type": "module", // TODO: Uncomment once norska is ESM-compliant
      license: sharedProjectData.license,

      // Dependencies
      dependencies: {
        norska: norskaVersion,
        'norska-theme-docs': norskaThemeDocsVersion,
      },
      devDependencies: {},

      // Scripts
      scripts: sharedProjectData.scripts,
    };
    await writeJson(
      packageContent,
      helper.hostPath('./modules/docs/package.json'),
      {
        sort: false,
      },
    );
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
    await writeJson(
      packageContent,
      helper.hostPath('./modules/lib/package.json'),
      {
        sort: false,
      },
    );
  },
  /**
   * Add MIT license files to the repository
   */
  async addLicenseFiles() {
    // One at the repo root, for GitHub
    await initHelper.addLicenseFile('LICENSE');
    // One in ./lib to be released with the module
    await initHelper.addLicenseFile('modules/lib/LICENSE');
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
      build: '../../scripts/local/build',
      'build:prod': '../../scripts/local/build-prod',
      cms: '../../scripts/local/cms',
      serve: '../../scripts/local/serve',
      ci: '../../scripts/local/ci',
      release: '../../scripts/local/release',
      test: '../../scripts/local/test',
      'test:watch': '../../scripts/local/test-watch',
      compress: '../../scripts/local/compress',
      lint: '../../scripts/local/lint',
      'lint:fix': '../../scripts/local/lint-fix',
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
    await this.addConfigFiles();
    await initHelper.addScripts('__monorepo');
    await initHelper.addLibFiles('./modules/lib');
  },
  __getProjectName: initHelper.getProjectName,
  __getProjectAuthor: initHelper.getProjectAuthor.bind(initHelper),
  __getAberlaasVersion: initHelper.getAberlaasVersion,
};
