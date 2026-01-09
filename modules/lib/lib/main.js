import minimist from 'minimist';
import {
  absolute,
  consoleError,
  consoleInfo,
  env,
  exit,
  firostImport,
  packageRoot,
  readJson,
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
    release: 'aberlaas-release',
    setup: 'aberlaas-setup',
    test: 'aberlaas-test',

    // Only used internally, for tests
    debug: 'aberlaas-helper',
  },
  async getCommand(commandName) {
    const commandModuleName = this.availableCommands[commandName];
    if (!commandModuleName) {
      return false;
    }
    return await firostImport(commandModuleName);
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

    try {
      // We need to set ABERLAAS_VERSION for "aberlaas init" as we need to
      // hardcode the currently used aberlaas version in the package.json and
      // there is no reliable way to get it from the init command
      if (commandName == 'init') {
        const packagePath = absolute(packageRoot(), './package.json');
        const packageContent = await readJson(packagePath);
        const packageVersion = packageContent.version;
        this.__setEnv('ABERLAAS_VERSION', packageVersion);
      }

      await command.run(args);
    } catch (err) {
      this.__consoleError(err.message);
      this.__exit(1);
    }
  },
  __env: env,
  __setEnv(key, value) {
    process.env[key] = value;
  },
  __consoleError: consoleError,
  __consoleInfo: consoleInfo,
  __exit: exit,
};
