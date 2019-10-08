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
    await this.copyToHost('templates/babel.config.js', 'babel.config.js');

    // ESLint
    await this.copyToHost('templates/_eslintrc.js', '.eslintrc.js');
    await this.copyToHost('templates/_eslintignore.conf', '.eslintignore');

    // Husky
    await this.copyToHost('templates/_huskyrc.js', '.huskyrc.js');

    // Jest
    await this.copyToHost('templates/jest.config.js', 'jest.config.js');

    // Prettier
    await this.copyToHost('templates/_prettierrc.js', '.prettierrc.js');

    // Stylelint
    await this.copyToHost('templates/_stylelintrc.js', '.stylelintrc.js');

    // Renovate
    await this.copyToHost(
      'templates/_github/renovate.json',
      '.github/renovate.json'
    );
  },
  /**
   * Add scaffolding files for faster bootstrap
   * - ./lib/index.js
   * - ./lib/__tests__/index.js
   **/
  async addScaffolding() {
    await this.copyToHost('templates/lib/index.js', 'lib/index.js');
    await this.copyToHost(
      'templates/lib/__tests__/index.js',
      'lib/__tests__/index.js'
    );
  },
  /**
   * Add scripts entry to the host package.json with specified command.
   * @param {string} scriptName Script name
   * @param {string} scriptPath Path to the script to run, must be a path
   * relative to the templates/ directory
   * @returns {boolean} False if can't add entry, true otherwise
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
      { key: 'lint:fix', value: 'scripts/lint-fix' },
      { key: 'lint:css', value: 'scripts/lint-css' },
      { key: 'lint:css:fix', value: 'scripts/lint-css-fix' },
      { key: 'lint:js', value: 'scripts/lint-js' },
      { key: 'lint:js:fix', value: 'scripts/lint-js-fix' },
      { key: 'lint:json', value: 'scripts/lint-json' },
      { key: 'lint:json:fix', value: 'scripts/lint-json-fix' },
      { key: 'lint:yml', value: 'scripts/lint-yml' },
      { key: 'lint:yml:fix', value: 'scripts/lint-yml-fix' },
      { key: 'release', value: 'scripts/release' },
      { key: 'test', value: 'scripts/test' },
      { key: 'test:watch', value: 'scripts/test-watch' },
    ];

    await pMapSeries(defaultScripts, async script => {
      await this.addPackageScript(script.key, script.value);
    });
  },
  /**
   * Update package.json with .main and .files keys to use files in ./build
   * directory by default
   **/
  async setDefaultReleaseFiles() {
    const packagePath = helper.hostPath('package.json');
    const currentPackage = await firost.readJson(packagePath);

    const newPackage = {
      ...currentPackage,
      main: 'build/index.js',
      files: ['build/'],
    };

    await firost.writeJson(newPackage, packagePath);
  },
  /**
   * Add an MIT LICENSE file to the repository
   **/
  async addLicenseFile() {
    const licensePath = helper.hostPath('LICENSE');

    if (await firost.exist(licensePath)) {
      return;
    }

    const template = await firost.read(
      helper.aberlaasPath('./templates/LICENSE')
    );
    const currentPackage = await firost.readJson(
      helper.hostPath('package.json')
    );

    const content = _.replace(template, '{author}', currentPackage.author);

    await firost.write(content, licensePath);
  },
  /**
   * Copy all config files and configure the scripts
   **/
  async run() {
    await this.addConfigFiles();
    await this.addScaffolding();
    await this.addScripts();
    await this.addLicenseFile();
    await this.setDefaultReleaseFiles();
  },
};
