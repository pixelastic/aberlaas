/* eslint-disable jest/no-jest-import */
import { _, chalk } from 'golgoth';
import firost from 'firost';
import path from 'path';
import inquirer from 'inquirer';
import releaseIt from 'release-it';
export default {
  output(message) {
    console.info(message);
  },
  /**
   * Yarn changes the npm_config_registry value, preventing npm publish to
   * actually work. We revert it to its default value for publishing to work
   * @returns {Void}
   **/
  fixNpmRegistry() {
    // eslint-disable-next-line camelcase
    process.env.npm_config_registry = 'https://registry.npmjs.org/';
  },

  /**
   * Returns the content of the host package.json
   * @returns {Object} The content of the host package.json
   **/
  async getHostPackageJson() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    return await firost.readJson(packageJsonPath);
  },

  /**
   * Ask the user for the next version number
   * @returns {String} The next version number
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
   * Get the release-it options to pass based on the script arguments
   * @param {Object} args Arguments passed.
   * -n for a dry run
   * The increment type (major, minor, patch) can also be passed directly
   * @returns {Object} The option argument to pass to release-it
   **/
  async getOptions(args = {}) {
    const options = {
      'non-interactive': true,
    };

    // Allow passing -n for a dry-run
    if (args.n) {
      _.set(options, 'dry-run', true);
    }

    // Passing the version directly as an argument
    let nextVersion = _.chain(args)
      .get('_', [])
      .first()
      .value();
    if (!nextVersion) {
      nextVersion = await this.askForNextVersion();
    }
    _.set(options, 'increment', nextVersion);

    return options;
  },

  /**
   * Release the host package.
   * @param {Object} args Arguments passed
   * @returns {Void}
   **/
  async run(args = {}) {
    this.fixNpmRegistry();
    const packageJson = await this.getHostPackageJson();

    const options = await this.getOptions(args);

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
