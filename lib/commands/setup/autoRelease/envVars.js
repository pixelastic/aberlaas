import circleciHelper from '../helpers/circleci.js';
import githubHelper from '../helpers/github.js';
import npmHelper from '../helpers/npm.js';
import consoleInfo from 'firost/consoleInfo.js';
import consoleSuccess from 'firost/consoleSuccess.js';
import pMap from 'golgoth/pMap.js';

export default {
  /**
   * Save an ENV variable to CircleCI
   * @param {string} name Name of the ENV variable
   * @param {string} value Value of the ENV variable
   **/
  async saveEnvVar(name, value) {
    const { username, repo } = await githubHelper.repoData();
    try {
      await circleciHelper.api(
        `project/github/${username}/${repo}/envvar/${name}`,
        {
          method: 'delete',
        },
      );
    } catch (err) {
      // Ignoring the error, it means the ENV var wasn't set in the first place
    }
    await circleciHelper.api(`project/github/${username}/${repo}/envvar`, {
      method: 'post',
      json: {
        name,
        value,
      },
    });
    this.__consoleSuccess(`${name} saved on CircleCI`);
  },
  /**
   * Save ENV Variables to CircleCI
   **/
  async enable() {
    // Vars to save
    const npmToken = npmHelper.token();
    const gitUserEmail = await githubHelper.config('user.email');
    const gitUserName = await githubHelper.config('user.name');
    const vars = [
      { name: 'NPM_TOKEN', value: npmToken },
      { name: 'GIT_USER_EMAIL', value: gitUserEmail },
      { name: 'GIT_USER_NAME', value: gitUserName },
    ];

    // Saving them in parallel
    await pMap(vars, async ({ name, value }) => {
      await this.saveEnvVar(name, value);
    });
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
};
