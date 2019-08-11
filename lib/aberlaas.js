import minimist from 'minimist';
import { _, chalk } from 'golgoth';
import build from './commands/build';
import init from './commands/init';
import lint from './commands/lint';
import lintCss from './commands/lint-css';
import lintJs from './commands/lint-js';
import lintJson from './commands/lint-json';
import release from './commands/release';
import test from './commands/test';

export default {
  async run(rawArgs) {
    const args = minimist(rawArgs);
    const safelist = {
      build,
      init,
      install: init, // Backward compatibility
      lint,
      'lint:css': lintCss,
      'lint:js': lintJs,
      'lint:json': lintJson,
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
