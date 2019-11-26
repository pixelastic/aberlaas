import helper from '../helper';
import ciInfo from 'ci-info';
import firost from 'firost';
import execa from 'execa';
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
   * Stops the CI process with an error
   **/
  failure() {
    process.exit(1);
  },
  /**
   * Stops the CI process with a success
   **/
  success() {
    process.exit(0);
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
   * Run a specific script through yarn run
   * @param {string} scriptName Name of the script to run
   **/
  async runScript(scriptName) {
    const currentDir = process.cwd();
    process.chdir(helper.hostRoot());

    try {
      const subprocess = this.__execa('yarn', ['run', scriptName]);
      // Display output in realtime
      subprocess.stdout.pipe(process.stdout);
      subprocess.stderr.pipe(process.stdout); // Jest outputs to stderr
      // Wait until the process is finished
      await subprocess;
    } finally {
      process.chdir(currentDir);
    }
  },
  /**
   * Display the current node and yarn versions
   **/
  async displayVersion() {
    const { stdout: nodeVersion } = await this.__execa('node', ['--version']);
    const { stdout: yarnVersion } = await this.__execa('yarn', ['--version']);
    helper.consoleInfo(`node ${nodeVersion}, yarn v${yarnVersion}`);
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
    try {
      await pMap(
        scripts,
        async scriptName => {
          await this.runScript(scriptName);
        },
        { concurrency: 1 }
      );
    } catch (err) {
      this.failure();
      return false;
    }

    this.success();
  },
  __execa: execa,
};
