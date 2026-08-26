import path from 'node:path';
import { _ } from 'golgoth';
import { run, spinner } from 'firost';
import { pollPipelineStatus } from './helpers/circleci/pollPipelineStatus.js';
import { triggerPipeline } from './helpers/circleci/triggerPipeline.js';
import { withOtpRetry } from './helpers/otp.js';
import { ensureYarnNpmLogin } from './helpers/yarn.js';

export let __;

/**
 * Publishes packages to npm: direct publish for first-publish, CI for trusted-publish
 * Follows plan/ensure/execute: all ensures run before any publish
 * @param {object} releaseData - The release data containing package information
 * @param {Array<object>} releaseData.allPackages - Array of package objects to publish
 * @param {string} releaseData.newVersion - The new version being published
 * @returns {Promise<void>}
 */
export async function publishToNpm(releaseData) {
  const { allPackages, newVersion } = releaseData;

  // Plan — split by publish strategy
  const [firstPublishPackages, trustedPublishPackages] = _.partition(
    allPackages,
    { isFirstPublish: true },
  );

  // Direct publish runs first (trusted-publish packages may depend on newly-published ones)
  if (!_.isEmpty(firstPublishPackages)) {
    await __.ensureYarnNpmLogin();

    const progress = __.spinner(firstPublishPackages.length);
    await __.withOtpRetry(firstPublishPackages, async (packageData, otp) => {
      const packageName = packageData.content.name;
      progress.tick(`Publishing ${packageName}@${newVersion}`);
      await __.pushToRegistry(packageData, { otp });
    });
    progress.success('All first-publish packages published to npm');
  }

  // Trusted publish via CircleCI pipeline
  if (!_.isEmpty(trustedPublishPackages)) {
    const packageNames = _.map(trustedPublishPackages, 'content.name');
    const pipelineId = await __.triggerPipeline(`v${newVersion}`, packageNames);
    await __.pollPipelineStatus(pipelineId);
  }
}

__ = {
  /**
   * Runs `yarn npm publish --access public` for a single package
   * @param {object} packageData - Package object with filepath and content
   * @param {string} packageData.filepath - Path to the package.json file
   * @param {object} options - Additional flags to pass to the command
   * @param {string} options.otp - One-time password for npm authentication
   * @returns {Promise<void>}
   */
  async pushToRegistry(packageData, options = {}) {
    const { filepath } = packageData;

    // { otp: '123456' } → 'yarn npm publish --access public --otp 123456'
    const command = _.chain(options)
      .map((value, key) => `--${key} ${value}`)
      .thru((flags) => ['yarn npm publish --access public', ...flags])
      .join(' ')
      .value();

    // Note:
    // ✘ npm publish <= Keeps workspace:* in dependencies
    // ✔ yarn npm publish <= Replaces workspace:* with actual versions
    // This is why we use yarn npm publish and not npm publish directly
    await __.run(command, {
      cwd: path.dirname(filepath),
      stdout: false,
      stderr: false,
    });
  },
  ensureYarnNpmLogin,
  triggerPipeline,
  pollPipelineStatus,
  withOtpRetry,
  run,
  spinner,
};
