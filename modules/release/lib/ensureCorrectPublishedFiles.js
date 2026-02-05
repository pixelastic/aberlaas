import path from 'node:path';
import { _, pMap } from 'golgoth';
import { firostError, run as firostRun } from 'firost';

export let __;

/**
 * Ensures that all packages in the release have the correct files that will be published
 * @param {object} releaseData - The release data containing package information
 * @param {Array} releaseData.allPackages - Array of all packages to be released
 * @returns {boolean} True when all packages have been verified
 */
export async function ensureCorrectPublishedFiles(releaseData) {
  await pMap(
    releaseData.allPackages,
    __.ensureSameFilesPublishedWithYarnOrNpm,
    {
      concurrency: 5,
    },
  );
  return true;
}

__ = {
  async ensureSameFilesPublishedWithYarnOrNpm(packageData) {
    const packageName = packageData.content.name;
    const npmFiles = await __.getNpmPublishedFiles(packageData);
    const yarnFiles = await __.getYarnPublishedFiles(packageData);

    if (_.isEqual(npmFiles, yarnFiles)) {
      return true;
    }

    const onlyInNpm = _.difference(npmFiles, yarnFiles);
    const onlyInYarn = _.difference(yarnFiles, npmFiles);
    const message = [
      `[${packageName}] Files published by npm and yarn will be different:\n`,
    ];
    if (!_.isEmpty(onlyInNpm)) {
      message.push('Only in npm:');
      message.push(onlyInNpm.join('\n - '));
      message.push('');
    }
    if (!_.isEmpty(onlyInYarn)) {
      message.push('Only in yarn:');
      message.push(onlyInYarn.join('\n - '));
    }
    message.push('\nPlease check your .files key in package.json');
    throw firostError(
      'ABERLAAS_RELEASE_NPM_YARN_DIFFERENT_PUBLISHED_FILES',
      message.join('\n'),
    );
  },

  /**
   * Gets the list of files that would be published to npm for a given package
   * @param {object} packageData - Package data object containing filepath and content
   * @param {string} packageData.filepath - Path to the package.json file
   * @returns {string[]} Sorted array of file paths that would be published
   */
  async getNpmPublishedFiles(packageData) {
    const packageJsonPath = packageData.filepath;
    const packageJsonDir = path.dirname(packageJsonPath);
    const { stdout } = await __.firostRun('npm publish --dry-run --json', {
      cwd: packageJsonDir,
      stdout: false,
      stderr: false,
    });

    return _.chain(stdout)
      .thru(JSON.parse)
      .get('files')
      .map('path')
      .sort()
      .value();
  },
  /**
   * Gets the list of files that would be published to npm for a package using yarn
   * @param {object} packageData - Package data object containing file information
   * @param {string} packageData.filepath - Path to the package.json file
   * @returns {string[]} Sorted array of file paths that would be published
   */
  async getYarnPublishedFiles(packageData) {
    const packageJsonPath = packageData.filepath;
    const packageJsonDir = path.dirname(packageJsonPath);
    const { stdout } = await __.firostRun('yarn npm publish --dry-run --json', {
      cwd: packageJsonDir,
      stdout: false,
      stderr: false,
    });

    return _.chain(stdout)
      .split('\n')
      .last()
      .thru(JSON.parse)
      .get('files')
      .sort()
      .value();
  },

  firostRun,
};
