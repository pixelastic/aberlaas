import callsites from 'callsites';
import path from 'path';
import _ from 'golgoth/lib/lodash';
export default {
  /**
   * Import a module, no matter if it uses import statements or not
   * It will basically require the module, and return its .default key if one is
   * available
   * Because this file itself is loaded through esm (in setupFileAfterEnv.js),
   * files it will load can use either import or require statements.
   * Additionally, it replace relative paths with absolute ones using to keep
   * requires relatives to the file calling them
   * @param {string} modulePath Module to load
   * @returns {*} Loaded module
   **/
  run(modulePath) {
    let fullPath = modulePath;

    // Relative module
    if (_.startsWith(modulePath, '.')) {
      const callingFile = callsites()[1].getFileName();
      const dirname = path.dirname(callingFile);
      fullPath = path.resolve(dirname, modulePath);
    }

    const module = require(fullPath);
    return _.get(module, 'default', module);
  },
};
