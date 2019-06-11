/* eslint-disable jest/no-jest-import */
import jest from 'jest';
import path from 'path';
import { _ } from 'golgoth';
import firost from 'firost';
export default {
  async run(args) {
    // We test all files in ./lib by default, but can be overwritten by host
    const userFiles = args._;
    const defaultFiles = ['./lib'];
    const files = _.isEmpty(userFiles) ? defaultFiles : userFiles;

    // Which config file to use?
    // We take the one passed as --config in priority, otherwise fallback to
    // jest.config.js in the host, and finally jest.js in aberlaas.
    let configFile = args.config;
    if (!configFile) {
      const hostConfigFile = path.join(process.cwd(), 'jest.config.js');
      const aberlaasConfigFile = path.join(__dirname, '../configs/jest.js');
      const hostConfigFileExists = await firost.exists(hostConfigFile);
      configFile = hostConfigFileExists ? hostConfigFile : aberlaasConfigFile;
    }

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
