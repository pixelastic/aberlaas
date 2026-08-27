import { _ } from 'golgoth';
import { consoleInfo, exists, prompt, read, remove, run, write } from 'firost';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import { npmVersion } from 'aberlaas-versions';
import Gilmore from 'gilmore';

export let __;

/**
 * Encode a package name for use in npm registry URLs
 * Scoped packages need the slash encoded but not the @
 * @param {string} packageName - npm package name (may be scoped, e.g. @scope/name)
 * @returns {string} Encoded package name safe for registry URLs
 */
export function encodePackageName(packageName) {
  return packageName.replace('/', '%2f');
}

/**
 * Ensure the user is logged in to npm via npx npm login
 * Checks whoami, prompts for browser login if needed, then re-checks
 * @returns {Promise<void>}
 */
export async function ensureNpmLogin() {
  if (await __.isAuthenticated()) {
    return;
  }

  __.consoleInfo('Registering trusted publishers requires npm authentication.');
  await __.prompt('Press Enter to open npm login in your browser');
  await __.run(`echo | npx npm@${npmVersion} login --loglevel=warn`, {
    shell: true,
    stdout: false,
  });
  await __.ensureNpmLogin();
}

/**
 * Check if a CircleCI trusted publisher is registered for a package
 * @param {string} packageName - npm package name (may be scoped)
 * @param {string} projectId - CircleCI project UUID
 * @returns {Promise<boolean>} True if a matching trusted publisher exists
 */
export async function isTrustedPublisherRegistered(packageName, projectId) {
  const encodedName = encodePackageName(packageName);
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

/**
 * Check if a package has never been published to npm
 * @param {string} packageName - npm package name (may be scoped)
 * @returns {Promise<boolean>} True if the package has never been published
 */
export async function isFirstPublish(packageName) {
  const encodedName = encodePackageName(packageName);
  const url = `https://registry.npmjs.org/${encodedName}`;
  const response = await __.fetch(url, { method: 'HEAD' });

  return response.status === 404;
}

/**
 * Remove legacy npm auth artifacts from the host project
 * Removes npmAuthToken line from .yarnrc.yml (and commits), deletes .env
 * @deprecated Temporary cleanup — remove once all downstream projects have migrated
 * @returns {Promise<boolean>} True if anything was cleaned up
 */
export async function removeLegacyNpmAuth() {
  let didCleanup = false;

  // Remove .env, was only used to save the legacy npm token
  const envPath = hostGitPath('.env');
  if (await exists(envPath)) {
    await remove(envPath);
    didCleanup = true;
  }

  // Fail-safe if no .yarnrc.yml
  const yarnrcPath = hostGitPath('.yarnrc.yml');
  if (!(await exists(yarnrcPath))) {
    return didCleanup;
  }

  // Remove the npmAuthToken: line
  const content = await read(yarnrcPath);
  const cleaned = _.replace(content, /^npmAuthToken:.*\n?/m, '');
  if (cleaned === content) {
    return didCleanup;
  }

  // Rewrite the file back, and commit it
  await write(cleaned, yarnrcPath);
  const repo = new Gilmore(hostGitRoot());
  await repo.add('.yarnrc.yml');
  await repo.commit('chore(release): remove legacy npm auth token');
  return true;
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
  consoleInfo,
  ensureNpmLogin,
  prompt,
  run,
  fetch,
};
