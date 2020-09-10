const helper = require('../../../helper.js');
const githubHelper = require('./github.js');
const _ = require('golgoth/lib/lodash');
const which = require('firost/which');
const exists = require('firost/exists');
const read = require('firost/read');
const run = require('firost/run');
const mkdirp = require('firost/mkdirp');
const path = require('path');
module.exports = {
  /**
   * Check if ssh-keygen is available
   * @returns {boolean} True if available, false otherwise
   **/
  async hasBinary() {
    const sshKeygenPath = await this.__which('ssh-keygen');
    return !!sshKeygenPath;
  },
  /**
   * Returns SSH keys (generate them if needed)
   * @returns {object} Object with .public, .private and .privateFingerprint
   **/
  async getKeys() {
    const keyPath = helper.hostPath('./tmp/ssh/key');

    // Generating keys if do not exist
    const keyExists = await exists(keyPath);
    if (!keyExists) {
      await this.generateKeys(keyPath);
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
   * Generate SSH keys
   * @param {string} keyPath Path to the public key
   **/
  async generateKeys(keyPath) {
    const keyDirectory = path.dirname(keyPath);
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
    // Need to run in shell mode, otherwise does not understand the empty
    // passphrase
    await this.__run(command, { shell: true, stdout: false });
  },
  /**
   * Returns the md5 fingerprint from a key path
   * @param {string} keyPath Filepath to the key file
   * @returns {string} Fingerprint as used by CircleCI and GitHub
   **/
  async getFingerprint(keyPath) {
    const command = `ssh-keygen -E md5 -l -f ${keyPath}`;
    const result = await this.__run(command, { stdout: false });
    return _.chain(result)
      .get('stdout')
      .split(' ')
      .nth(1)
      .replace('MD5:', '')
      .value();
  },
  __which: which,
  __run: run,
};
