import execa from 'execa';
import path from 'path';
import { _ } from 'golgoth';
import firost from 'firost';
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
   * Return input files passed to the CLI as positional arguments, or fallback
   * to the default value provided.
   * This handles both the case where the input is not a CLI object, or the
   * positional arguments are empty
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {Array} defaultValue List of input files to use as default
   * @returns {Array} List of input files
   **/
  inputFromCli(cliArgs, defaultValue = []) {
    const inputFromCli = _.get(cliArgs, '_', defaultValue);
    // Input can still be empty when _ is passed as []
    if (_.isEmpty(inputFromCli)) {
      return defaultValue;
    }
    return inputFromCli;
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
   * Guess a path to a config file by first checking the cli arguments, then the
   * host folder and finally fallbacking on the aberlaas default
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {string} hostPath Path to the host file, relative to the host
   * @param {string} aberlaasPath Path to the aberlaas default file, relative to the aberlaas directory
   * @returns {string} Path to config file
   **/
  async configFile(cliArgs = {}, hostPath, aberlaasPath) {
    // Taking value from --config in CLI in priority
    const configFromCli = cliArgs.config;
    if (configFromCli) {
      return this.hostPath(configFromCli);
    }

    // Checking for babel.config.js in the host
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
      return hostPath;
    }

    // Try in Aberlaas
    const aberlaasPath = await firost.shell(
      `cd ${this.aberlaasRoot()} && yarn bin ${bin}`
    );
    if (aberlaasPath) {
      return aberlaasPath;
    }

    return null;
  },

  /**
   * Spawn a subprocess
   * @param {string} command Main command
   * @param {Array} args Arguments to pass to the command
   * @returns {object} Status object of the command call
   **/
  async spawn(command, args) {
    return await new Promise(resolve => {
      const running = execa(command, args);
      // As long as the command is running, we pipe the stdout (eg. --watch)
      running.stdout.pipe(process.stdout);
      // When the command is over, we finally end the promise
      running.then(resolve);
      // If the command fails, we display the error message and exit
      running.catch(error => {
        const errorMessage = _.get(error, 'stderr');
        console.info(errorMessage);
        // eslint-disable-next-line no-process-exit
        process.exit(error.code);
      });
    });
  },
};
