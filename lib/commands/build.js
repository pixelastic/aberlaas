import helper from '../helper';
import path from 'path';
import { firost, _ } from 'golgoth';

export default {
  /**
   * Get list of files to build.
   * Default is to read from ./lib, but if files are passed as CLI arguments,
   * then will take precedence
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} List of files to build
   **/
  inputFiles(cliArgs = {}) {
    return _.get(cliArgs, '_', ['./lib']);
  },
  async configFile(cliArgs = {}) {
    // Taking value from --config in CLI in priority
    const configFromCli = cliArgs.config;
    if (configFromCli) {
      return configFromCli;
    }

    // Checking for babel.config.js in the host
    const configFromHost = helper.hostPath('babel.config.js');
    if (await firost.exists(configFromHost)) {
      return configFromHost;
    }

    // Fallback on default config in aberlaas
    return path.join(helper.aberlaasPath('configs/babel.js'));
  },
  
  async run(args = {}) {
    const binary = await helper.which('babel');

    const inputFiles = this.inputFiles(args);
    const configFile = await this.configFile(args);

    // Output dir can be passed from the host, or we default to ./build
    const outDir = _.get(args, 'out-dir', './build');

    const defaultIgnore = [
      '**/__tests__',
      '**/*.test.js',
      '**/test-helper.js',
      '**/node_modules',
    ];
    const ignorePatterns = _.chain(defaultIgnore)
      .concat(args.ignore)
      .flatten()
      .compact()
      .value();

    await firost.mkdirp(outDir);

    const options = [...inputFiles];
    _.each(ignorePatterns, ignorePattern => {
      options.push('--ignore');
      options.push(ignorePattern);
    });
    options.push('--config-file');
    options.push(configFile);
    options.push('--out-dir');
    options.push(outDir);
    options.push('--verbose');

    // Watch mode
    if (args.watch) {
      options.push('--watch');
      options.push('--source-maps');
      options.push('inline');
    }

    helper.spawn(binary, options);
  },
};
