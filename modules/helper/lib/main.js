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
  wrap,
} from 'firost';

// Exported wrapper object so we can mock indidividual methods in tests by
// spying on __ like this:
// import { __, methodName } from
// vi.spyOn(__, 'methodName').mockReturnValue()
export const __ = {
  /**
   * Absolute path of where the user was when running the initial "yarn run"
   * command that triggered aberlaas
   * @returns {string} Absolute path to working directory
   */
  hostWorkingDirectory() {
    // INIT_CWD is set by yarn as the directory where the yarn command is being
    // called
    return env('INIT_CWD') || process.cwd();
  },

  /**
   * Absolute path to the closest package root
   * @returns {string} Absolute path to closest package root
   */
  hostPackageRoot() {
    return packageRoot(__.hostWorkingDirectory());
  },

  /**
   * Return an absolute path to a file in the host package folder
   * @param {string} relativePath Relative path from the host package root
   * @returns {string} Absolute path to the host file
   */
  hostPackagePath(relativePath = '') {
    return path.resolve(__.hostPackageRoot(), relativePath);
  },

  /**
   * Find files in host package directory following glob patterns.
   * Will exclude some directories by default, and allow specifying only
   * specific file extensions
   * @param {Array} userPattern Patterns to match
   * @param {Array} safeExtensions Optional array of extensions to safelist. If
   * set, only files of this extensions will be returned
   * @returns {Array} Array of files matching the patterns
   */
  async findHostPackageFiles(userPattern, safeExtensions = []) {
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
  },

  /**
   * Return absolute path to the host dir
   * @returns {string} Absolute path to host dir
   */
  hostGitRoot() {
    return gitRoot(__.hostWorkingDirectory());
  },

  /**
   * Return an absolute path to a file in the host
   * @param {string} relativePath Relative path from the host root
   * @returns {string} Absolute path to the host file
   */
  hostGitPath(relativePath = '') {
    return path.resolve(__.hostGitRoot(), relativePath);
  },

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
  async getConfig(userConfigPath, hostConfigPath, baseConfig = {}) {
    // Taking value from --config in CLI in priority
    if (userConfigPath) {
      const configPath = __.hostGitPath(userConfigPath);
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
      const hostConfigFullPath = __.hostGitPath(hostConfigPath);
      if (await exists(hostConfigFullPath)) {
        return await firostImport(hostConfigFullPath);
      }
    }

    // Fallback on default config in aberlaas
    return baseConfig;
  },

  /**
   * Debug command, prints useful info about the host environment
   * Used in tests, to double check in real conditions, what the various paths
   * refer to
   */
  async run() {
    console.log(
      JSON.stringify(
        {
          hostWorkingDirectory: __.hostWorkingDirectory(),
          hostPackageRoot: __.hostPackageRoot(),
          hostGitRoot: __.hostGitRoot(),
        },
        null,
        2,
      ),
    );
  },
};

export const hostWorkingDirectory = wrap(__, 'hostWorkingDirectory');
export const hostPackageRoot = wrap(__, 'hostPackageRoot');
export const hostPackagePath = wrap(__, 'hostPackagePath');
export const findHostPackageFiles = wrap(__, 'findHostPackageFiles');
export const hostGitRoot = wrap(__, 'hostGitRoot');
export const hostGitPath = wrap(__, 'hostGitPath');
export const getConfig = wrap(__, 'getConfig');
export const run = wrap(__, 'run');
