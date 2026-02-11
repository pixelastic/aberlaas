import { writeJson } from 'firost';
import { hostGitPath } from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import {
  addConfigFiles,
  addDefaultScripts,
  addLibFiles,
  addLicenseFile,
  getAberlaasVersion,
  getProjectAuthor,
  getProjectName,
} from '../helper.js';

export let __;

/**
 * Scaffold a repo:
 * - With ./lib holding the code
 */
export async function run() {
  await __.createPackageJson();

  await addLicenseFile('LICENSE');
  await addConfigFiles();
  await addDefaultScripts();
  await addLibFiles();
}

__ = {
  /**
   * Create the package.json
   */
  async createPackageJson() {
    const aberlaasVersion = await getAberlaasVersion();

    const name = await getProjectName();
    const version = '0.0.1';

    const type = 'module';

    const description = `${name} module`;
    const author = await getProjectAuthor();
    const homepage = `https://github.com/${author}/${name}`;
    const keywords = [name];
    const repository = {
      type: 'git',
      url: homepage,
    };

    const sideEffects = false;
    const license = 'MIT';
    const engines = {
      node: `>=${nodeVersion}`,
    };
    const packageManager = `yarn@${yarnVersion}`;

    const files = ['./lib/*.js'];
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
      release: './scripts/release',
      test: './scripts/test',
      'test:watch': './scripts/test-watch',
    };

    const packageContent = {
      // Name and version
      name,
      version,

      // Dev info
      type,

      // Metadata
      description,
      author,
      homepage,
      keywords,
      repository,

      // Compatibility
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

    await writeJson(packageContent, hostGitPath('./package.json'), {
      sort: false,
    });
  },
};

export default {
  run,
};
