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

    // If host supplied a config file, we use it. Otherwise we default to the
    // one in aberlaas
    const defaultConfigFile = path.join(__dirname, '..', 'jest.js');
    const configFile = args.config || defaultConfigFile;

    const options = [...files, '--config', configFile, '--no-cache'];

    if (args.watch) {
      options.push('--watch');
      options.push('--no-watchman');
    }

    return await jest.run(options);
  },
};
