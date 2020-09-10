const circleciHelper = require('../helpers/circleci.js');
const githubHelper = require('../helpers/github.js');
const sshHelper = require('../helpers/ssh.js');
const consoleSuccess = require('firost/consoleSuccess');
module.exports = {
  /**
   * Save a private SSH key on CircleCI.
   * The CircleCI API does not allow checking if a SSH key has been defined,
   * so we will need to re-add it each time. But to avoid creating duplicates,
   * we will delete any key with the same fingerprint first
   **/
  async enable() {
    const {
      private: private_key,
      privateFingerprint: fingerprint,
    } = await sshHelper.getKeys();
    const { username, repo } = await githubHelper.repoData();
    const hostname = 'github.com';

    // Delete it first
    await circleciHelper.api(`project/github/${username}/${repo}/ssh-key`, {
      method: 'delete',
      json: {
        fingerprint,
        hostname,
      },
    });

    // Then, add it
    await circleciHelper.api(`project/github/${username}/${repo}/ssh-key`, {
      method: 'post',
      json: {
        hostname,
        private_key,
      },
    });

    this.__consoleSuccess('SSH private key force saved on CircleCI');
  },
  __consoleSuccess: consoleSuccess,
};
