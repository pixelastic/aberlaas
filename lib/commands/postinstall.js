/* eslint-disable jest/no-jest-import */
import { _, firost } from 'golgoth';
import build from './build';
import install from './install';
export default {
  /**
   * All output is silenced when installing from a postinstall script, so we'll
   * write in /tmp instead when we need to debug
   * @param {String} input String to add
   * @returns {Void} Writes in a debug file
   **/
  async debug(input) {
    await firost.shell(`echo ${input} >> /tmp/aberlaas`);
  },
  /**
   * Where is the called from?
   * @returns {String} Path to the root
   **/
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
  /**
   * If installed a dependency, install aberlaas, otherwise build it locally
   * @returns {Void}
   **/
  async run() {
    // In dev, all we do is build aberlaas once
    // TODO: The above code shouldn't work. We cannot build aberlaas with
    // himself. The whole idea of postinstall might have to be moved in aberlaas
    // init, with a clear intent
    if (this.isLocalDev()) {
      // await build.run();
      return;
    }

    // await install.run();
    return;
  },
};
