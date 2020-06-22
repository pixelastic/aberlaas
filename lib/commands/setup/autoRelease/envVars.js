const circleciHelper = require('../helpers/circleci.js');
const githubHelper = require('../helpers/github.js');
const npmHelper = require('../helpers/npm.js');
const consoleInfo = require('firost/lib/consoleInfo');
const consoleSuccess = require('firost/lib/consoleSuccess');
const pMap = require('golgoth/lib/pMap');
module.exports = {
  /**
   * Save an ENV variable to CircleCI
   * @param {string} name Name of the ENV variable
   * @param {string} value Value of the ENV variable
   **/
  async saveEnvVar(name, value) {
    const { username, repo } = await githubHelper.repoData();
    await circleciHelper.api(
      `project/github/${username}/${repo}/envvar/${name}`,
      {
        method: 'delete',
      }
    );
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
