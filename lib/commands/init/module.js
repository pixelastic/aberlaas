import { readJson, writeJson } from 'firost';

import helper from '../../helper.js';
import nodeConfig from '../../configs/node.cjs';
import initHelper from './helper.js';

export default {
  /**
   * Create the top-level package.json
   **/
  async createPackageJson() {
    // Get language and dependency version
    const { version: aberlaasVersion } = await readJson(
      helper.aberlaasPath('./package.json'),
    );
    const { nodeVersion, yarnVersion } = nodeConfig;

    const name = await this.__getProjectName();
    const version = '0.0.1';

    const author = await this.__getProjectAuthor();
    const description = '';
    const keywords = [];
    const repository = `${author}/${name}`;
    const homepage = `https://projects.pixelastic.com/${name}`;

    const type = 'module';
    const license = 'MIT';
    const engines = {
      node: `>=${nodeVersion}`,
    };
    const packageManager = `yarn@${yarnVersion}`;

    const files = ['*.js'];
    const exports = {
      '.': './main.js',
    };
    const main = './main.js';

    const dependencies = {};
    const devDependencies = {
      aberlaas: aberlaasVersion,
    };

    const scripts = {
      // Docs
      build: './scripts/docs/build',
      'build:prod': './scripts/docs/build-prod',
      cms: './scripts/docs/cms',
      serve: './scripts/docs/serve',
      // Lib
      release: './scripts/lib/release',
      test: './scripts/lib/test',
      'test:watch': './scripts/lib/test-watch',
      // Common
      ci: './scripts/ci',
      compress: './scripts/compress',
      lint: './scripts/lint',
      'lint:fix': './scripts/lint-fix',
    };

    const packageContent = {
      // Name and version
      name,
      version,

      // Metadata
      author,
      description,
      keywords,
      repository,
      homepage,

      // Compatibility
      type,
      license,
      engines,
      packageManager,

      // Exports
      files,
      exports,
      main,

      // Dependencies
      dependencies,
      devDependencies,

      // Scripts
      scripts,
    };

    await writeJson(packageContent, helper.hostPath('./package.json'), {
      sort: false,
    });
  },

  /**
   * Scaffold a repo for use in a simple module contexte
   **/
  async run() {
    await this.createPackageJson();

    await initHelper.addLicenseFile('LICENSE');
    await initHelper.addConfigFiles();
    await initHelper.addScripts();
    await initHelper.addLibFiles();
  },
  __getProjectName: initHelper.getProjectName.bind(initHelper),
  __getProjectAuthor: initHelper.getProjectAuthor.bind(initHelper),
};
