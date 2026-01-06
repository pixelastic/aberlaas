import path from 'node:path';
import { _ } from 'golgoth';
import {
  env,
  exists,
  firostError,
  firostImport,
  gitRoot,
  glob,
  packageRoot,
} from 'firost';

// Internal and mockable methods
export const __ = {
  hostWorkingDirectory,
  hostPackageRoot,
  hostGitRoot,
};

/**
 * Absolute path of where the user was when running the initial "yarn run"
 * command that triggered aberlaas
 * @returns {string} Absolute path to working directory
 */
export function hostWorkingDirectory() {
  // INIT_CWD is set by yarn as the directory where the yarn command is being
  // called
  return env('INIT_CWD') || process.cwd();
}

/**
 * Absolute path to the closest package root
 * @returns {string} Absolute path to closest package root
 */
export function hostPackageRoot() {
  return packageRoot(hostWorkingDirectory());
}

/**
 * Return an absolute path to a file in the host package folder
 * @param {string} relativePath Relative path from the host package root
 * @returns {string} Absolute path to the host file
 */
export function hostPackagePath(relativePath = '') {
  return path.resolve(__.hostPackageRoot(), relativePath);
}

/**
 * Find files in host package directory following glob patterns.
 * Will exclude some directories by default, and allow specifying only
 * specific file extensions
 * @param {Array} userPattern Patterns to match
 * @param {Array} safeExtensions Optional array of extensions to safelist. If
 * set, only files of this extensions will be returned
 * @returns {Array} Array of files matching the patterns
 */
export async function findHostPackageFiles(userPattern, safeExtensions = []) {
  const patterns = [
    ..._.castArray(userPattern),
    // Exclude folders that shouldn't be included
    '!**/build/**',
    '!**/dist/**',
    '!**/fixtures/**',
    '!**/node_modules/**',
    '!**/tmp/**',
    '!**/vendors/**',
    '!**/.claude/**',
    '!**/.git/**',
    '!**/.next/**',
    '!**/.turbo/**',
    '!**/.yarn/**',
  ];

  // Expanding globs
  let allFiles = await glob(patterns, {
    directories: false,
    cwd: __.hostPackageRoot(),
  });

  if (_.isEmpty(safeExtensions)) {
    return allFiles;
  }

  // Keep only files of specified extensions
  allFiles = _.filter(allFiles, (filepath) => {
    const extension = path.extname(filepath);
    const extensionWithoutDot = _.replace(extension, '.', '');
    return (
      _.includes(safeExtensions, extension) ||
      _.includes(safeExtensions, extensionWithoutDot)
    );
  });

  return allFiles;
}

/**
 * Return absolute path to the host dir
 * @returns {string} Absolute path to host dir
 */
export function hostGitRoot() {
  return gitRoot(hostWorkingDirectory());
}

/**
 * Return an absolute path to a file in the host
 * @param {string} relativePath Relative path from the host root
 * @returns {string} Absolute path to the host file
 */
export function hostGitPath(relativePath = '') {
  return path.resolve(__.hostGitRoot(), relativePath);
}

/**
 * Return a config object for a specific tool.
 * Will first check for the user supplied path to the config file, then
 * fallback to the default config file in the host, and finally fallback to
 * the default base config in the aberlaas module.
 * @param {string} userConfigPath User specified config file, relative to the host root
 * @param {string} hostConfigPath Default host config path, relative to the host root
 * @param {object} baseConfig Base aberlaas config, final fallback
 * @returns {object} Config object
 */
export async function getConfig(
  userConfigPath,
  hostConfigPath,
  baseConfig = {},
) {
  // Taking value from --config in CLI in priority
  if (userConfigPath) {
    const configPath = hostGitPath(userConfigPath);
    if (!(await exists(configPath))) {
      throw firostError(
        'ABERLAAS_HELPER_GET_CONFIG_USER_PROVIDED_NOT_FOUND',
        `Provided config file (${userConfigPath}) not found`,
      );
    }

    return await firostImport(configPath);
  }

  // Checking for custom config in the host
  if (hostConfigPath) {
    const hostConfigFullPath = hostGitPath(hostConfigPath);
    if (await exists(hostConfigFullPath)) {
      return await firostImport(hostConfigFullPath);
    }
  }

  // Fallback on default config in aberlaas
  return baseConfig;
}

/**
 * Debug command, prints useful info about the host environment
 * Used in tests, to double check in real conditions, what the various paths
 * refer to
 */
export async function run() {
  console.log(
    JSON.stringify(
      {
        hostWorkingDirectory: hostWorkingDirectory(),
        hostPackageRoot: hostPackageRoot(),
        hostGitRoot: hostGitRoot(),
      },
      null,
      2,
    ),
  );
}
