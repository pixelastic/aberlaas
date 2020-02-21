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
    await this.updateConfigFiles();

    await this.convertImportToRequire();
    await this.convertExportDefaultToModuleExports();
    await this.removeEslintNoCommonJsComment();
    // await this.useJestImportInTests();
    // await this.splitNamedImportsInSeveralImports();
  },
  /**
   * Update paths to config to use ./lib/ instead of ./build/
   **/
  async updateConfigFiles() {
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
  async convertImportToRequire() {
    const files = await glob(helper.hostPath('lib/**/*.js'));
    const regexp = /import (.*) from '(.*)';/gm;
    const replacer = function(line, rawImport, moduleName) {
      return `const ${rawImport} = require('${moduleName}');`;
    };

    await pMap(files, async filepath => {
      const content = await read(filepath);
      const newContent = _.replace(content, regexp, replacer);
      await write(newContent, filepath);
    });
  },
  async convertExportDefaultToModuleExports() {
    const files = await glob(helper.hostPath('lib/**/*.js'));
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
  async removeEslintNoCommonJsComment() {
    const files = await glob([
      helper.hostPath('lib/**/*.js'),
      helper.hostPath('*.js'),
    ]);
    const line = '/* eslint-disable import/no-commonjs */';

    await pMap(files, async filepath => {
      const content = await read(filepath);
      const newContent = _.replace(content, line, '');
      await write(newContent, filepath);
    });
  },
  /**
   * Replaces all import statements in test file to use jestImport instead.
   *
   * Before: import foo from 'foo';
   * After: const foo = jestImpor('foo')
   *
   * This is currently required as Jest does not work with esm, so using import
   * in Jest files will not work. There is no way currently (as of 2020-02-19)
   * to load esm globally for Jest, so we need to manually enable it for each
   * file we require. This is what jestImport is for
   **/
  async useJestImportInTests() {
    this.__consoleInfo(
      'Updating test files to use jestImport() instead of import'
    );
    const files = await glob(helper.hostPath('lib/**/__tests__/*.js'));
    const regexp = /^import (\w*) from '(.*)';$/gm;

    await pMap(files, async filepath => {
      const content = await read(filepath);
      const newContent = _.replace(
        content,
        regexp,
        "const $1 = jestImport('$2');"
      );
      await write(newContent, filepath);
    });
  },
  /**
   * Replaces named imports into imports loading only the required file
   *
   * Before: import { foo, bar } from 'baz';
   * After:
   *  import foo from 'baz/lib/foo';
   *  import bar from 'baz/lib/bar';
   *
   * This allow only loading the file that are used instead of loading
   * everything and only using some parts
   **/
  async splitNamedImportsInSeveralImports() {
    this.__consoleInfo(
      'Updating files to use specific imports for firost and golgoth'
    );
    const files = await glob(helper.hostPath('lib/**/*.js'));
    const regexp = /^import { (.*) } from '(firost|golgoth)';$/gm;
    const replacer = function(line, rawNamedImports, moduleName) {
      const namedImports = rawNamedImports.split(', ');
      const newLine = _.chain(namedImports)
        .map(namedImport => {
          return `import ${namedImport} from '${moduleName}/lib/${namedImport}';`;
        })
        .join('\n')
        .value();
      return newLine;
    };

    await pMap(files, async filepath => {
      const content = await read(filepath);
      const newContent = _.replace(content, regexp, replacer);
      await write(newContent, filepath);
    });
  },
  __consoleInfo: consoleInfo,
};
