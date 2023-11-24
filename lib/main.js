import minimist from 'minimist';
import consoleError from 'firost/consoleError.js';
import exit from 'firost/exit.js';
import _ from 'golgoth/lodash.js';
import helper from './helper.js';

export default {
  /**
   * List of allowed commands to run
   * @returns {Array} List of allowed commands to run
   **/
  safelist() {
    return [
      'ci',
      'compress',
      'init',
      'lint',
      'precommit',
      'readme',
      'release',
      'setup',
      'test',
    ];
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
    if (!_.includes(this.safelist(), commandName)) {
      this.__consoleError(`Unknown command ${commandName}`);
      this.__exit(1);
      return;
    }

    // Remove the initial method from args passed to the command
    args._ = _.drop(args._, 1);

    try {
      const command = await this.__require(
        `./commands/${commandName}/index.js`,
      );
      await command.run(args);
    } catch (err) {
      this.__consoleError(err.message);
      this.__exit(1);
    }
  },
  __consoleError: consoleError,
  __exit: exit,
  __require: helper.require,
};
