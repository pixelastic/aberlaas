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
    await this.addTemplate('babelrc.js', '.babelrc.js');
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
