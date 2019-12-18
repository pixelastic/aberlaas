import helper from '../helper';
import ciInfo from 'ci-info';
import firost from 'firost';
import { _, pMap } from 'golgoth';

export default {
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
    const currentPackage = await firost.readJson(
      helper.hostPath('package.json')
    );
    return _.chain(currentPackage)
      .get('scripts')
      .keys()
      .value();
  },
  /**
   * Returns a list of scripts to run
   * This is build, test and run by default, but only build and test on renovate
   * PRs. Scripts not defined in package.json will be discarded.
   * @returns {Array} List of scripts to run
   **/
  async scriptsToRun() {
    const availableScripts = await this.availableScripts();

    // Get potential scripts to run
    const potentialScripts = ['build', 'test', 'lint'];

    return _.intersection(potentialScripts, availableScripts);
  },
  /**
   * Display the current node and yarn versions
   **/
  async displayVersion() {
    const { stdout: nodeVersion } = await firost.run('node --version', {
      stdout: false,
    });
    const { stdout: yarnVersion } = await firost.run('yarn --version', {
      stdout: false,
    });
    firost.consoleInfo(`node ${nodeVersion}, yarn v${yarnVersion}`);
  },
  /**
   * Run CI scripts and fail the build if any fails
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
};
