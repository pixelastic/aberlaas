const githubHelper = require('../helpers/github.js');
const sshHelper = require('../helpers/ssh.js');
const _ = require('golgoth/lib/lodash');
const consoleInfo = require('firost/consoleInfo');
const consoleSuccess = require('firost/consoleSuccess');
const consoleError = require('firost/consoleError');
module.exports = {
  /**
   * Check if SSH public key is already added to GitHub
   * @returns {boolean} True if already enabled, false otherwise
   **/
  async isEnabled() {
    const { username: owner, repo } = await githubHelper.repoData();
    const keys = await githubHelper.octokit('repos.listDeployKeys', {
      owner,
      repo,
    });
    const { public: publicKey } = await sshHelper.getKeys();
    // GitHub does not save the email as part of the key, so we shave it off our
    // key
    const truncatedKey = _.chain(publicKey)
      .split(' ')
      .slice(0, 2)
      .join(' ')
      .value();

    const foundKey = _.find(keys, { key: truncatedKey });
    return !!foundKey;
  },
  /**
   * Add the SSH public key to GitHub
   * @returns {boolean} True on success
   **/
  async enable() {
    if (await this.isEnabled()) {
      this.__consoleInfo('SSH public key already saved on GitHub');
      return true;
    }
    const { public: key } = await sshHelper.getKeys();
    const { username: owner, repo } = await githubHelper.repoData();
    await githubHelper.octokit('repos.createDeployKey', {
      owner,
      repo,
      key,
      title: 'aberlaas - Push from CircleCI',
      read_only: false,
    });
    this.__consoleSuccess('SSH public key saved on GitHub');
    return true;
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
