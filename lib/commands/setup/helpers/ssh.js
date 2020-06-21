const aberlaasHelper = require('../../../helper.js');
const githubHelper = require('./github.js');
const _ = require('golgoth/lib/lodash');
const which = require('firost/lib/which');
const exists = require('firost/lib/exists');
const read = require('firost/lib/read');
const run = require('firost/lib/run');
const mkdirp = require('firost/lib/mkdirp');
const path = require('path');
module.exports = {
  /**
   * Check if ssh-keygen is available
   * @returns {boolean} True if available, false otherwise
   **/
  async hasBinary() {
    const sshKeygenPath = await which('ssh-keygen');
    return !!sshKeygenPath;
  },
  /**
   * Returns SSH keys (generate them if needed)
   * @returns {object} Object with .public, .private and .privateFingerprint
   **/
  async getKeys() {
    const keyDirectory = aberlaasHelper.hostPath('./tmp/ssh');
    const keyPath = path.resolve(keyDirectory, 'key');

    // Generating keys if do not exist
    const keyExists = await exists(keyPath);
    if (!keyExists) {
      await mkdirp(keyDirectory);
      const { email: keyEmail } = await githubHelper.repoData();
      const sshKeygenArguments = [
        '-m PEM',
        '-t rsa',
        `-C ${keyEmail}`,
        `-f ${keyPath}`,
        "-N ''",
      ];
      const command = `ssh-keygen ${sshKeygenArguments.join(' ')}`;
      await run(command, { shell: true, stdout: false });
    }

    const publicKeyPath = `${keyPath}.pub`;
    const publicKey = await read(publicKeyPath);
    const privateKey = await read(keyPath);
    const privateFingerprint = await this.getFingerprint(keyPath);

    return {
      public: publicKey,
      private: privateKey,
      privateFingerprint,
    };
  },
  /**
   * Returns the md5 fingerprint from a key path
   * @param {string} keyPath Filepath to the key file
   * @returns {string} Fingerprint as used by CircleCI and GitHub
   **/
  async getFingerprint(keyPath) {
    const command = `ssh-keygen -E md5 -l -f ${keyPath}`;
    const result = await run(command, { stdout: false });
    return _.chain(result)
      .get('stdout')
      .split(' ')
      .nth(1)
      .replace('MD5:', '')
      .value();
  },
};
