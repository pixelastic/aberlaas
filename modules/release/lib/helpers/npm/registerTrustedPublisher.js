import { run } from 'firost';
import { npmVersion } from 'aberlaas-versions';

export let __;

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
    // Skip the "Do you want to proceed? (y/N)"
    '--yes',
  ];

  try {
    // npm doesn't have a --otp, but reads its values from ENV var named
    // npm_config_*
    await __.run(command, {
      env: { npm_config_otp: otp },
      stdout: false,
      stderr: false,
    });
  } catch (error) {
    // npm registry returns 409 Conflict when a trusted publisher is already
    // configured for this package. We do not consider this an error and ignore
    // it
    if (error.stderr?.includes('E409')) {
      return;
    }
    throw error;
  }
}

__ = {
  run,
};
