import path from 'node:path';
import { _ } from 'golgoth';
import { env, exists, firostImport, gitRoot, glob, packageRoot } from 'firost';

export default {
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
    return packageRoot(this.hostWorkingDirectory());
  },
  /**
   * Return an absolute path to a file in the host package folder
   * @param {string} relativePath Relative path from the host package root
   * @returns {string} Absolute path to the host file
   */
  hostPackagePath(relativePath = '') {
    return path.resolve(this.hostPackageRoot(), relativePath);
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
      cwd: this.hostPackageRoot(),
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
    return gitRoot(this.hostWorkingDirectory());
  },
  /**
   * Return an absolute path to a file in the host
   * @param {string} relativePath Relative path from the host root
   * @returns {string} Absolute path to the host file
   */
  hostGitPath(relativePath = '') {
    return path.resolve(this.hostGitRoot(), relativePath);
  },
  /**
   * Find files in host directory following glob patterns. Will exclude some
   * directories by default, and allow specifying only specific file extensions
   * @param {Array} userPattern Patterns to match
   * @param {Array} safeExtensions Optional array of extensions to safelist. If
   * set, only files of this extensions will be returned
   * @returns {Array} Array of files matching the patterns
   */
  // TODO: Remove once we have tests for findHostPackageFiles
  async findHostFiles(userPattern, safeExtensions = []) {
    const patterns = _.castArray(userPattern);
    // Making all path relative to the host
    const globs = _.map(patterns, (pattern) => {
      return this.hostGitPath(pattern);
    });

    // Exclude folders that shouldn't be included
    const blockedFolders = [
      'build',
      'dist',
      'fixtures',
      'node_modules',
      'tmp',
      'vendors',
      '.git',
      '.yarn',
      '.claude',
      '.next',
    ];
    _.each(blockedFolders, (blockedFolder) => {
      const deepFolder = `**/${blockedFolder}/**`;
      globs.push(`!${this.hostGitPath(deepFolder)}`);
    });

    // Expanding globs
    let allFiles = await glob(globs, { directories: false });

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
      return await firostImport(this.hostGitPath(userConfigPath));
    }

    // Checking for custom config in the host
    if (hostConfigPath) {
      const hostConfigFullPath = this.hostGitPath(hostConfigPath);
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
          hostWorkingDirectory: this.hostWorkingDirectory(),
          hostPackageRoot: this.hostPackageRoot(),
          hostGitRoot: this.hostGitRoot(),
        },
        null,
        2,
      ),
    );
  },
};
