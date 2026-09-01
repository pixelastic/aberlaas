import { _ } from 'golgoth';
import { spinner } from 'firost';
import {
  pollPipelineStatus,
  triggerPipeline,
} from './helpers/circleci/index.js';
import { withOtpRetry } from './helpers/otp.js';
import { pushToRegistry } from './helpers/registry.js';
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
    const pipelineId = await __.triggerPipeline(packageNames);
    await __.pollPipelineStatus(pipelineId);
  }
}

__ = {
  ensureYarnNpmLogin,
  pushToRegistry,
  triggerPipeline,
  pollPipelineStatus,
  withOtpRetry,
  spinner,
};
