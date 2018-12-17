/* eslint-disable jest/no-jest-import */
import { _, chalk } from 'golgoth';
import path from 'path';
import firost from 'firost';
import inquirer from 'inquirer';
import helper from '../helper';
export default {
  /**
   * Yarn changes the npm_config_registry value, preventing npm publish to
   * actually work. We revert it to its default value for publishing to work
   * @returns {Void}
   **/
  fixNpmRegistry() {
    // eslint-disable-next-line camelcase
    process.env.npm_config_registry = 'https://registry.npmjs.org/';
  },

  async run(args) {
    this.fixNpmRegistry();

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = await firost.readJson(packageJsonPath);

    // We run the build command first, to be sure we have something to release
    const hasBuild = _.get(packageJson, 'scripts.build');
    if (hasBuild) {
      await firost.shell('yarn run build');
    }

    const options = _.concat(['-n'], args._);

    // Get the next version
    if (_.isEmpty(args._)) {
      // We display current version and ask for new one
      const currentVersion = _.get(packageJson, 'version');
      console.info(`Current version is ${chalk.green(currentVersion)}`);
      const { nextVersion } = await inquirer.prompt([
        { name: 'nextVersion', message: 'New version:' },
      ]);
      options.push(nextVersion);
    }

    // Normal release
    helper.spawn('release-it', options);
  },
};
