const helper = require('../../helper.js');
const lint = require('./index.js');
const _ = require('golgoth/lib/lodash');
const firostError = require('firost/lib/error');
const readJson = require('firost/lib/readJson');
const exists = require('firost/lib/exists');
const run = require('firost/lib/run');
module.exports = {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    // Check all JavaScript files and all files defined in .bin in package.json
    const allJsFiles = await lint.getInputFiles(['.js'], userPatterns);
    const allBinFiles = await this.getBinFiles();

    return [...allJsFiles, ...allBinFiles];
  },
  /**
   * Returns the list of all bin files defined in the package.json
   * @returns {Array} List of bin files
   **/
  async getBinFiles() {
    const packagePath = helper.hostPath('package.json');
    const hasPackage = await exists(packagePath);
    if (!hasPackage) {
      return [];
    }
    const packageContent = await readJson(packagePath);
    return _.chain(packageContent)
      .get('bin', {})
      .values()
      .map(filepath => {
        return helper.hostPath(filepath);
      })
      .value();
  },
  /**
   * Lint all files and display results.
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @param {Array} additionalOptions Other options to pass to the eslint CLI
   * @returns {boolean} True on success
   **/
  async run(userPatterns, userConfigFile, additionalOptions = []) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }

    const configFile = await helper.configFile(
      userConfigFile,
      '.eslintrc.js',
      'lib/configs/eslint.js'
    );
    const pluginResolveDir = helper.aberlaasRoot();
    const options = [
      ...files,
      ...additionalOptions,
      '--color',
      `--config=${configFile}`,
      `--resolve-plugins-relative-to=${pluginResolveDir}`,
    ];
    const binary = await helper.which('eslint');

    try {
      await run(`${binary} ${options.join(' ')}`, { stdout: false });
    } catch (error) {
      throw firostError('JavaScriptLintError', error.stdout);
    }
    return true;
  },
  /**
   * Autofix files in place
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @returns {boolean} True on success
   **/
  async fix(userPatterns, userConfigFile) {
    return await this.run(userPatterns, userConfigFile, ['--fix']);
  },
  __run: run,
};
