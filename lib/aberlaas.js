import minimist from 'minimist';
import chalk from 'chalk';
import build from './build';
import install from './install';
import lint from './lint';
import postinstall from './postinstall';
import release from './release';
import test from './test';
export default {
  async run(rawArgs) {
    const args = minimist(rawArgs);
    const safelist = {
      build,
      install,
      lint,
      postinstall,
      release,
      test,
    };
    const command = args._[0];
    if (!safelist[command]) {
      process.exitCode = 1;
      console.error(`Unknown command ${chalk.red(command)}`);
      return;
    }

    await safelist[command].run(args);
  },
};
