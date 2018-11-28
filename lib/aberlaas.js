import minimist from 'minimist';
import chalk from 'chalk';
import build from './commands/build';
import install from './commands/install';
import lint from './commands/lint';
import postinstall from './commands/postinstall';
import release from './commands/release';
import test from './commands/test';
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
