const circleciHelper = require('../helpers/circleci.js');
const githubHelper = require('../helpers/github.js');
const npmHelper = require('../helpers/npm.js');
const consoleInfo = require('firost/lib/consoleInfo');
const consoleSuccess = require('firost/lib/consoleSuccess');
module.exports = {
  /**
   * Check if NPM_TOKEN is correctly set on CircleCI
   * @returns {boolean} True if already set, false otherwise
   **/
  async isEnabled() {
    const { username, repo } = await githubHelper.repoData();
    try {
      const envvar = await circleciHelper.api(
        `project/github/${username}/${repo}/envvar/NPM_TOKEN`
      );
      const token = npmHelper.token();
      const last4Chars = token.slice(-4);
      const obfuscatedValue = `xxxx${last4Chars}`;

      return envvar.value === obfuscatedValue;
    } catch (err) {
      return false;
    }
  },
  /**
   * Save NPM_TOKEN as a CircleCI ENV variable
   **/
  async enable() {
    if (await this.isEnabled()) {
      this.__consoleInfo('NPM_TOKEN already set on CircleCI');
      return true;
    }

    const token = npmHelper.token();
    const { username, repo } = await githubHelper.repoData();
    await circleciHelper.api(`project/github/${username}/${repo}/envvar`, {
      method: 'post',
      json: {
        name: 'NPM_TOKEN',
        value: token,
      },
    });

    this.__consoleSuccess('NPM_TOKEN saved on CircleCI');
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
};
