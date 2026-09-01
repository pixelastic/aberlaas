import { _ } from 'golgoth';
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

  // Cleanup legacy npm auth and add CircleCI workflow if needed
  await __.ensureRepoConfig();

  // Filter packages that still need trusted publisher registration
  const unregisteredPackages = _.reject(
    alreadyPublishedPackages,
    'hasTrustedPublisher',
  );
  if (_.isEmpty(unregisteredPackages)) {
    return;
  }

  // npm login is required to register trusted publishers
  await __.ensureNpmLogin();

  // Fetch CircleCI trust config
  const trustConfig = await __.getCircleciTrustConfig();

  // Register unregistered packages with OTP
  const unregisteredNames = _.map(unregisteredPackages, 'content.name');
  await __.registerTrustedPublishers(unregisteredNames, trustConfig);
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
   * Cleanup legacy npm auth and ensure CircleCI workflow exists
   * Pushes any resulting commits to remote
   * @returns {Promise<void>}
   */
  async ensureRepoConfig() {
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
  ensureNpmLogin,
  withOtpRetry,
};
