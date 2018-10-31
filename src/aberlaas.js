import minimist from 'minimist';
import chalk from 'chalk';
import lint from './lint';
export default {
  async run() {
    const args = minimist(process.argv.slice(2));
    const safelist = { lint };
    const command = args._[0];
    if (!safelist[command]) {
      process.exitCode = 1;
      console.error(`Unknown command ${chalk.red(command)}`);
      return;
    }

    await safelist[command].run(args);
  },
};
