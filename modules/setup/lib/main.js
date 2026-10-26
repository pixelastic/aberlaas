import { _ } from 'golgoth';
import { enable as enableCircleci } from './circleci.js';
import { enable as enableGithub } from './github.js';
import { ensureGithubToken } from './helpers/github.js';
import { enable as enableRenovate } from './renovate.js';

export let __;

/**
 * Enable external services.
 * Will enable CircleCI, GitHub and Renovate by default.
 * @param {object} cliArgs CLI Argument object, as created by minimist
 */
export async function run(cliArgs = {}) {
  const defaultServices = {
    circleci: true,
    renovate: true,
    github: true,
  };
  const cliServices = _.omit(cliArgs, ['_']);
  const servicesToEnable = {
    ...defaultServices,
    ...cliServices,
  };

  // Both services need a valid token, fail before enabling anything
  if (servicesToEnable.github || servicesToEnable.renovate) {
    await __.ensureGithubToken();
  }

  if (servicesToEnable.github) {
    await __.enableGithub();
  }
  if (servicesToEnable.circleci) {
    await __.enableCircleci();
  }
  if (servicesToEnable.renovate) {
    await __.enableRenovate();
  }
}

__ = {
  ensureGithubToken,
  enableGithub,
  enableCircleci,
  enableRenovate,
};

export default { run };
