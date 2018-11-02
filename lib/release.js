/* eslint-disable jest/no-jest-import */
import _ from 'lodash';
import path from 'path';
import firost from 'firost';
import chalk from 'chalk';
import inquirer from 'inquirer';
import helper from './helper';
export default {
  async run() {
    const hostDir = process.cwd();
    const pkg = await firost.readJson(path.join(hostDir, 'package.json'));

    // We run the build command first, to be sure we have something to release
    const hasBuild = _.get(pkg, 'scripts.build');
    if (hasBuild) {
      await firost.shell('yarn run build');
    }

    // We display current version and ask for new one
    const currentVersion = _.get(pkg, 'version');
    console.info(`Current version is ${chalk.green(currentVersion)}`);
    const { nextVersion } = await inquirer.prompt([
      { name: 'nextVersion', message: 'New version:' },
    ]);

    // Yarn changes the npm_config_registry value, preventing npm publish to
    // actually work. We revert it to its default value for publishing to work
    // eslint-disable-next-line camelcase
    process.env.npm_config_registry = 'https://registry.npmjs.org/';

    helper.spawn('release-it', [nextVersion, '-n']);
  },
};
