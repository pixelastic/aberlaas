const release = require('../release.js');
const _ = require('golgoth/lib/lodash');
const run = require('firost/lib/run');
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
    const releaseVersion = await this.getReleaseVersion();
    // Don't release if no relevant changes
    if (!releaseVersion) {
      return;
    }

    // Perform a release but skip tests as they were already done
    await this.release(releaseVersion);
  },
  async release(releaseVersion) {
    const releaseArguments = {
      _: [releaseVersion],
      test: false,
    };
    await this.__releaseRun(releaseArguments);
  },
  __releaseRun: release.run.bind(release),
};
