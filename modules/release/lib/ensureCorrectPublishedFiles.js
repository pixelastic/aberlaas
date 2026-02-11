import path from 'node:path';
import { _, pMap } from 'golgoth';
import { consoleInfo, firostError, run as firostRun } from 'firost';

export let __;

/**
 * Ensures that all packages in the release have the correct files that will be published
 * @param {object} releaseData - The release data containing package information
 * @param {Array} releaseData.allPackages - Array of all packages to be released
 * @returns {boolean} True when all packages have been verified
 */
export async function ensureCorrectPublishedFiles(releaseData) {
  const { allPackages } = releaseData;
  __.consoleInfo('Checking files to publish...');
  await pMap(allPackages, __.ensureSameFilesPublishedWithYarnOrNpm, {
    concurrency: 5,
  });
  return true;
}

__ = {
  /**
   * Ensures that npm and yarn publish the same files for a package
   * @param {object} packageData - The package data object containing package information
   * @returns {Promise<boolean>} True if npm and yarn publish the same files
   * @throws {Error} Throws an error if published files differ between npm and yarn
   */
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
      message.push(' - ' + onlyInNpm.join('\n - '));
      message.push('');
    }
    if (!_.isEmpty(onlyInYarn)) {
      message.push('Only in yarn:');
      message.push(' - ' + onlyInYarn.join('\n - '));
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

    return __.parseNpmPublishOutput(stdout);
  },

  /**
   * Parses npm publish command output to extract sorted file paths
   * @param {string} stdout - The JSON string output from npm publish command
   * @returns {string[]} Array of sorted file paths from the published package
   */
  parseNpmPublishOutput(stdout) {
    const parsedOutput = JSON.parse(stdout);

    // Output either contains directly an object with all info, or the object
    // itself is in a key with the name of the package (in case of workspaces)
    const keys = _.keys(parsedOutput);
    const root = keys.length === 1 ? parsedOutput[keys[0]] : parsedOutput;

    return _.chain(root).get('files').map('path').sort().value();
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

  consoleInfo,
  firostRun,
};
