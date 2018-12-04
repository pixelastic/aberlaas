/* eslint-disable jest/no-jest-import */
import _ from 'lodash';
import path from 'path';
import firost from 'firost';
import chalk from 'chalk';
import inquirer from 'inquirer';
import helper from '../helper';
export default {
  async run(args) {
    // Yarn changes the npm_config_registry value, preventing npm publish to
    // actually work. We revert it to its default value for publishing to work
    // eslint-disable-next-line camelcase
    process.env.npm_config_registry = 'https://registry.npmjs.org/';

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const pkg = await firost.readJson(packageJsonPath);

    // We run the build command first, to be sure we have something to release
    const hasBuild = _.get(pkg, 'scripts.build');
    if (hasBuild) {
      await firost.shell('yarn run build');
    }

    const options = _.concat(['-n'], args._);

    // Get the next version
    if (_.isEmpty(args._)) {
      // We display current version and ask for new one
      const currentVersion = _.get(pkg, 'version');
      console.info(`Current version is ${chalk.green(currentVersion)}`);
      const { nextVersion } = await inquirer.prompt([
        { name: 'nextVersion', message: 'New version:' },
      ]);
      options.push(nextVersion);
    }

    const newPackage = {
      ...pkg,
      private: false
    }
    await firost.writeJson(packageJsonPath, newPackage);

    console.info(options);
    return;


    helper.spawn('release-it', options);
  },
};
