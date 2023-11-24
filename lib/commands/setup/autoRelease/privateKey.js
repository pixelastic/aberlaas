import circleciHelper from '../helpers/circleci.js';
import githubHelper from '../helpers/github.js';
import sshHelper from '../helpers/ssh.js';
import consoleSuccess from 'firost/consoleSuccess.js';

export default {
  /**
   * Save a private SSH key on CircleCI.
   * The CircleCI API does not allow checking if a SSH key has been defined,
   * so we will need to re-add it each time. But to avoid creating duplicates,
   * we will delete any key with the same fingerprint first
   **/
  async enable() {
    const keys = await sshHelper.getKeys();
    const privateKey = keys.private;
    const privateFingerprint = keys.privateFingerprint;
    const { username, repo } = await githubHelper.repoData();
    const hostname = 'github.com';

    // Delete it first
    await circleciHelper.api(`project/github/${username}/${repo}/ssh-key`, {
      method: 'delete',
      json: {
        fingerprint: privateFingerprint,
        hostname,
      },
    });

    // Then, add it
    await circleciHelper.api(`project/github/${username}/${repo}/ssh-key`, {
      method: 'post',
      json: {
        hostname,
        private_key: privateKey,
      },
    });

    this.__consoleSuccess('SSH private key force saved on CircleCI');
  },
  __consoleSuccess: consoleSuccess,
};
