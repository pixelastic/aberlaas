import path from 'path';
import { _, chalk } from 'golgoth';
import firost from 'firost';
import stripAnsi from 'strip-ansi';
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
    return path.resolve(__dirname, '..');
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
   * Utility function to return errors containing a code (like fs-extra is
   * doing) and a message
   * @param {string} errorCode Error code
   * @param {string} errorMessage Error message
   * @returns {Error} new Error with .code and .message set
   **/
  error(errorCode, errorMessage) {
    const newError = new Error(errorMessage);
    newError.code = errorCode;
    newError.message = errorMessage;
    return newError;
  },
  /**
   * Write an information log message
   * @param {string} text Text to display
   **/
  consoleInfo(text) {
    console.info(chalk.blue('•'), text);
  },
  /**
   * Write a warning log message
   * @param {string} text Text to display
   **/
  consoleWarn(text) {
    console.info(chalk.yellow('⚠'), text);
  },
  /**
   * Write a success log message
   * @param {string} text Text to display
   **/
  consoleSuccess(text) {
    console.info(chalk.green('✔'), text);
  },
  /**
   * Write an error log message
   * @param {string} text Text to display
   **/
  consoleError(text) {
    console.info(chalk.red('✘'), text);
  },
  /**
   * Find files in host directory following glob patterns. Will exclude some
   * directories by default, and allow specifying only specific file extensions
   * @param {Array} patterns Array of glob patterns to match
   * @param {Array} safeExtensions Optional array of extensions to safelist. If
   * set, only files of this extensions will be returned
   * @returns {Array} Array of files matching the patterns
   **/
  async findHostFiles(patterns, safeExtensions = []) {
    // Making all path relative to the host
    const globs = _.map(patterns, pattern => {
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
    ];
    _.each(blockedFolders, blockedFolder => {
      const deepFolder = `**/${blockedFolder}/**`;
      globs.push(`!${this.hostPath(deepFolder)}`);
    });

    // Expanding globs
    let allFiles = await firost.glob(globs, { directories: false });

    if (_.isEmpty(safeExtensions)) {
      return allFiles;
    }

    // Keep only files of specified extensions
    allFiles = _.filter(allFiles, filepath => {
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
   * @param {string} hostPath Path to the host file, relative to the host
   * @param {string} aberlaasPath Path to the aberlaas default file, relative to the aberlaas directory
   * @returns {string} Path to config file
   **/
  async configFile(userPath, hostPath, aberlaasPath) {
    // Taking value from --config in CLI in priority
    if (userPath) {
      return this.hostPath(userPath);
    }

    // Checking for custom config in the host
    const configFromHost = this.hostPath(hostPath);
    if (await firost.exists(configFromHost)) {
      return configFromHost;
    }

    // Fallback on default config in aberlaas
    return this.aberlaasPath(aberlaasPath);
  },

  /**
   * Returns path to a specific binary.
   * Will use the local yarn version of the host if available, or the one
   * defined in aberlaas otherwise
   * @param {string} bin Binary name
   * @returns {string} Path to the binary
   **/
  async which(bin) {
    // Try to find the executable in the host
    const hostPath = await firost.shell(`yarn bin ${bin}`);
    if (hostPath) {
      return stripAnsi(hostPath);
    }

    // Try in Aberlaas
    const aberlaasPath = await firost.shell(
      `cd ${this.aberlaasRoot()} && yarn bin ${bin}`
    );
    if (aberlaasPath) {
      return stripAnsi(aberlaasPath);
    }

    return null;
  },
};
