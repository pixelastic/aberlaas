import { firostError, run as firostRun, which } from 'firost';
import { findHostPackageFiles, hostGitPath } from 'aberlaas-helper';
import ciInfo from 'ci-info';
import { fix as fixYml, run as runYml } from './yml.js';

export let __;

/**
 * Lint the file, both for yml issues and if possible circleci specifics
 * @returns {boolean} True on success
 */
export async function run() {
  const absoluteConfigPath = await __.getInputFile();
  const isRunningOnCircleCi = __.isRunningOnCircleCi();

  // Stop early if no config file, or if running on CircleCI
  if (!absoluteConfigPath || isRunningOnCircleCi) {
    return true;
  }

  // Lint as yml first
  await runYml([absoluteConfigPath]);

  // Stop early if no circleci bin available
  if (!(await __.hasCircleCiBin())) {
    return true;
  }

  // Validate the config
  try {
    await __.validateConfig();
  } catch (error) {
    const errorMessage = `CircleCI config error on ${__.configPath}\n${error.message}`;
    throw firostError('ABERLAAS_LINT_CIRCLECI', errorMessage);
  }

  return true;
}

/**
 * Autofix yml issues in file
 * @returns {boolean} True on success
 */
export async function fix() {
  const absoluteConfigPath = hostGitPath(__.configPath);
  // Fix yml issues
  await fixYml([absoluteConfigPath]);

  // Check for file errors so it still fails if file is invalid
  await run();
}

__ = {
  configPath: '.circleci/config.yml',

  /**
   * Find the CircleCI config file
   * @returns {Array} Array of files
   */
  async getInputFile() {
    const files = await findHostPackageFiles([__.configPath]);
    return files[0] || false;
  },

  /**
   * Check if the code is currently running on CircleCI
   * @returns {boolean} True if running on CircleCI, false otherwise
   */
  isRunningOnCircleCi() {
    return ciInfo.CIRCLE;
  },

  /**
   * Check if the circleci binary is available in the $PATH
   * @returns {boolean} True if available, false otherwise
   */
  async hasCircleCiBin() {
    const binary = await which('circleci');
    return !!binary;
  },

  /**
   * Validate the CircleCI config file.
   * @returns {boolean} True if valid, throws an error if not
   */
  async validateConfig() {
    await firostRun('circleci config validate', { stdout: false });
  },
};

export default {
  run,
  fix,
};
