/* eslint-disable jest/no-jest-import */
import { _, chalk } from 'golgoth';
import firost from 'firost';
import helper from '../helper';
import inquirer from 'inquirer';
import releaseIt from 'release-it';
export default {
  /**
   * Wrapper around console.info. Wrapping it makes it easier to mock in tests
   * and not pollute the display
   * @param {string} text Text to display
   **/
  output(text) {
    console.info(text);
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
    this.output(`Current version is ${chalk.green(currentVersion)}`);

    const response = await inquirer.prompt([
      { name: 'nextVersion', message: 'New version:' },
    ]);
    return _.get(response, 'nextVersion');
  },
  /**
   * Release the host package.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs = {}) {
    this.fixNpmRegistry();
    const packageJson = await this.getHostPackageJson();
    const options = await this.getOptions(cliArgs);

    // We always build before releasing
    if (_.get(packageJson, 'scripts.build')) {
      await firost.shell('yarn run build');
    }

    const result = await releaseIt(options);

    const packageName = _.get(packageJson, 'name');
    const packageVersion = _.get(result, 'version');
    this.output(`${chalk.orange(packageName)} ${packageVersion} released`);
  },
};
