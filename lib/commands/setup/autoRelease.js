const helper = require('./helper.js');
const _ = require('golgoth/lib/lodash');
const consoleInfo = require('firost/lib/consoleInfo');
const consoleSuccess = require('firost/lib/consoleSuccess');
const consoleError = require('firost/lib/consoleError');
const which = require('firost/lib/which');
module.exports = {
  /**
   * Enable autoRelease by configuring CircleCI and GitHub
   * @returns {boolean} True if enabled, false otherwise
   **/
  async enable() {
    // Fail early if we're missing the required tokens
    const validationErrors = await this.validationErrors();
    if (!_.isEmpty(validationErrors)) {
      this.__consoleError(
        '[autoRelease] Please fix the following errors and try again:'
      );
      _.each(validationErrors, this.__consoleError);
      return false;
    }

    // Do nothing if already enabled
    if (await this.isEnabled()) {
      this.__consoleInfo('autoRelease already enabled');
      return true;
    }

    await this.setCircleCiEnvVariable();
    await this.setCircleCiPublicKey();
    // await this.setGithubPrivateKey();
  },
  /**
   * Returns an array of error messages for every token/binary missing
   * @returns {Array} List of error messages
   **/
  async validationErrors() {
    const validationErrors = [];
    if (!helper.hasCircleCiToken()) {
      validationErrors.push('You need a CIRCLECI_TOKEN');
    }
    if (!helper.hasNpmToken()) {
      validationErrors.push('You need a NPM_TOKEN');
    }
    if (!helper.hasGithubToken()) {
      validationErrors.push('You need a GITHUB_TOKEN');
    }
    if (!this.hasSshKeygen()) {
      validationErrors.push('You need ssh-keygen available in your $PATH');
    }

    // TODO: Check for ssh-gen
    return validationErrors;
  },
  /**
   * Check if autoRelease is already enabled
   * @returns {boolean} True if already enabled, false otherwise
   **/
  async isEnabled() {
    const hasCircleCiNpmToken = await this.hasCircleCiNpmToken();
    const hasCircleCiPublicKey = await this.hasCircleCiPublicKey();
    const hasGithubPrivateKey = await this.hasGithubPrivateKey();
    return hasCircleCiNpmToken && hasCircleCiPublicKey && hasGithubPrivateKey;
  },
  /**
   * Check if NPM_TOKEN is correctly set on CircleCI
   * Note: This uses a cache, so the method only calls the API once
   * @returns {boolean} True if already set, false otherwise
   **/
  async hasCircleCiNpmToken() {
    if (this.__cacheHasCircleCiNpmToken) {
      return this.__cacheHasCircleCiNpmToken;
    }
    const { username, repo } = await helper.githubData();
    const envvar = await helper.circleCiV1(
      `project/github/${username}/${repo}/envvar/NPM_TOKEN`
    );

    const npmToken = helper.npmToken();
    const last4Chars = npmToken.slice(-4);
    const obfuscatedValue = `xxxx${last4Chars}`;

    const result = envvar.value === obfuscatedValue;
    this.__cacheHasCircleCiEnvVariable = result;
    return result;
  },
  /**
   * Save NPM_TOKEN as a CircleCI ENV variable
   **/
  async setCircleCiEnvVariable() {
    if (await this.hasCircleCiEnvVariable()) {
      this.__consoleInfo('NPM_TOKEN already set on CircleCI');
      return true;
    }

    const npmToken = helper.npmToken();
    const data = { name: 'NPM_TOKEN', value: npmToken };
    const { username, repo } = await helper.githubData();
    await helper.circleCiV1(`project/github/${username}/${repo}/envvar`, {
      method: 'post',
      json: data,
    });

    this.__consoleSuccess('NPM_TOKEN saved on CircleCI');
  },
  async hasCircleCiPublicKey() {
    // TODO:
  },
  async setCircleCiPublicKey() {
    if (await this.hasCircleCiPublicKey()) {
      this.__consoleInfo('SSH public key already saved on CircleCI');
      return true;
    }

    // TODO: Call the API to set the SSH key
    this.__consoleSuccess('SSH public key saved on CircleCI');
  },
  async hasGithubPrivateKey() {
    // TODO
  },
  async setGithubPrivateKey() {
    if (await this.hasGithubPrivateKey()) {
      this.__consoleInfo('SSH private key already saved on GitHub');
      return true;
    }

    // TODO: Call the API to set the SSH key
    this.__consoleSuccess('SSH private key saved on GitHub');
  },
  async hasSshKeygen() {
    const sshKeygenPath = await which('ssh-keygen');
    return !!sshKeygenPath;
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
