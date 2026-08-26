import { _ } from 'golgoth';
import { run } from 'firost';
import { npmVersion } from 'aberlaas-versions';

export let __;

/**
 * Ensure the user is logged in to npm via npx npm login
 * Checks whoami, runs interactive login if needed, then re-checks
 * @returns {Promise<void>}
 */
export async function ensureNpmLogin() {
  if (await __.isAuthenticated()) {
    return;
  }

  await __.run(`npx npm@${npmVersion} login`, { stdin: true });
  await __.ensureNpmLogin();
}

/**
 * Check if a CircleCI trusted publisher is registered for a package
 * @param {string} packageName - npm package name (may be scoped)
 * @param {string} projectId - CircleCI project UUID
 * @returns {Promise<boolean>} True if a matching trusted publisher exists
 */
export async function isTrustedPublisherRegistered(packageName, projectId) {
  const encodedName = encodeURIComponent(packageName);
  const url = `https://registry.npmjs.org/-/package/${encodedName}/trust`;
  const response = await __.fetch(url);
  const entries = await response.json();

  return _.some(entries, {
    type: 'circleci',
    claims: { 'oidc.circleci.com/project-id': projectId },
  });
}

/**
 * Register a CircleCI trusted publisher on npm for a package
 * @param {object} options - Registration options
 * @param {string} options.packageName - npm package name (may be scoped)
 * @param {string} options.otp - One-time password for npm
 * @param {string} options.circleciOrgId - CircleCI organization UUID
 * @param {string} options.circleciProjectId - CircleCI project UUID
 * @param {string} options.circleciPipelineDefinitionId - CircleCI pipeline definition UUID
 * @param {string} options.vcsOrigin - VCS origin (e.g. gh/owner/repo)
 * @returns {Promise<void>}
 */
export async function registerTrustedPublisher({
  packageName,
  otp,
  circleciOrgId,
  circleciProjectId,
  circleciPipelineDefinitionId,
  vcsOrigin,
}) {
  const command = [
    'npx',
    `npm@${npmVersion}`,
    'trust',
    'circleci',
    packageName,
    '--org-id',
    circleciOrgId,
    '--project-id',
    circleciProjectId,
    '--pipeline-definition-id',
    circleciPipelineDefinitionId,
    '--vcs-origin',
    vcsOrigin,
    '--allow-publish',
    '--otp',
    otp,
  ];

  await __.run(command);
}

__ = {
  /**
   * Check if the user is authenticated with npm via npx npm whoami
   * @returns {Promise<boolean>} True if authenticated, false otherwise
   */
  async isAuthenticated() {
    try {
      await __.run(`npx npm@${npmVersion} whoami`, {
        stderr: false,
        stdout: false,
      });
      return true;
    } catch (_err) {
      return false;
    }
  },
  ensureNpmLogin,
  run,
  fetch,
};
