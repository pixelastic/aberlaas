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
    await this.addTemplate('jest.config.js', 'jest.config.js');

    // Note: Because we added husky as a dependency (and not a devDependency),
    // its postinstall script will be called whenever someone install aberlaas,
    // thus hooks will correctly be copied. We don't have to do anything in that
    // regard.
  },
  /**
   * Copy a config template to the host
   * @param {String} source The name of the file in the ./templates dir
   * @param {String} destination The name of the file in the host
   * @returns {Void}
   **/
  async addTemplate(source, destination) {
    const absoluteDestination = path.join(this.rootDir(), destination);

    // Skip existing files
    if (await firost.isFile(absoluteDestination)) {
      return;
    }

    const absoluteSource = path.resolve('./templates', source);

    await firost.shell(`cp "${absoluteSource}" "${absoluteDestination}"`);
  },
};
