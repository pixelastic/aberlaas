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
  await addLibFiles();
}

__ = {
  // Public methods

  /**
   * Create the top-level workspace
   */
  async createRootWorkspace() {
    const aberlaasVersion = await getAberlaasVersion();
    const sharedProjectData = await __.getSharedProjectData();
    const engines = {
      node: `>=${nodeVersion}`,
    };

    const packageContent = {
      // Name and version
      name: `${sharedProjectData.name}-root`,

      // Dev info
      private: true,
      type: 'module',
      workspaces: ['docs', 'lib'],

      // Metadata
      description: `${sharedProjectData.name} root workspace`,
      author: sharedProjectData.author,
      homepage: sharedProjectData.homepage,
      repository: sharedProjectData.repository,

      // Compatibility
      license: sharedProjectData.license,
      engines,
      packageManager: `yarn@${yarnVersion}`,

      // Dependencies
      devDependencies: {
        aberlaas: aberlaasVersion,
      },

      // Scripts
      scripts: {
        build: './scripts/build',
        'build:prod': './scripts/build-prod',
        ci: './scripts/ci',
        cms: './scripts/cms',
        compress: './scripts/compress',
        lint: './scripts/lint',
        'lint:fix': './scripts/lint-fix',
        release: './scripts/release',
        serve: './scripts/serve',
        test: './scripts/test',
        'test:watch': './scripts/test-watch',
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

      // Dev info
      private: true,
      type: 'commonjs',

      // Metadata
      description: `${sharedProjectData.name} docs`,
      author: sharedProjectData.author,
      homepage: sharedProjectData.homepage,
      repository: sharedProjectData.repository,

      // Compatibility
      license: sharedProjectData.license,

      // Dependencies
      dependencies: {
        norska: norskaVersion,
        'norska-theme-docs': norskaThemeDocsVersion,
      },

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
    const projectName = sharedProjectData.name;
    const engines = {
      node: `>=${nodeVersion}`,
    };

    const packageContent = {
      // Name and version
      name: sharedProjectData.name,
      version: '0.0.1',

      // Dev info
      type: 'module',

      // Metadata
      description: `${projectName} module`,
      author: sharedProjectData.author,
      homepage: sharedProjectData.homepage,
      keywords: [projectName],
      repository: sharedProjectData.repository,

      // Compatibility
      sideEffects: false,
      license: sharedProjectData.license,
      engines,

      // Exports
      files: ['./*.js'],
      exports: {
        '.': './main.js',
      },
      main: './main.js',

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
    const repository = {
      type: 'git',
      url: `https://github.com/${author}/${name}`,
    };
    const license = 'MIT';
    const scripts = {
      build: 'cd .. && ./scripts/build',
      'build:prod': 'cd .. && ./scripts/build-prod',
      ci: 'cd .. && ./scripts/ci',
      cms: 'cd .. && ./scripts/cms',
      compress: 'cd .. && ./scripts/compress',
      lint: 'cd .. && ./scripts/lint',
      'lint:fix': 'cd .. && ./scripts/lint-fix',
      release: 'cd .. && ./scripts/release',
      serve: 'cd .. && ./scripts/serve',
      test: 'cd .. && ./scripts/test',
      'test:watch': 'cd .. && ./scripts/test-watch',
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
