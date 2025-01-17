import { writeJson } from 'firost';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import helper from 'aberlaas-helper';
import initHelper from '../helper.js';

export default {
  /**
   * Create the top-level package.json
   */
  async createPackageJson() {
    const aberlaasVersion = this.__getAberlaasVersion();
    const name = await this.__getProjectName();
    const version = '0.0.1';

    const author = await this.__getProjectAuthor();
    const description = '';
    const keywords = [];
    const repository = `${author}/${name}`;
    const homepage = `https://github.com/${repository}`;

    const type = 'module';
    const sideEffects = false;
    const license = 'MIT';
    const engines = {
      node: `>=${nodeVersion}`,
    };
    const packageManager = `yarn@${yarnVersion}`;

    const files = ['lib/*.js'];
    const exports = {
      '.': './lib/main.js',
    };
    const main = './lib/main.js';

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
      sideEffects,
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
   * Scaffold a repo:
   * - With ./lib holding the code
   */
  async run() {
    await this.createPackageJson();

    await initHelper.addLicenseFile('LICENSE');
    await initHelper.addConfigFiles();
    await initHelper.addScripts();
    await initHelper.addLibFiles();
  },
  __getProjectName: initHelper.getProjectName.bind(initHelper),
  __getProjectAuthor: initHelper.getProjectAuthor.bind(initHelper),
  __getAberlaasVersion: initHelper.getAberlaasVersion.bind(initHelper),
};
