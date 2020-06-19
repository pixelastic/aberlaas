const circleci = require('./circleci.js');
const _ = require('golgoth/lib/lodash');

// autoRelease should fail if circleCI not enabled
// should also fail if no CIRCLECI_TOKEN, NPM_TOKEN nor GITHUB_TOKEN
// should then create the env variables
module.exports = {
  async run(cliArgs = {}) {
    const defaultServices = {
      circleci: true,
      renovate: true,
      'auto-release': false,
    };
    const cliServices = _.omit(cliArgs, ['_']);
    const servicesToEnable = {
      ...defaultServices,
      ...cliServices,
    };

    if (servicesToEnable.circleci) {
      await this.circleci();
    }
    if (servicesToEnable.renovate) {
      await this.renovate();
    }
    if (servicesToEnable['auto-release']) {
      await this.autoRelease();
    }
  },
  async circleci() {
    await circleci.enable();
  },
  async renovate() {},
  async autoRelease() {},
};
