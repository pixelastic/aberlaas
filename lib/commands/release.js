/* eslint-disable jest/no-jest-import */
const _ = require('golgoth/lib/_');
const run = require('firost/lib/run');
const readJson = require('firost/lib/readJson');
const helper = require('../helper');

module.exports = {
  /**
   * Release the host package.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success, false otherwise
   **/
  async run(cliArgs = {}) {
    this.fixNpmRegistry();
    await this.fetchOrigin();

    const binary = await helper.which('np');
    const npOptions = await this.getNpArguments(cliArgs);
    await this.__run(`FORCE_COLOR=1 ${binary} ${npOptions}`, {
      stdin: true,
      shell: true,
    });
  },
  /**
   * Returns the CLI options to pass to np
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {string} Arguments to pass to np
   **/
  async getNpArguments(cliArgs = {}) {
    const options = [
      cliArgs._,
      '--no-release-draft',
      '--no-2fa',
      '--any-branch',
    ];
    const packageJson = await this.getHostPackageJson();

    // Skip tests if called with --no-test or if no scripts.test entry
    const cliTestStatus = _.get(cliArgs, 'test', true);
    const cliPackageStatus = _.get(packageJson, 'scripts.test', false);
    if (!cliTestStatus || !cliPackageStatus) {
      options.push('--no-tests');
    }

    // Run in preview mode if --dry-run is set
    const isDryRun = _.get(cliArgs, 'dry-run', false);
    if (isDryRun) {
      options.push('--preview');
    }

    return _.chain(options)
      .compact()
      .join(' ')
      .value();
  },
  /**
   * Yarn changes the npm_config_registry value, preventing npm publish to
   * actually work. We revert it to its default value for publishing to work
   **/
  fixNpmRegistry() {
    // eslint-disable-next-line camelcase
    process.env.npm_config_registry = 'https://registry.npmjs.org/';
  },
  /**
   * Fetches origin information, so np can correctly keep the branch up to date
   **/
  async fetchOrigin() {
    await this.__run('git fetch --all', { stdout: false });
  },
  /**
   * Returns the content of the host package.json
   * @returns {object} The content of the host package.json
   **/
  async getHostPackageJson() {
    return await this.__readJson(helper.hostPath('package.json'));
  },
  __run: run,
  __readJson: readJson,
};
