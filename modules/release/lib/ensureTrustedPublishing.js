import { _ } from 'golgoth';
import { consoleInfo, readJson, spinner, writeJson } from 'firost';
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

  // Register unregistered packages with OTP and save flags
  await __.registerTrustedPublishers(unregisteredPackages, trustConfig);

  // Commit and push the package.json changes
  const repo = __.createRepo();
  const commitHashBefore = await repo.currentCommit();
  await repo.commitAll('chore: flag trusted publishers in package.json');
  const commitHashAfter = await repo.currentCommit();
  if (commitHashBefore !== commitHashAfter) {
    await repo.push();
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
   * Saves the trusted publisher flag to each package.json after registration
   * @param {object[]} packages - Package objects with filepath and content
   * @param {object} trustConfig - CircleCI trust config
   * @returns {Promise<void>}
   */
  async registerTrustedPublishers(packages, trustConfig) {
    if (_.isEmpty(packages)) {
      return;
    }

    __.consoleInfo(
      `Registering trusted publishers for ${packages.length} package(s) (requires OTP)`,
    );

    let progress;
    await __.withOtpRetry(packages, async (packageData, otp) => {
      // Start a progress on first loop
      if (!progress) {
        progress = __.spinner(packages.length);
      }
      progress.tick(
        `Registering trusted publisher: ${packageData.content.name}`,
      );
      await registerTrustedPublisher({
        packageName: packageData.content.name,
        otp,
        ...trustConfig,
      });
      await __.saveTrustedPublisherFlag(packageData);
    });
    progress.success('All trusted publishers registered');
  },

  /**
   * Write aberlaas.trustedPublisher: true to a package's package.json
   * @param {object} packageData - Package object with filepath and content
   * @returns {Promise<void>}
   */
  async saveTrustedPublisherFlag(packageData) {
    const content = await __.readJson(packageData.filepath);
    content.aberlaas = { ...content.aberlaas, trustedPublisher: true };
    await __.writeJson(content, packageData.filepath, { sort: false });
  },

  consoleInfo,
  readJson,
  spinner,
  writeJson,
  ensureCircleciToken,
  removeLegacyNpmAuth,
  hasPublishWorkflow,
  addPublishWorkflow,
  getCircleciTrustConfig,
  ensureNpmLogin,
  withOtpRetry,
};
