import minimist from 'minimist';
import { _ } from 'golgoth';
import firost from 'firost';
import build from './commands/build';
import init from './commands/init';
import lint from './commands/lint';
import release from './commands/release';
import migrate from './commands/migrate';
import test from './commands/test';
import ci from './commands/ci';
import precommit from './commands/precommit';

export default {
  /**
   * List of allowed commands to run
   * @returns {object} Hash of allowed commands
   **/
  safelist() {
    return {
      build,
      ci,
      init,
      lint,
      migrate,
      precommit,
      release,
      test,
    };
  },
  /**
   * Run the command specified on the command-line, along with specific
   * arguments
   * @param {Array} rawArgs CLI args
   **/
  async run(rawArgs) {
    const args = minimist(rawArgs, {
      boolean: true,
    });
    const commandName = args._[0];
    const command = this.safelist()[commandName];
    if (!command) {
      firost.consoleError(`Unknown command ${commandName}`);
      firost.exit(1);
      return;
    }

    // Remove the initial method from args passed to the command
    args._ = _.drop(args._, 1);

    try {
      await command.run(args);
    } catch (err) {
      firost.consoleError(err.message);
      firost.exit(1);
    }
  },
};
