/* eslint-disable jest/no-jest-import */
import { _, pMapSeries } from 'golgoth';
import firost from 'firost';
import helper from '../helper';
export default {
  /**
   * Copy a config template to the host
   * @param {string} source Path to source file, relative to aberlaas
   * @param {string} destination Path to destination file, relative to the host
   * @returns {boolean} False if can't copy file, true otherwise
   **/
  async copyToHost(source, destination) {
    const absoluteSource = helper.aberlaasPath(source);
    const absoluteDestination = helper.hostPath(destination);

    // Source file does not exist
    if (!(await firost.isFile(absoluteSource))) {
      return false;
    }
    // Destination file already exist
    if (await firost.isFile(absoluteDestination)) {
      return false;
    }

    await firost.copy(absoluteSource, absoluteDestination);

    return true;
  },
  /**
   * Add config files to the host. Each config files reference the default
   * aberlaas config for its tool. This pattern allow end-users to use aberlaas
   * default rules and overwrite them as they see fit
   **/
  async addConfigFiles() {
    // Babel
    // Note that babel can be configured both through babel.config.js and
    // .babelrc.js. The difference is that .babelrc.js files are looked for at
    // the project root, while babel.config.js are recursively checked up the
    // tree. We use babel.config.js as it provides more flexibility to users,
    // especially when dealing with monorepos sharing one config
    await this.copyToHost('./templates/babel.config.js', 'babel.config.js');

    // ESLint
    await this.copyToHost('./templates/eslintrc.js', '.eslintrc.js');
    await this.copyToHost('./templates/eslintignore.conf', '.eslintignore');

    // Jest
    await this.copyToHost('./templates/jest.config.js', 'jest.config.js');

    // Husky
    await this.copyToHost('./templates/huskyrc.js', '.huskyrc.js');
  },
  /**
   * Add scripts entry to the host package.json with specified command.
   * @param {string} scriptName Script name
   * @param {string} scriptPath Path to the script to run, must be a path
   * relative to the templates/ directory
   * @returns {boolean} False if can't add entrt, true otherwise
   **/
  async addPackageScript(scriptName, scriptPath) {
    const packagePath = helper.hostPath('package.json');
    const currentPackage = await firost.readJson(packagePath);
    const currentScripts = _.get(currentPackage, 'scripts', {});

    if (currentScripts[scriptName]) {
      return false;
    }

    await this.copyToHost(`./templates/${scriptPath}`, scriptPath);

    const newPackage = _.set(
      _.clone(currentPackage),
      `scripts.${scriptName}`,
      `./${scriptPath}`
    );
    await firost.writeJson(newPackage, packagePath);
    return true;
  },
  /**
   * Add default scripts to the package.json scripts entry and copy scripts to
   * ./scripts if needed
   **/
  async addScripts() {
    const defaultScripts = [
      { key: 'build', value: 'scripts/build' },
      { key: 'build:watch', value: 'scripts/build-watch' },
      { key: 'lint', value: 'scripts/lint' },
      { key: 'lint:js', value: 'scripts/lint-js' },
      { key: 'lint:fix', value: 'scripts/lint-fix' },
      { key: 'release', value: 'scripts/release' },
      { key: 'test', value: 'scripts/test' },
      { key: 'test:watch', value: 'scripts/test-watch' },
    ];

    await pMapSeries(defaultScripts, async script => {
      await this.addPackageScript(script.key, script.value);
    });
  },
  /**
   * Copy all config files and configure the scripts
   **/
  async run() {
    await this.addConfigFiles();
    await this.addScripts();
  },
};
