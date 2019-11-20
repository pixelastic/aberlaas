/* eslint-disable jest/no-jest-import */
import { _, chalk } from 'golgoth';
import firost from 'firost';
import helper from '../helper';
import releaseIt from 'release-it';
export default {
  /**
   * Yarn changes the npm_config_registry value, preventing npm publish to
   * actually work. We revert it to its default value for publishing to work
   **/
  fixNpmRegistry() {
    // eslint-disable-next-line camelcase
    process.env.npm_config_registry = 'https://registry.npmjs.org/';
  },
  /**
   * Returns the content of the host package.json
   * @returns {object} The content of the host package.json
   **/
  async getHostPackageJson() {
    return await firost.readJson(helper.hostPath('package.json'));
  },
  /**
   * Get the release-it options to pass based on the script arguments
   * @param {object} args Arguments passed.
   * -n for a dry run
   * The increment type (major, minor, patch) can also be passed directly
   * @returns {object} The option argument to pass to release-it
   **/
  async getOptions(args = {}) {
    const options = {
      'non-interactive': true,
      plugins: {
        '@release-it/conventional-changelog': {
          preset: 'angular',
          infile: 'CHANGELOG.md',
        },
      },
    };

    // Allow passing -n for a dry-run
    if (args.n) {
      options['dry-run'] = true;
    }

    // Next version can be passed through args, or asked to the user
    let nextVersion = _.get(args, '_', [])[0];
    if (!nextVersion) {
      nextVersion = await this.askForNextVersion();
    }
    options.increment = nextVersion;

    return options;
  },
  /**
   * Ask the user for the next version number
   * @returns {string} The next version number
   **/
  async askForNextVersion() {
    const packageJson = await this.getHostPackageJson();
    const currentVersion = _.get(packageJson, 'version');
    helper.consoleInfo(`Current version is ${chalk.green(currentVersion)}`);
    return await firost.prompt('New version:');
  },
  /**
   * Release the host package.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success, false otherwise
   **/
  async run(cliArgs = {}) {
    const args = {
      test: true,
      build: true,
      ...cliArgs,
    };
    this.fixNpmRegistry();
    const options = await this.getOptions(cliArgs);

    // Build the module first
    try {
      helper.consoleInfo('Building...');
      await this.assertCommand('build', args.build);
    } catch (error) {
      helper.consoleError(error.message);
      process.exit(1);
    }

    let result;
    try {
      result = await this.__releaseIt(options);
    } catch (err) {
      helper.consoleError(
        'Package not released. Please fix the issues and try again'
      );
      process.exit(1);
      return false;
    }

    const packageJson = await this.getHostPackageJson();
    const packageName = _.get(packageJson, 'name');
    const packageVersion = _.get(result, 'version');
    helper.consoleInfo(
      `${chalk.orange(packageName)} ${packageVersion} released`
    );
    return true;
  },
  /**
   * Try to run an npm command and stop process if fails
   * Note: It will stop early if the shouldRun flag is set to false, or if the
   * command does not exist
   * @param {number} commandName Name of the command to run
   * @param {boolean} shouldRun If set to false, stop early
   * @returns {boolean} True on success
   **/
  async assertCommand(commandName, shouldRun = true) {
    if (!shouldRun) {
      return true;
    }
    const packageJson = await this.getHostPackageJson();
    if (!_.get(packageJson, `scripts.${commandName}`)) {
      return true;
    }

    try {
      await firost.shell(`yarn run ${commandName}`);
    } catch (err) {
      const errorName = _.toUpper(`ERROR_RELEASE_${commandName}`);
      throw helper.error(errorName, `Error with running ${commandName}`);
    }
    return true;
  },

  /**
   * Wrapper around releaseIt(), to make it easier to mock in tests
   * @param {object} options releaseIt options
   * @returns {object} releaseIt result
   **/
  async __releaseIt(options) {
    return await releaseIt(options);
  },
};
