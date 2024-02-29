import minimist from 'minimist';
import { consoleError, exit, env, absolute } from 'firost';
import { _ } from 'golgoth';
import path from 'path';
import commandCi from './commands/ci/index.js';
import commandCompress from './commands/compress/index.js';
import commandInit from './commands/init/index.js';
import commandPrecommit from './commands/precommit/index.js';
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
      setup: commandSetup,
      test: commandTest,
    };
  },
  /**
   * Converts a list of filepaths to absolute filepaths
   * Note: We want to be able to call commands like "aberlaas lint" from the
   * workspace root or any child workspace. We also want to be able to use
   * relative or absolute filepaths as arguments.
   * INIT_CWD is always set to the directory where the command was called, but
   * because scripts in child workspaces are actually calling scripts in the
   * root workspace, that value is overwritten. This is why we save the original
   * calling directory in ABERLAAS_CWD, and use that value if available.
   * @param {Array} filepaths Array of filepaths
   * @returns {Array} Array of absolute filepaths
   **/
  convertFilepathsToAbsolute(filepaths) {
    const callingDirectory =
      this.__env('ABERLAAS_CWD') || this.__env('INIT_CWD');
    return _.map(filepaths, (inputFilepath) => {
      const filepath =
        inputFilepath[0] == '/'
          ? inputFilepath
          : path.resolve(callingDirectory, inputFilepath);

      return absolute(filepath);
    });
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

    // Make all filepaths absolute
    args._ = this.convertFilepathsToAbsolute(args._);

    try {
      await command.run(args);
    } catch (err) {
      this.__consoleError(err.message);
      this.__exit(1);
    }
  },
  __env: env,
  __consoleError: consoleError,
  __exit: exit,
};
