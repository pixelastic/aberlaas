import path from 'path';
import _ from 'golgoth/lodash.js';
import run from 'firost/run.js';
import glob from 'firost/glob.js';
import exists from 'firost/exists.js';
import findUp from 'find-up';
import * as url from 'url';

export default {
  /**
   * Return absolute path to the host dir
   * @returns {string} Absolute path to host dir
   **/
  hostRoot() {
    return process.cwd();
  },
  /**
   * Return an absolute path to a file in the host
   * @param {string} relativePath Relative path from the host root
   * @returns {string} Absolute path to the host file
   **/
  hostPath(relativePath = '') {
    return path.resolve(this.hostRoot(), relativePath);
  },
  /**
   * Return absolute path to the aberlaas directory
   * @returns {string} Absolute path to aberlaas dir
   **/
  aberlaasRoot() {
    return url.fileURLToPath(new URL('.', import.meta.url));
  },
  /**
   * Return an absolute path to a file in the aberlaas directory
   * @param {string} relativePath Relative path from the aberlaas root
   * @returns {string} Absolute path to the aberlaas file
   **/
  aberlaasPath(relativePath = '') {
    return path.resolve(this.aberlaasRoot(), relativePath);
  },
  /**
   * Find files in host directory following glob patterns. Will exclude some
   * directories by default, and allow specifying only specific file extensions
   * @param {Array} userPattern Patterns to match
   * @param {Array} safeExtensions Optional array of extensions to safelist. If
   * set, only files of this extensions will be returned
   * @returns {Array} Array of files matching the patterns
   **/
  async findHostFiles(userPattern, safeExtensions = []) {
    const patterns = _.castArray(userPattern);
    // Making all path relative to the host
    const globs = _.map(patterns, (pattern) => {
      return this.hostPath(pattern);
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
    ];
    _.each(blockedFolders, (blockedFolder) => {
      const deepFolder = `**/${blockedFolder}/**`;
      globs.push(`!${this.hostPath(deepFolder)}`);
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
   * Guess a path to a config file by first checking the specific path, then the
   * host folder and finally fallbacking on the aberlaas default
   * @param {string} userPath User specific config file
   * @param {string} upFile File to look for up the directory tree
   * @param {string} aberlaasPath Path to the aberlaas default file, relative to the aberlaas directory
   * @returns {string} Path to config file
   **/
  async configFile(userPath, upFile, aberlaasPath) {
    // Taking value from --config in CLI in priority
    if (userPath) {
      return this.hostPath(userPath);
    }

    // Checking for custom config in the host
    if (upFile) {
      const upPath = await findUp(upFile, {
        cwd: this.hostRoot(),
      });
      if (upPath) {
        return upPath;
      }
    }

    // Fallback on default config in aberlaas
    return this.aberlaasPath(aberlaasPath);
  },

  /**
   * Returns path to a specific binary.
   *
   * Knowing the path to a specific binary is not trivial:
   * - Aberlaas dependencies should be in node_modules/aberlaas/.bin
   * - Host dependencies should be in node_modules/.bin
   *
   * There are some special cases:
   * - If both aberlaas and host use the same dependency version, it will be
   *   hoisted to the host
   * - If they use different versions, priority should be given to the one in
   *   aberlaas
   * - Mono-repo setup and yarn link will move dependencies out of
   *   node_modules/.bin
   *
   * For those reasons, we defer to running yarn bin to get the exact path to
   * the binary, and check in order of importance in aberlaas first, and then in
   * the host
   *
   * @param {string} bin Binary name
   * @returns {string} Path to the binary
   **/
  async which(bin) {
    const binaryPathSuffix = `./node_modules/.bin/${bin}`;
    const pathsToTest = [
      this.aberlaasPath(binaryPathSuffix),
      this.hostPath(binaryPathSuffix),
    ];

    for (const binaryPath of pathsToTest) {
      if (await exists(binaryPath)) {
        return binaryPath;
      }
    }
    return false;
  },
  /**
   * Run a specific script through yarn run
   * @param {string} scriptName Name of the script to run
   * @returns {object} Result of the run, including .sterr and .stdout
   **/
  async yarnRun(scriptName) {
    return await run(`yarn run ${scriptName}`, { cwd: this.hostRoot() });
  },
};
