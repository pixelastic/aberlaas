import path from 'node:path';
import { _, pMap } from 'golgoth';
import { firostError, run, spinner } from 'firost';

export let __;

/**
 * Publishes all packages in the release data to npm with public access
 * @param {object} releaseData - The release data containing package information
 * @param {Array<object>} releaseData.allPackages - Array of package objects to publish
 * @param {string} releaseData.allPackages[].filepath - Path to the package.json file
 * @param {object} releaseData.allPackages[].content - Package.json content object
 * @param {string} releaseData.allPackages[].content.name - Name of the package
 * @returns {Promise<void>} Promise that resolves when all packages are published
 */
export async function publishToNpm(releaseData) {
  const { allPackages, newVersion } = releaseData;
  const progress = __.spinner(allPackages.length);

  await pMap(
    allPackages,
    async (packageData) => {
      const packageName = packageData.content.name;
      progress.tick(`Publishing ${packageName}@${newVersion}`);

      await __.publishPackage(packageData);
    },
    { concurrency: 5 },
  );
  progress.success('All packages published to npm');
}

__ = {
  /**
   * Publishes a single package, wrapping pushToRegistry with error handling
   * @param {object} packageData - Package object with filepath and content
   * @returns {Promise<boolean>} True if publish succeeded
   */
  async publishPackage(packageData) {
    const { content } = packageData;

    try {
      await __.pushToRegistry(packageData);
      return true;
    } catch (err) {
      const packageName = content.name;
      throw firostError(
        'ABERLAAS_RELEASE_NPM_PUBLISH_FAILED',
        `Failed to publish ${packageName} to npm:\n${err.message}`,
      );
    }
  },
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
  run,
  spinner,
};
