import { writeJson } from 'firost';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import helper from 'aberlaas-helper';
import initHelper from '../helper.js';

export default {
  /**
   * Create the package.json
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
      ci: './scripts/ci',
      compress: './scripts/compress',
      lint: './scripts/lint',
      'lint:fix': './scripts/lint-fix',
      test: './scripts/test',
      'test:watch': './scripts/test-watch',
      release: './scripts/release',
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

    await writeJson(packageContent, helper.hostGitPath('./package.json'), {
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
    await initHelper.addScripts('__module');
    await initHelper.addLibFiles();
  },
  __getProjectName: initHelper.getProjectName,
  __getProjectAuthor: initHelper.getProjectAuthor.bind(initHelper),
  __getAberlaasVersion: initHelper.getAberlaasVersion,
};
