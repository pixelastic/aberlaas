import minimist from 'minimist';
import { _, chalk } from 'golgoth';
import build from './commands/build';
import init from './commands/init';
import lint from './commands/lint';
import release from './commands/release';
import test from './commands/test';
import precommit from './commands/precommit';

export default {
  async run(rawArgs) {
    const args = minimist(rawArgs);
    const safelist = {
      build,
      init,
      precommit,
      lint,
      release,
      test,
    };
    const command = args._[0];
    if (!safelist[command]) {
      process.exitCode = 1;
      console.error(`Unknown command ${chalk.red(command)}`);
      return;
    }

    // Remove the initial method from args passed to the command
    args._ = _.drop(args._, 1);

    await safelist[command].run(args);
  },
};
