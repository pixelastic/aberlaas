/* eslint-disable import/no-commonjs */
const callsites = require('callsites');
const path = require('path');
module.exports = {
  /**
   * Import a module. Replaces the classic "import foo from 'foo'" syntax as
   * Jest does not understand import syntax in dependencies.
   *
   * It will revert to a classical require() call for dependencies, but will use
   * esm for local files.
   *
   * @param {string} modulePath Module to load
   * @returns {*} Loaded module
   **/
  run(modulePath) {
    const callingFile = callsites()[1].getFileName();

    // Local modules are imported through esm
    if (modulePath.startsWith('.')) {
      const dirname = path.dirname(callingFile);
      const fullPath = path.resolve(dirname, modulePath);
      return this.esmRequire(fullPath);
    }

    // golgoth and firost es6 files are loaded through esm
    const regexpTooling = /^(golgoth|firost)\/lib/;
    if (regexpTooling.test(modulePath)) {
      return this.esmRequire(modulePath);
    }

    // Warning if loading firost directly
    if (modulePath === 'firost') {
      console.info(`
===== ABERLAAS WARNING =====

${callingFile}:
const firost = jestImport('firost');

This is slow. You should load only the parts of firost you need using:
const emptyDir = jestImport('firost/lib/emptyDir');
const read = jestImport('firost/lib/read');
const write = jestImport('firost/lib/write');

===== END OF WARNING =====
`);
      return require('firost/lib/esm');
    }

    return require(modulePath);
  },
  esmRequire(input) {
    if (!this.__esmRequire) {
      this.__esmRequire = require('esm')(module);
    }
    const required = this.__esmRequire(input);
    return required.default ? required.default : required;
  },
  __esmRequire: null,
};
