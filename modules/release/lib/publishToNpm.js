import path from 'node:path';
import { pMap } from 'golgoth';
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
  const progress = __.spinner(releaseData.allPackages.length);

  await pMap(
    releaseData.allPackages,
    async (packageData) => {
      const packageName = packageData.content.name;
      const packageVersion = packageData.content.version;
      progress.tick(`Publishing ${packageName}@${packageVersion}`);

      await __.publishPackage(packageData);
    },
    { concurrency: 5 },
  );
  progress.success('All packages published to npm');
}

__ = {
  async publishPackage(packageData) {
    const { filepath, content } = packageData;

    try {
      await __.run('npm publish --access public', {
        cwd: path.dirname(filepath),
        stdout: false,
        stderr: false,
      });
      return true;
    } catch (err) {
      const packageName = content.name;
      throw firostError(
        'ABERLAAS_RELEASE_NPM_PUBLISH_FAILED',
        `Failed to publish ${packageName} to npm:\n${err.message}`,
      );
    }
  },
  run,
  spinner,
};
