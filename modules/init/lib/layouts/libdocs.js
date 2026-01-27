import { writeJson } from 'firost';
import { hostGitPath } from 'aberlaas-helper';
import {
  nodeVersion,
  norskaThemeDocsVersion,
  norskaVersion,
  yarnVersion,
} from 'aberlaas-versions';
import {
  addConfigFiles,
  addLibFiles,
  addLicenseFile,
  addScripts,
  getAberlaasVersion,
  getProjectAuthor,
  getProjectName,
} from '../helper.js';

export let __;

/**
 * Scaffold a repo:
 * - As a monorepo
 * - With ./libs and ./docs subfolders
 */
export async function run() {
  await __.createRootWorkspace();
  await __.createDocsWorkspace();
  await __.createLibWorkspace();
  await __.addLicenseFiles();

  await addConfigFiles();
  await addScripts('__libdocs');
  await addLibFiles();
}

__ = {
  // Public methods

  /**
   * Create the top-level workspace
   */
  async createRootWorkspace() {
    const aberlaasVersion = getAberlaasVersion();
    const sharedProjectData = await __.getSharedProjectData();
    const engines = {
      node: `>=${nodeVersion}`,
    };

    const packageContent = {
      // Name and version
      name: `${sharedProjectData.name}-root`,

      // Visibility
      private: true,
      workspaces: ['docs', 'lib'],

      // Metadata
      author: sharedProjectData.author,
      description: `${sharedProjectData.name} root workspace`,
      repository: sharedProjectData.repository,
      homepage: sharedProjectData.homepage,

      // Compatibility
      type: 'module',
      license: sharedProjectData.license,
      engines,
      packageManager: `yarn@${yarnVersion}`,

      // Dependencies
      dependencies: {},
      devDependencies: {
        aberlaas: aberlaasVersion,
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
      },
    };
    await writeJson(packageContent, hostGitPath('./package.json'), {
      sort: false,
    });
  },

  /**
   * Create the docs workspace
   */
  async createDocsWorkspace() {
    const sharedProjectData = await __.getSharedProjectData();

    const packageContent = {
      // Name & Version
      name: `${sharedProjectData.name}-docs`,
      version: '0.0.1',

      // Visibility
      private: true,

      // Metadata
      author: sharedProjectData.author,
      description: `${sharedProjectData.name} docs`,
      repository: sharedProjectData.repository,
      homepage: sharedProjectData.homepage,

      // Compatibility
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
    await writeJson(packageContent, hostGitPath('./docs/package.json'), {
      sort: false,
    });
  },

  /**
   * Create the lib workspace
   */
  async createLibWorkspace() {
    const sharedProjectData = await __.getSharedProjectData();
    const engines = {
      node: `>=${nodeVersion}`,
    };

    const packageContent = {
      // Name and version
      name: sharedProjectData.name,
      version: '0.0.1',

      // Visibility
      private: false,

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
    await writeJson(packageContent, hostGitPath('./lib/package.json'), {
      sort: false,
    });
  },

  /**
   * Add MIT license files to the repository
   */
  async addLicenseFiles() {
    // One at the repo root, for GitHub
    await addLicenseFile('LICENSE');
    // One in ./lib to be released with the module
    await addLicenseFile('lib/LICENSE');
  },

  /**
   * Returns shared project data, like name, author, scripts, etc
   * @returns {object} Object of common keys
   */
  async getSharedProjectData() {
    const name = await getProjectName();
    const author = await getProjectAuthor();
    const homepage = `https://projects.pixelastic.com/${name}`;
    const repository = `${author}/${name}`;
    const license = 'MIT';
    const scripts = {
      build: '../scripts/local/build',
      'build:prod': '../scripts/local/build-prod',
      cms: '../scripts/local/cms',
      serve: '../scripts/local/serve',
      ci: '../scripts/local/ci',
      release: '../scripts/local/release',
      test: '../scripts/local/test',
      'test:watch': '../scripts/local/test-watch',
      compress: '../scripts/local/compress',
      lint: '../scripts/local/lint',
      'lint:fix': '../scripts/local/lint-fix',
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
};

export default {
  run,
};
