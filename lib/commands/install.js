/* eslint-disable jest/no-jest-import */
import _ from 'lodash';
import path from 'path';
import firost from 'firost';
export default {
  /**
   * Where is the called from?
   * @returns {String} Path to the root
   **/
  rootDir() {
    return process.env.INIT_CWD;
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

    // We add the config files

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

    const absoluteSource = path.resolve('./templates', source);

    await firost.shell(`cp "${absoluteSource}" "${absoluteDestination}"`);
  },
  async addScripts() {
    const defaultScripts = {
      build: 'aberlaas build',
      'build:watch': 'aberlaas build --watch',
      lint: 'aberlaas lint',
      'lint:fix': 'aberlaas lint --fix',
      release: 'aberlaas release',
      test: 'aberlaas test',
      'test:watch': 'aberlaas test --watch',
    };
    const packagePath = path.join(this.rootDir(), 'package.json');
    const currentPackage = await firost.readJson(packagePath);
    const currentScripts = _.get(currentPackage, 'scripts', {});

    const newScripts = { ...defaultScripts, ...currentScripts };
    const newPackage = {
      ...currentPackage,
      scripts: newScripts,
    };

    await firost.writeJson(packagePath, newPackage);
  },
};
