const pMap = require('golgoth/lib/pMap');
const read = require('firost/lib/read');
const write = require('firost/lib/write');
const exists = require('firost/lib/exists');
const consoleInfo = require('firost/lib/consoleInfo');
const glob = require('firost/lib/glob');
const _ = require('golgoth/lib/lodash');
const helper = require('../helper');

module.exports = {
  async run() {
    await this.replaceBuildWithLibInConfigFiles();

    await this.convertImportToRequire();
    await this.convertExportDefaultToModuleExports();
    await this.removeEslintNoCommonJsComment();
  },
  /**
   * Update paths to config to use ./lib/ instead of ./build/
   **/
  async replaceBuildWithLibInConfigFiles() {
    this.__consoleInfo(
      'Updating config files to target ./lib/ instead of ./build/'
    );
    const configFiles = [
      'babel.config.js',
      '.eslintrc.js',
      '.huskyrc.js',
      '.lintstagedrc.js',
      'jest.config.js',
      '.prettierrc.js',
      '.stylelintrc.js',
    ];

    await pMap(configFiles, async filename => {
      const filepath = helper.hostPath(filename);
      if (!(await exists(filepath))) {
        return;
      }
      const content = await read(filepath);
      const newContent = content.replace(
        'aberlaas/build/configs/',
        'aberlaas/lib/configs/'
      );
      await write(newContent, filepath);
    });
  },
  /**
   * Replaces all import statements to use require instead
   *
   * Before: import foo from 'foo';
   * After: const foo = require('foo')
   **/
  async convertImportToRequire() {
    const files = await glob(helper.hostPath('(lib|src|scripts)/**/*.js'));
    const regexp = /^import (.*?) from '(.*?)';/gms;
    const replacer = function(line, rawImport, moduleName) {
      const newImport = rawImport.replace(' as ', ': ');
      return `const ${newImport} = require('${moduleName}');`;
    };

    await pMap(files, async filepath => {
      const content = await read(filepath);
      const newContent = _.replace(content, regexp, replacer);
      await write(newContent, filepath);
    });
  },
  /**
   * Replaces all export default statement to module.exports
   *
   * Before: export default 42;
   * After: module.exports = 42;
   **/
  async convertExportDefaultToModuleExports() {
    const files = await glob(helper.hostPath('(lib|src|scripts)/**/*.js'));
    const regexp = /^export default (.*)/gm;
    const replacer = function(line, exportContent) {
      return `module.exports = ${exportContent}`;
    };

    await pMap(files, async filepath => {
      const content = await read(filepath);
      const newContent = _.replace(content, regexp, replacer);
      await write(newContent, filepath);
    });
  },
  /**
   * Removes eslint-disable import/no-commonjs statements
   *
   * Before: eslint-disable import/no-commonjs
   * After:
   **/
  async removeEslintNoCommonJsComment() {
    const files = await glob([
      helper.hostPath('lib/**/*.js'),
      helper.hostPath('*.js'),
    ]);
    const regexp = /^\/\* eslint-disable import\/no-commonjs \*\//gm;

    await pMap(files, async filepath => {
      const content = await read(filepath);
      const newContent = _.replace(content, regexp, '');
      await write(newContent, filepath);
    });
  },
  // TODO: Replace const { foo, bar } = require('firost|golgoth');
  // with const foo = require('firost/lib/foo');
  //
  // TODO: If files = ['build/'], making it as [lib/]
  __consoleInfo: consoleInfo,
};
