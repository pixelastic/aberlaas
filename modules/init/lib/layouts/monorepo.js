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
  addDefaultScripts,
  addDocsScripts,
  addLibFiles,
  addLicenseFile,
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
  await addDefaultScripts();
  await addDocsScripts();
  await addLibFiles('./modules/lib');
}

__ = {
  // Public methods

  /**
   * Scaffold a repo:
   * - As a monorepo
   * - With ./modules holding all modules, including ./lib and ./docs
   */
  async createRootWorkspace() {
    const aberlaasVersion = await getAberlaasVersion();
    const sharedProjectData = await __.getSharedProjectData();
    const engines = {
      node: `>=${nodeVersion}`,
    };

    const packageContent = {
      // Name and version
      name: `${sharedProjectData.name}-monorepo`,

      // Visibility
      private: true,
      workspaces: ['modules/*'],

      // Metadata
      author: sharedProjectData.author,
      description: `${sharedProjectData.name} monorepo`,
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
        build: './scripts/build',
        'build:prod': './scripts/build-prod',
        cms: './scripts/cms',
        serve: './scripts/serve',

        // Lib
        release: './scripts/release',
        test: './scripts/test',
        'test:watch': './scripts/test-watch',
        ci: './scripts/ci',
        compress: './scripts/compress',
        lint: './scripts/lint',
        'lint:fix': './scripts/lint-fix',
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
      hostGitPath('./modules/docs/package.json'),
      {
        sort: false,
      },
    );
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
    await writeJson(packageContent, hostGitPath('./modules/lib/package.json'), {
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
    await addLicenseFile('modules/lib/LICENSE');
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
      build: 'cd ../.. && ./scripts/build',
      'build:prod': 'cd ../.. && ./scripts/build-prod',
      cms: 'cd ../.. && ./scripts/cms',
      serve: 'cd ../.. && ./scripts/serve',
      ci: 'cd ../.. && ./scripts/ci',
      release: 'cd ../.. && ./scripts/release',
      test: 'cd ../.. && ./scripts/test',
      'test:watch': 'cd ../.. && ./scripts/test-watch',
      compress: 'cd ../.. && ./scripts/compress',
      lint: 'cd ../.. && ./scripts/lint',
      'lint:fix': 'cd ../.. && ./scripts/lint-fix',
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
