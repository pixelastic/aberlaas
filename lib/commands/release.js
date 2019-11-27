/* eslint-disable jest/no-jest-import */
import { _, chalk } from 'golgoth';
import firost from 'firost';
import helper from '../helper';
import releaseIt from 'release-it';
export default {
  /**
   * Release the host package.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success, false otherwise
   **/
  async run(cliArgs = {}) {
    const options = {
      pull: true,
      test: true,
      build: true,
      n: false,
      ...cliArgs,
    };

    const releaseOptions = {
      ..._.pick(options, ['n']),
      nextVersion: _.chain(options)
        .get('_', [])
        .first()
        .value(),
    };

    try {
      if (options.pull) {
        firost.consoleInfo('git pull');
        await this.gitPull();
        firost.consoleSuccess('Branch pulled');
      }
      if (options.build) {
        firost.consoleInfo('yarn run build');
        await this.runBuild();
        firost.consoleSuccess('Module built');
      }
      if (options.test) {
        firost.consoleInfo('yarn run test');
        await this.runTest();
        firost.consoleSuccess('Tests passing');
      }

      await this.release(releaseOptions);
    } catch (err) {
      firost.consoleError(err.message);
      throw firost.error(
        'ERROR_RELEASE',
        'Package not released. Please fix the issues and try again'
      );
    }
  },
  async gitPull() {
    await firost.run('git pull');
  },
  async runBuild() {
    await helper.yarnRun('build');
  },
  async runTest() {
    await helper.yarnRun('test');
  },
  async release(options) {
    this.fixNpmRegistry();

    const releaseItOptions = await this.getReleaseItOptions(options);
    const result = await this.__releaseIt(releaseItOptions);

    const packageJson = await this.getHostPackageJson();
    const packageName = _.get(packageJson, 'name');
    const packageVersion = _.get(result, 'version');
    firost.consoleInfo(
      `${chalk.orange(packageName)} ${packageVersion} released`
    );
  },
  /**
   * Yarn changes the npm_config_registry value, preventing npm publish to
   * actually work. We revert it to its default value for publishing to work
   **/
  fixNpmRegistry() {
    // eslint-disable-next-line camelcase
    process.env.npm_config_registry = 'https://registry.npmjs.org/';
  },
  /**
   * Get the release-it options to pass based on the script arguments
   * @param {object} userOptions Arguments passed.
   * - n {boolean} True for a dry-run
   * - nextVersion {string} Optional next version (accepts patch, minor, major)
   * @returns {object} The option argument to pass to release-it
   */
  async getReleaseItOptions(userOptions = {}) {
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
    if (userOptions.n) {
      options['dry-run'] = true;
    }

    // Next version can be passed through args, or asked to the user
    let nextVersion = userOptions.nextVersion;
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
    firost.consoleInfo(`Current version is ${chalk.green(currentVersion)}`);
    return await firost.prompt('New version:');
  },
  /**
   * Returns the content of the host package.json
   * @returns {object} The content of the host package.json
   **/
  async getHostPackageJson() {
    return await firost.readJson(helper.hostPath('package.json'));
  },

  __releaseIt: releaseIt,
};
