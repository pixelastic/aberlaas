const release = require('../release.js');
const consoleInfo = require('firost/lib/consoleInfo');
const _ = require('golgoth/lib/lodash');
const run = require('firost/lib/run');
const write = require('firost/lib/write');
const exists = require('firost/lib/exists');
const helper = require('../../helper.js');
module.exports = {
  /**
   * Run a git command in the repo
   *
   * @param {string} gitCommand Git command to run
   * @returns {string} Command output
   */
  async gitRun(gitCommand) {
    const repoPath = helper.hostPath();
    const result = await run(`cd ${repoPath} && ${gitCommand}`, {
      shell: true,
      stdout: false,
    });
    return result.stdout;
  },
  /**
   * Set a git config value only if wasn't set before
   * @param {string} name Name of the config
   * @param {string} value Value of the config
   **/
  async gitConfigSet(name, value) {
    // We test to see if there is already a value. If no, we write it
    try {
      await this.gitRun(`git config ${name}`);
    } catch (err) {
      await this.gitRun(`git config ${name} ${value}`);
    }
  },
  /**
   * Returns the latest tag of the repo
   *
   * @returns {string} Latest tag
   **/
  async gitGetLatestTag() {
    const allTags = await this.gitRun('git tag -l --sort=creatordate');
    return _.chain(allTags)
      .split('\n')
      .last()
      .value();
  },
  /**
   * Returns an array of all commit description since last release
   *
   * @returns {Array} List of all commit description
   **/
  async getCommitsSinceLastRelease() {
    const latestTag = await this.gitGetLatestTag();
    const range = latestTag ? `${latestTag}..HEAD` : 'HEAD';
    const commitList = await this.gitRun(`git log ${range} --format=%B`);
    return _.chain(commitList)
      .split('\n')
      .compact()
      .reverse()
      .value();
  },
  /**
   * Determines what version should be released based on the commits since the
   * last release
   * @returns {string|boolean} False if no release, otherwise minor or patch
   **/
  async getReleaseVersion() {
    const commits = await this.getCommitsSinceLastRelease();
    const status = {
      isMinor: false,
      isPatch: false,
    };
    _.each(commits, commit => {
      const isMinor = _.startsWith(commit, 'feat(');
      const isPatch = _.startsWith(commit, 'fix(');
      status.isMinor = status.isMinor || isMinor;
      status.isPatch = status.isPatch || isPatch;
    });

    if (status.isMinor) {
      return 'minor';
    }
    if (status.isPatch) {
      return 'patch';
    }
    return false;
  },
  /**
   * Run the auto-release script.
   * If there had been any feat() of fix() commits since last release,
   * automatically release a new one
   **/
  async run() {
    this.__consoleInfo('Attempt to auto-release...');

    const releaseVersion = await this.getReleaseVersion();
    // Don't release if no relevant changes
    if (!releaseVersion) {
      this.__consoleInfo('No relevant commits since last release.');
      return;
    }

    this.__consoleInfo(`Releasing a ${releaseVersion} version`);
    await this.configureGit();
    await this.configureNpm();

    const releaseArguments = {
      _: [releaseVersion],
      test: false,
    };
    await this.__releaseRun(releaseArguments);
  },
  /**
   * Set git user name and email
   * */
  async configureGit() {
    const email = this.getEnvVar('GIT_USER_EMAIL');
    const name = this.getEnvVar('GIT_USER_NAME');
    await this.gitConfigSet('user.email', email);
    await this.gitConfigSet('user.name', name);
  },
  /**
   * Write a ~/.npmrc with the token
   **/
  async configureNpm() {
    const npmRcPath = '~/.npmrc';
    if (await this.__exists(npmRcPath)) {
      return false;
    }
    const token = this.getEnvVar('NPM_TOKEN');
    const content = `//registry.npmjs.org/:_authToken=${token}`;
    await this.__write(content, npmRcPath);
  },
  /**
   * Return an ENV var value
   * @param {string} key ENV var key
   * @returns {string} ENV var value
   **/
  getEnvVar(key) {
    return _.get(process, `env.${key}`);
  },
  __releaseRun: release.run.bind(release),
  __consoleInfo: consoleInfo,
  __write: write,
  __exists: exists,
};
