import github from './github.js';
import circleci from './circleci.js';
import renovate from './renovate.js';
import autoRelease from './autoRelease/index.js';
import _ from 'golgoth/lodash.js';

export default {
  /**
   * Enable external services.
   * Will enable CircleCI, GitHub and Renovate by default.
   * If --auto-release is passed, will configure CircleCI
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs = {}) {
    const defaultServices = {
      circleci: true,
      renovate: true,
      github: true,
      'auto-release': false,
    };
    const cliServices = _.omit(cliArgs, ['_']);
    const servicesToEnable = {
      ...defaultServices,
      ...cliServices,
    };

    if (servicesToEnable.github) {
      await this.github();
    }
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
  /**
   * Configure GitHub
   **/
  async github() {
    await github.enable();
  },
  /**
   * Enable CircleCI
   **/
  async circleci() {
    await circleci.enable();
  },
  /**
   * Enable renovate
   **/
  async renovate() {
    await renovate.enable();
  },
  /**
   * Enable autoRelease on CircleCI
   **/
  async autoRelease() {
    await autoRelease.enable();
  },
};
