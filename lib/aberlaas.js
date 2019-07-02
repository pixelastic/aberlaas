import minimist from 'minimist';
import { _, chalk } from 'golgoth';
import build from './commands/build';
import install from './commands/install';
import lint from './commands/lint';
import lintJs from './commands/lint-js';
import release from './commands/release';
import test from './commands/test';

export default {
  async run(rawArgs) {
    const args = minimist(rawArgs);
    const safelist = {
      build,
      install,
      lint,
      'lint:js': lintJs,
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
