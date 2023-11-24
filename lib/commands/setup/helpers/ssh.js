import helper from '../../../helper.js';
import githubHelper from './github.js';
import _ from 'golgoth/lodash.js';
import which from 'firost/which.js';
import exists from 'firost/exists.js';
import read from 'firost/read.js';
import run from 'firost/run.js';
import mkdirp from 'firost/mkdirp.js';
import path from 'path';

export default {
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
