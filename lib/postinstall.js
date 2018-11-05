/* eslint-disable jest/no-jest-import */
import _ from 'lodash';
import path from 'path';
import firost from 'firost';
import build from './build';
export default {
  /**
   * All output is silenced when installing from a postinstall script, so we'll
   * write in /tmp instead
   * @param {String} input String to add
   * @returns {Void} Writes in a debug file
   **/
  async debug(input) {
    await firost.shell(`echo ${input} >> /tmp/aberlaas`);
  },
  rootDir() {
    return process.env.INIT_CWD;
  },
  /**
   * The postinstall script is trigger in two cases:
   * 1/ When aberlaas is installed as a dependency by someone
   * 2/ When developing aberlaas itself and running yarn install
   * This will return true if we're in case #2
   * @returns {Boolean} True if we're in dev mode, not installed as a dependency
   **/
  isLocalDev() {
    return _.endsWith(this.rootDir(), '/aberlaas');
  },
  async run() {
    // In dev, all we do is build aberlaas once
    if (this.isLocalDev()) {
      await build.run();
      return;
    }

    // When installed as a dependency, we add the config files
    await this.addTemplate('babelrc.js', '.babelrc.js');
    await this.addTemplate('eslintrc.js', '.eslintrc.js');
    await this.addTemplate('huskyrc.js', '.huskyrc.js');

    // TODO: Add Jest as a config file
    // Start husky as well
  },
  async addTemplate(source, destination) {
    await this.debug(this.rootDir());

    const absoluteDestination = path.join(this.rootDir(), destination);
    await this.debug(absoluteDestination);

    if (await firost.isFile(absoluteDestination)) {
      await this.debug('already there');
      return;
    }

    const absoluteSource = path.resolve('./templates', source);

    await firost.shell(`cp "${absoluteSource}" "${absoluteDestination}"`);
  },
};
