import minimist from 'minimist';
import consoleError from 'firost/consoleError.js';
import exit from 'firost/exit.js';
import _ from 'golgoth/lodash.js';
import helper from './helper.js';
import commandCi from './commands/ci/index.js';
import commandCompress from './commands/compress/index.js';
import commandInit from './commands/init/index.js';
import commandPrecommit from './commands/precommit/index.js';
import commandRelease from './commands/release/index.js';
import commandTest from './commands/test/index.js';
import commandLint from './commands/lint/index.js';
import commandReadme from './commands/readme/index.js';
import commandSetup from './commands/setup/index.js';

export default {
  /**
   * List of allowed commands to run
   * @returns {Array} List of allowed commands to run
   **/
  allCommands() {
    return {
      ci: commandCi,
      compress: commandCompress,
      init: commandInit,
      lint: commandLint,
      precommit: commandPrecommit,
      readme: commandReadme,
      release: commandRelease,
      setup: commandSetup,
      test: commandTest,
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
    const command = this.allCommands()[commandName];
    if (!command) {
      this.__consoleError(`Unknown command ${commandName}`);
      this.__exit(1);
      return;
    }

    // Remove the initial method from args passed to the command
    args._ = _.drop(args._, 1);

    try {
      await command.run(args);
    } catch (err) {
      this.__consoleError(err.message);
      this.__exit(1);
    }
  },
  __consoleError: consoleError,
  __exit: exit,
};
