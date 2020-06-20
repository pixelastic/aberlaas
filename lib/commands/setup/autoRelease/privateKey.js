const helper = require('../helper.js');
const ssh = require('./ssh.js');
const consoleSuccess = require('firost/lib/consoleSuccess');
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
    } = await ssh.getSshKeys();
    const { username, repo } = await helper.githubData();
    const hostname = 'github.com';

    // Delete it first
    await helper.circleCiV1(`project/github/${username}/${repo}/ssh-key`, {
      method: 'delete',
      json: {
        fingerprint,
        hostname,
      },
    });

    // Then, add it
    await helper.circleCiV1(`project/github/${username}/${repo}/ssh-key`, {
      method: 'post',
      json: {
        hostname,
        private_key,
      },
    });

    this.__consoleSuccess('SSH private key saved on CircleCI');
  },
  __consoleSuccess: consoleSuccess,
};
