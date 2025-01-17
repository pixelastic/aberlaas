import path from 'path';
import minimist from 'minimist';
import {
  absolute,
  consoleError,
  consoleInfo,
  env,
  exit,
  firostImport,
} from 'firost';
import { _ } from 'golgoth';

export default {
  availableCommands: {
    ci: 'aberlaas-ci',
    compress: 'aberlaas-compress',
    init: 'aberlaas-init',
    lint: 'aberlaas-lint',
    precommit: 'aberlaas-precommit',
    readme: 'aberlaas-readme',
    setup: 'aberlaas-setup',
    test: 'aberlaas-test',
  },
  async getCommand(commandName) {
    const commandModuleName = this.availableCommands[commandName];
    if (!commandModuleName) {
      return false;
    }

    return await firostImport(commandModuleName);
  },
  /**
   * Converts a list of filepaths to absolute filepaths
   * Note: We want to be able to call commands like "aberlaas lint" from the
   * workspace root or any child workspace. We also want to be able to use
   * relative or absolute filepaths as arguments.
   * Yarn always sets INIT_CWD to the directory where the command was called,
   * but because scripts in child workspaces are actually calling scripts in the
   * root workspace, through the g: syntax, that value is overwritten. This is
   * why we save the original calling directory in ABERLAAS_CWD, in our
   * package.json script definitions and use that value if available.
   * @param {Array} filepaths Array of filepaths
   * @returns {Array} Array of absolute filepaths
   */
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
   */
  async run(rawArgs) {
    const args = minimist(rawArgs, {
      boolean: true,
    });

    const commandName = args._[0] || '';
    const command = await this.getCommand(commandName);

    if (!command) {
      this.__consoleError(`Unknown command ${commandName}`);
      this.__consoleInfo('Available commands:');
      _.each(this.availableCommands, (value, key) => {
        this.__consoleInfo(`- ${key}`);
      });
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
  __consoleInfo: consoleInfo,
  __exit: exit,
};
