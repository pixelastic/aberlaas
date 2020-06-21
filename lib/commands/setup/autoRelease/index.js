const npmToken = require('./npmToken.js');
const privateKey = require('./privateKey.js');
const publicKey = require('./publicKey.js');
const sshHelper = require('../helpers/ssh.js');
const npmHelper = require('../helpers/npm.js');
const githubHelper = require('../helpers/github.js');
const circleciHelper = require('../helpers/circleci.js');
const _ = require('golgoth/lib/lodash');
const consoleError = require('firost/lib/consoleError');
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

    await npmToken.enable();
    await privateKey.enable();
    await publicKey.enable();
  },
  /**
   * Returns an array of error messages for every token/binary missing
   * @returns {Array} List of error messages
   **/
  async validationErrors() {
    const validationErrors = [];
    if (!circleciHelper.hasToken()) {
      validationErrors.push('You need a CIRCLECI_TOKEN');
    }
    if (!npmHelper.hasToken()) {
      validationErrors.push('You need a NPM_TOKEN');
    }
    if (!githubHelper.hasToken()) {
      validationErrors.push('You need a GITHUB_TOKEN');
    }
    if (!sshHelper.hasBinary()) {
      validationErrors.push('You need ssh-keygen available in your $PATH');
    }

    return validationErrors;
  },
  __consoleError: consoleError,
  __cache: {},
};