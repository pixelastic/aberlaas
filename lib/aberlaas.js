import minimist from 'minimist';
import chalk from 'chalk';
import lint from './lint';
import build from './build';
import test from './test';
import release from './release';
export default {
  async run(rawArgs) {
    const args = minimist(rawArgs);
    const safelist = { lint, build, test, release };
    const command = args._[0];
    if (!safelist[command]) {
      process.exitCode = 1;
      console.error(`Unknown command ${chalk.red(command)}`);
      return;
    }

    await safelist[command].run(args);
  },
};
