const _ = require('golgoth/lodash');
const pMapSeries = require('golgoth/pMapSeries');
const isFile = require('firost/isFile');
const copy = require('firost/copy');
const readJson = require('firost/readJson');
const writeJson = require('firost/writeJson');
const exists = require('firost/exists');
const read = require('firost/read');
const write = require('firost/write');
const run = require('firost/run');
const spinner = require('firost/spinner');
const helper = require('../helper');
const path = require('path');
const nodeConfig = require('../configs/node');
const consoleInfo = require('firost/consoleInfo');
module.exports = {
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
    if (!(await isFile(absoluteSource))) {
      return false;
    }
    // Destination file already exist
    if (await isFile(absoluteDestination)) {
      return false;
    }

    await copy(absoluteSource, absoluteDestination);

    return true;
  },
  /**
   * Add config files to the host. Each config files reference the default
   * aberlaas config for its tool. This pattern allow end-users to use aberlaas
   * default rules and overwrite them as they see fit
   **/
  async addConfigFiles() {
    // ESLint
    await this.copyToHost('templates/_eslintrc.js', '.eslintrc.js');
    await this.copyToHost('templates/_eslintignore.conf', '.eslintignore');

    // Husky
    await this.copyToHost('templates/_huskyrc.js', '.huskyrc.js');

    // Lint-staged
    await this.copyToHost('templates/_lintstagedrc.js', '.lintstagedrc.js');

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

    // CircleCI
    await this.copyToHost(
      'templates/_circleci/config.yml',
      '.circleci/config.yml'
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
    const currentPackage = await readJson(packagePath);
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
    await writeJson(newPackage, packagePath);
    return true;
  },
  /**
   * Add default scripts to the package.json scripts entry and copy scripts to
   * ./scripts if needed
   **/
  async addScripts() {
    const defaultScripts = [
      { key: 'ci', value: 'scripts/ci' },
      { key: 'lint', value: 'scripts/lint' },
      { key: 'lint:fix', value: 'scripts/lint-fix' },
      { key: 'husky:precommit', value: 'scripts/husky-precommit' },
      { key: 'release', value: 'scripts/release' },
      { key: 'test', value: 'scripts/test' },
      { key: 'test:watch', value: 'scripts/test-watch' },
    ];

    await pMapSeries(defaultScripts, async (script) => {
      await this.addPackageScript(script.key, script.value);
    });
  },
  /**
   * Update package.json with .main and .files keys to use files in ./lib
   * directory by default
   **/
  async setDefaultReleaseFiles() {
    const packagePath = helper.hostPath('package.json');
    const currentPackage = await readJson(packagePath);

    // Update .main
    const currentMain = currentPackage.main;
    const currentMainIsDefault = currentMain === 'index.js';
    if (!currentMain || currentMainIsDefault) {
      currentPackage.main = 'lib/main.js';
      await this.copyToHost('templates/lib/main.js', 'lib/main.js');
      await this.copyToHost(
        'templates/lib/__tests__/main.js',
        'lib/__tests__/main.js'
      );
    }

    const currentFiles = currentPackage.files;
    const currentFilesIsEmpty = _.isEmpty(currentFiles);
    if (!currentFiles || currentFilesIsEmpty) {
      currentPackage.files = ['lib/*.js'];
    }

    await writeJson(currentPackage, packagePath);
  },
  /**
   * Add an MIT LICENSE file to the repository
   **/
  async addLicenseFile() {
    const licensePath = helper.hostPath('LICENSE');

    if (await exists(licensePath)) {
      return;
    }

    const template = await read(helper.aberlaasPath('./templates/LICENSE'));
    const currentPackage = await readJson(helper.hostPath('package.json'));

    const content = _.replace(template, '{author}', currentPackage.author);

    await write(content, licensePath);
  },
  /**
   * Sets license to MIT in package.json
   **/
  async addLicenseField() {
    const packagePath = helper.hostPath('package.json');
    const currentPackage = await readJson(packagePath);

    if (currentPackage.license) {
      return;
    }

    const newPackage = {
      ...currentPackage,
      license: 'MIT',
    };

    await writeJson(newPackage, packagePath);
  },
  /**
   * Sets a default 0.0.1 version if none is defined
   **/
  async addDefaultVersion() {
    const packagePath = helper.hostPath('package.json');
    const currentPackage = await readJson(packagePath);

    if (currentPackage.version) {
      return;
    }

    const newPackage = {
      ...currentPackage,
      version: '0.0.1',
    };

    await writeJson(newPackage, packagePath);
  },
  /**
   * Sets the dirname as package name if none is defined
   **/
  async addDefaultName() {
    const packagePath = helper.hostPath('package.json');
    const currentPackage = await readJson(packagePath);

    if (currentPackage.name) {
      return;
    }

    const newPackage = {
      ...currentPackage,
      name: path.basename(helper.hostPath()),
    };

    await writeJson(newPackage, packagePath);
  },
  /**
   * Pin the node version through nvm and yarn through yarnrc
   * This allows us to run the same version locally as we do in CI
   **/
  async pinNodeAndYarn() {
    // Set .nvmrc
    const nvmrcPath = helper.hostPath('.nvmrc');
    await write(nodeConfig.nodeVersion, nvmrcPath);

    // Download latest yarn version
    await this.__run('yarn set version', { stdout: false });
  },
  /**
   * Copy all config files and configure the scripts
   **/
  async run() {
    const progress = spinner();

    progress.tick('Pinning node and yarn versions');
    await this.pinNodeAndYarn();

    progress.tick('Adding config files');
    await this.addConfigFiles();

    progress.tick('Adding yarn scripts');
    await this.addScripts();

    progress.tick('Updating LICENSE');
    await this.addLicenseFile();
    await this.addLicenseField();

    progress.tick('Setting default version');
    await this.addDefaultVersion();

    progress.tick('Setting default name');
    await this.addDefaultName();

    progress.tick('Setting default release files');
    await this.setDefaultReleaseFiles();

    progress.success('aberlaas project initialized');

    this.__consoleInfo(
      "Don't forget to run aberlaas setup after pushing your repository"
    );
  },
  __run: run,
  __consoleInfo: consoleInfo,
};
