/* eslint-disable jest/no-jest-import */
import { _, pMap } from 'golgoth';
import firost from 'firost';
import path from 'path';
export default {
  /**
   * Where is this called from?
   * This is a path to a user project
   * @returns {String} Path to the root
   **/
  rootDir() {
    return process.env.INIT_CWD;
  },

  /**
   * Path to the aberlaas template directory
   * This is a path to aberlaas from the node_modules
   * @returns {String} Path to the template directory
   **/
  templateDir() {
    return path.resolve(path.join(__dirname, '..', '..', 'templates'));
  },

  /**
   * Copy a config template to the host
   * @param {String} source The name of the file in the ./templates dir
   * @param {String} destination The name of the file in the host
   * @returns {Void}
   **/
  async addTemplate(source, destination) {
    const absoluteDestination = path.join(this.rootDir(), destination);

    // Skip existing files
    if (await firost.isFile(absoluteDestination)) {
      return;
    }

    const absoluteSource = path.resolve(this.templateDir(), source);

    await firost.copy(absoluteSource, absoluteDestination);
  },
  /**
   * Add scripts to package.json
   * @returns {Void}
   **/
  async addScripts() {
    const defaultScripts = {
      build: './scripts/build',
      'build:watch': './scripts/build-watch',
      lint: './scripts/lint',
      'lint:fix': './scripts/lint-fix',
      release: './scripts/release',
      test: './scripts/test',
      'test:watch': './scripts/test-watch',
    };
    const packagePath = path.join(this.rootDir(), 'package.json');
    const currentPackage = await firost.readJson(packagePath);
    const currentScripts = _.get(currentPackage, 'scripts', {});

    // Adding scripts to package.json
    const newScripts = { ...defaultScripts, ...currentScripts };
    const newPackage = {
      ...currentPackage,
      scripts: newScripts,
    };

    await firost.writeJson(newPackage, packagePath);

    // Adding files into ./scripts
    const scripts = _.values(defaultScripts);
    await pMap(scripts, async script => {
      await this.addTemplate(script, script);
    });
  },
  /**
   * Copy all config files and configure the scripts
   * @returns {Void}
   **/
  async run() {
    // Note: Because we added husky as a dependency (and not a devDependency),
    // its postinstall script will be called whenever someone install aberlaas,
    // thus hooks will correctly be copied. We don't have to do anything in that
    // regard.

    // Note: We use babel.config.js and not .babelrc.js.
    // Babel will look for .babelrc.js files at the same level as the package.json
    // file but will look up the tree until it finds a babel.config.js.
    // In a regular setup, both will do the same, but when building a monorepo, with
    // package.json in subfolders, babel.config.js allows us to have one master
    // config for all projects.
    await this.addTemplate('babel.config.js', 'babel.config.js');

    await this.addTemplate('eslintrc.js', '.eslintrc.js');
    await this.addTemplate('eslintignore.conf', '.eslintignore');

    await this.addTemplate('huskyrc.js', '.huskyrc.js');

    await this.addTemplate('jest.config.js', 'jest.config.js');

    // We add the scripts
    await this.addScripts();
  },
};
