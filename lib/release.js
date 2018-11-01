/* eslint-disable jest/no-jest-import */
import _ from 'lodash';
import path from 'path';
import firost from 'firost';
import chalk from 'chalk';
import inquirer from 'inquirer';
import releaseIt from 'release-it';
export default {
  async run(args) {
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
    const nextVersion = await inquirer.prompt([
      { name: 'nextVersion', message: 'New version:' },
    ]);

    try {
      await releaseIt();
    } catch (err) {
      console.error(chalk.red("✘ Release aborted."));
    }

    // We release-it
    //
  },
};
