import { _, pMap } from 'golgoth';
import { consoleInfo, spinner } from 'firost';
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
  const commitHashBefore = await repo.currentCommit();

  // Auto-cleanup of old npm token saved in repo
  const didCleanup = await __.removeLegacyNpmAuth();
  if (didCleanup) {
    __.consoleInfo('Removed legacy npm auth from repo');
  }

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
  const { circleciProjectId } = trustConfig;

  // Check which packages need trusted publisher registration
  const unregisteredPackages = await __.findPackagesWithoutTrustedPublisher(
    alreadyPublishedPackages,
    circleciProjectId,
  );

  // Register unregistered packages with OTP
  await __.registerTrustedPublishers(unregisteredPackages, trustConfig);
}

__ = {
  /**
   * Create a Gilmore repo instance for the host git root
   * @returns {object} Gilmore instance
   */
  createRepo() {
    return new Gilmore(hostGitRoot());
  },

  /**
   * Find packages that don't have a trusted publisher registered
   * @param {Array<object>} packages - Already published package objects
   * @param {string} projectId - CircleCI project UUID
   * @returns {Promise<string[]>} Names of unregistered packages
   */
  async findPackagesWithoutTrustedPublisher(packages, projectId) {
    const progress = __.spinner(packages.length);
    const unregistered = [];
    await pMap(
      packages,
      async (pkg) => {
        const packageName = pkg.content.name;
        progress.tick(`Checking trusted publisher: ${packageName}`);
        const registered = await __.isTrustedPublisherRegistered(
          packageName,
          projectId,
        );
        if (!registered) {
          unregistered.push(packageName);
        }
      },
      { concurrency: 5 },
    );

    const successMessage = _.isEmpty(unregistered)
      ? 'All trusted publishers registered'
      : `${unregistered.length} package(s) need trusted publisher registration`;
    progress.success(successMessage);

    return unregistered;
  },

  /**
   * Register unregistered packages as trusted publishers with OTP
   * @param {string[]} packageNames - Names of packages to register
   * @param {object} trustConfig - CircleCI trust config
   * @returns {Promise<void>}
   */
  async registerTrustedPublishers(packageNames, trustConfig) {
    if (_.isEmpty(packageNames)) {
      return;
    }

    await __.ensureNpmLogin();
    __.consoleInfo(
      `Registering trusted publishers for ${packageNames.length} package(s) (requires OTP)`,
    );

    let progress;
    await __.withOtpRetry(packageNames, async (packageName, otp) => {
      // Start a progress on first loop
      if (!progress) {
        progress = __.spinner(packageNames.length);
      }
      progress.tick(`Registering trusted publisher: ${packageName}`);
      await registerTrustedPublisher({
        packageName,
        otp,
        ...trustConfig,
      });
    });
    progress.success('All trusted publishers registered');
  },

  consoleInfo,
  spinner,
  ensureCircleciToken,
  removeLegacyNpmAuth,
  hasPublishWorkflow,
  addPublishWorkflow,
  getCircleciTrustConfig,
  isTrustedPublisherRegistered,
  ensureNpmLogin,
  withOtpRetry,
};
