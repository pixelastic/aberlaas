/* eslint-disable jest/no-jest-import */
import _ from 'lodash';
import path from 'path';
import jest from 'jest';
export default {
  async run(args) {
    // We test all files in ./lib by default, but can be overwritten by host
    const userFiles = _.drop(args._, 1);
    const defaultFiles = ['./lib'];
    const files = _.isEmpty(userFiles) ? defaultFiles : userFiles;

    // Which config file to use?
    // We take the one passed as --config in priority, otherwise fallback to
    // jest.config.js in the host, and finally jest.js in aberlaas.
    const aberlaasConfigFile = path.join(__dirname, '..', 'configs', 'jest.js');
    const hostConfigFile = path.join(process.cwd(), 'jest.config.js');
    const configFile = args.config || hostConfigFile || aberlaasConfigFile;

    const options = [
      ...files,
      '--config',
      configFile,
      '--no-cache',
      '--passWithNoTests',
    ];

    if (args.watch) {
      options.push('--watch');
      options.push('--no-watchman');
    }

    return await jest.run(options);
  },
};
