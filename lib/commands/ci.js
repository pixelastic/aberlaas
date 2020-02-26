const helper = require('../helper');
const ciInfo = require('ci-info');
const _ = require('golgoth/lib/lodash');
const pMap = require('golgoth/lib/pMap');
const readJson = require('firost/lib/readJson');
const run = require('firost/lib/run');
const consoleInfo = require('firost/lib/consoleInfo');

module.exports = {
  /**
   * Return the value of an environment variable
   * @param {string} key Name of the variable
   * @returns {*} Key value
   **/
  getEnv(key) {
    return _.get(process, `env.${key}`);
  },
  /**
   * Checks if currently running on a CI server
   * @returns {boolean} True if on a CI server
   **/
  isCI() {
    return ciInfo.isCI;
  },
  /**
   * Checks if currently running on CircleCI
   * @returns {boolean} True if on CircleCI
   **/
  isCircleCI() {
    return ciInfo.CIRCLE;
  },
  /**
   * Checks if currently on a PR
   * @returns {boolean} True if on a PR
   **/
  isPR() {
    return ciInfo.isPR;
  },
  /**
   * Return the name of the originating branch of the PR
   * @returns {string} Name of the PR branch
   **/
  prBranch() {
    if (!this.isPR()) {
      return false;
    }
    if (this.isCircleCI()) {
      return this.getEnv('CIRCLE_BRANCH');
    }
    return false;
  },
  /**
   * Returns the list of scripts defined in the package.json
   * @returns {Array} List of scripts defined
   **/
  async availableScripts() {
    // Get scripts in package.json
    const currentPackage = await readJson(helper.hostPath('package.json'));
    return _.chain(currentPackage)
      .get('scripts')
      .keys()
      .value();
  },
  /**
   * Returns a list of available scripts to run
   * @returns {Array} List of scripts to run
   **/
  async scriptsToRun() {
    const availableScripts = await this.availableScripts();

    // Get potential scripts to run
    const potentialScripts = ['test', 'lint', 'build:prod'];

    return _.intersection(potentialScripts, availableScripts);
  },
  /**
   * Display the current node and yarn versions
   **/
  async displayVersion() {
    const { stdout: nodeVersion } = await this.__run('node --version', {
      stdout: false,
    });
    const { stdout: yarnVersion } = await this.__run('yarn --version', {
      stdout: false,
    });
    this.__consoleInfo(`node ${nodeVersion}, yarn v${yarnVersion}`);
  },
  /**
   * Run CI scripts and fail the job if any fails
   * @returns {boolean} True on success, throws on error
   **/
  async run() {
    if (!this.isCI()) {
      return true;
    }

    await this.displayVersion();

    const scripts = await this.scriptsToRun();
    await pMap(
      scripts,
      async scriptName => {
        await helper.yarnRun(scriptName);
      },
      { concurrency: 1 }
    );

    return true;
  },
  __run: run,
  __consoleInfo: consoleInfo,
};
