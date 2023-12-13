import _ from 'golgoth/lodash.js';
import pMapSeries from 'golgoth/pMapSeries.js';
import isFile from 'firost/isFile.js';
import copy from 'firost/copy.js';
import readJson from 'firost/readJson.js';
import writeJson from 'firost/writeJson.js';
import exists from 'firost/exists.js';
import read from 'firost/read.js';
import write from 'firost/write.js';
import run from 'firost/run.js';
import spinner from 'firost/spinner.js';
import helper from '../../helper.js';
import path from 'path';
import nodeConfig from '../../configs/node.cjs';
import consoleInfo from 'firost/consoleInfo.js';

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
    await this.copyToHost('templates/_eslintrc.cjs', '.eslintrc.cjs');
    await this.copyToHost('templates/_eslintignore.conf', '.eslintignore');

    // Husky
    await this.copyToHost('templates/_huskyrc.cjs', '.huskyrc.cjs');

    // Lint-staged
    await this.copyToHost('templates/_lintstagedrc.cjs', '.lintstagedrc.cjs');

    // Vite
    await this.copyToHost('templates/vite.config.js', 'vite.config.js');

    // Prettier
    await this.copyToHost('templates/_prettierrc.cjs', '.prettierrc.cjs');

    // Stylelint
    await this.copyToHost('templates/_stylelintrc.cjs', '.stylelintrc.cjs');

    // Renovate
    await this.copyToHost(
      'templates/_github/renovate.json',
      '.github/renovate.json',
    );

    // CircleCI
    await this.copyToHost(
      'templates/_circleci/config.yml',
      '.circleci/config.yml',
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
      `./${scriptPath}`,
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
   * TODO: Update this to use exports instead of main
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
        'lib/__tests__/main.js',
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
   * Sets the minimum node version to run this module
   * Which is the same version it has been tested on
   **/
  async addEngineNodeVersion() {
    const packagePath = helper.hostPath('package.json');
    const currentPackage = await readJson(packagePath);

    if (_.has(currentPackage, 'engines')) {
      return;
    }

    const newPackage = {
      ...currentPackage,
      engines: {
        node: `>=${nodeConfig.nodeVersion}`,
      },
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
    await this.addEngineNodeVersion();

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
      "Don't forget to run aberlaas setup after pushing your repository",
    );
  },
  __run: run,
  __consoleInfo: consoleInfo,
};