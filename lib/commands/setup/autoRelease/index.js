import envVars from './envVars.js';
import privateKey from './privateKey.js';
import publicKey from './publicKey.js';
import sshHelper from '../helpers/ssh.js';
import npmHelper from '../helpers/npm.js';
import githubHelper from '../helpers/github.js';
import circleciHelper from '../helpers/circleci.js';
import _ from 'golgoth/lodash.js';
import consoleError from 'firost/consoleError.js';

export default {
  /**
   * Enable autoRelease by configuring CircleCI and GitHub
   * @returns {boolean} True if enabled, false otherwise
   **/
  async enable() {
    // Fail early if we're missing the required tokens
    const validationErrors = await this.validationErrors();
    if (!_.isEmpty(validationErrors)) {
      this.__consoleError(
        '[autoRelease] Please fix the following errors and try again:',
      );
      _.each(validationErrors, (error) => {
        this.__consoleError(error);
      });
      return false;
    }

    await this.__envVarsEnable();
    await this.__privateKeyEnable();
    await this.__publicKeyEnable();
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
  __envVarsEnable: envVars.enable.bind(envVars),
  __privateKeyEnable: privateKey.enable.bind(privateKey),
  __publicKeyEnable: publicKey.enable.bind(publicKey),
  __cache: {},
};
