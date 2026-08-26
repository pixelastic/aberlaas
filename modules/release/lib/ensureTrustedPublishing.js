import { _, pMap } from 'golgoth';
import { consoleInfo } from 'firost';
import { hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import {
  addPublishWorkflow,
  ensureCircleciToken,
  getCircleciTrustConfig,
  hasPublishWorkflow,
} from './helpers/circleci/index.js';
import {
  ensureNpmLogin,
  isTrustedPublisherRegistered,
  registerTrustedPublisher,
  removeLegacyNpmAuth,
} from './helpers/npm.js';
import { withOtpRetry } from './helpers/otp.js';

export let __;

/**
 * Orchestrate trusted publishing setup for all non-first-publish packages
 * @param {object} releaseData - Release data from getReleaseData
 * @returns {Promise<void>}
 */
export async function ensureTrustedPublishing(releaseData) {
  const alreadyPublishedPackages = _.reject(
    releaseData.allPackages,
    'isFirstPublish',
  );
  // Stop if all packages are first-time publish
  if (_.isEmpty(alreadyPublishedPackages)) {
    return;
  }

  // Fail fast if no CircleCI token
  await __.ensureCircleciToken();

  const repo = __.createRepo();

  // Cleanup legacy auth and add workflow if needed
  const commitHashBefore = await repo.currentCommit();

  // Auto-cleanup of old npm token saved in repo
  __.consoleInfo('Removing legacy npm auth from repo');
  await __.removeLegacyNpmAuth();

  // Add the CircleCI workflow if it doesn't exist yet
  if (!(await __.hasPublishWorkflow())) {
    __.consoleInfo('Adding trusted-publish workflow to CircleCI config');
    await __.addPublishWorkflow();
  }

  // If we created commits doing so, push them
  const commitHashAfter = await repo.currentCommit();
  if (commitHashBefore !== commitHashAfter) {
    __.consoleInfo('Pushing commits to remote');
    await repo.push();
  }

  // Fetch CircleCI trust config
  const trustConfig = await __.getCircleciTrustConfig();

  // Check which packages need trusted publisher registration
  __.consoleInfo('Checking trusted publisher registration');
  const unregisteredPackages = [];
  await pMap(
    alreadyPublishedPackages,
    async (pkg) => {
      const registered = await __.isTrustedPublisherRegistered(
        pkg.content.name,
        trustConfig.circleciProjectId,
      );
      if (!registered) {
        unregisteredPackages.push(pkg.content.name);
      }
    },
    { concurrency: 5 },
  );

  // Register unregistered packages with OTP
  if (!_.isEmpty(unregisteredPackages)) {
    await __.ensureNpmLogin();
    await __.withOtpRetry(unregisteredPackages, (packageName, otp) => {
      __.consoleInfo(`Registering trusted publisher for ${packageName}`);
      return registerTrustedPublisher({
        packageName,
        otp,
        ...trustConfig,
      });
    });
  }
}

__ = {
  /**
   * Create a Gilmore repo instance for the host git root
   * @returns {object} Gilmore instance
   */
  createRepo() {
    return new Gilmore(hostGitRoot());
  },
  consoleInfo,
  ensureCircleciToken,
  removeLegacyNpmAuth,
  hasPublishWorkflow,
  addPublishWorkflow,
  getCircleciTrustConfig,
  isTrustedPublisherRegistered,
  ensureNpmLogin,
  withOtpRetry,
};
