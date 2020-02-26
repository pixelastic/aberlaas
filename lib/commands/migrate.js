const exists = require('firost/lib/exists');
const glob = require('firost/lib/glob');
const helper = require('../helper');
const move = require('firost/lib/move');
const pMap = require('golgoth/lib/pMap');
const readJson = require('firost/lib/readJson');
const read = require('firost/lib/read');
const writeJson = require('firost/lib/writeJson');
const write = require('firost/lib/write');
const _ = require('golgoth/lib/lodash');

module.exports = {
  async run() {
    await this.replaceBuildWithLibInConfigFiles();
    await this.replaceBuildInPackageFiles();
    await this.replaceMainInBuildWithMainInLib();

    await this.convertImportToRequire();
    await this.convertNamedRequiresToSeveralLines();
    await this.convertExportDefaultToModuleExports();
    await this.removeEslintNoCommonJsComment();
  },
  async jsFilesToConvert() {
    return await glob([
      helper.hostPath('(lib|src|scripts|lambda)/**/*.js'),
      helper.hostPath('*.js'),
    ]);
  },
  /**
   * Update paths to config to use ./lib/ instead of ./build/
   **/
  async replaceBuildWithLibInConfigFiles() {
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
   * Update released files to include lib instead of build
   *
   * Before: .files: ['build/']
   * After: .files: ['lib/*.js']
   **/
  async replaceBuildInPackageFiles() {
    const packagePath = helper.hostPath('package.json');
    const packageContent = await readJson(packagePath);

    const files = packageContent.files;
    if (!files) {
      return;
    }

    packageContent.files = _.map(files, file => {
      return file === 'build/' ? 'lib/*.js' : file;
    });

    await writeJson(packageContent, packagePath);
  },
  /**
   * Replace main key in package.json
   *
   * Before: .main: build/index.js
   * After: .main: lib/main.js
   **/
  async replaceMainInBuildWithMainInLib() {
    const packagePath = helper.hostPath('package.json');
    const packageContent = await readJson(packagePath);

    const main = _.get(packageContent, 'main', '');
    const mainIsInBuild = main.startsWith('build/');
    if (!main || !mainIsInBuild) {
      return;
    }

    const newMain = 'lib/main.js';
    packageContent.main = newMain;
    await writeJson(packageContent, packagePath);

    const mainLibPath = main.replace('build', 'lib');
    const absoluteMainLibPath = helper.hostPath(mainLibPath);
    if (await exists(absoluteMainLibPath)) {
      await move(absoluteMainLibPath, helper.hostPath(newMain));
    }
  },
  /**
   * Replaces all import statements to use require instead
   *
   * Before: import foo from 'foo';
   * After: const foo = require('foo')
   **/
  async convertImportToRequire() {
    const files = await this.jsFilesToConvert();
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
   * Replaces all { named requires } in my tooling with their own requires
   *
   * Before: const { read, write } = require('firost';
   * After:
   *  const read = require('firost/lib/read');
   *  const write = require('firost/lib/write');
   **/
  async convertNamedRequiresToSeveralLines() {
    const files = await this.jsFilesToConvert();
    const regexp = /^const {(.*)} = require\('(firost|golgoth|callirhoe)'\);/gm;
    const replacer = function(line, rawImport, moduleName) {
      return _.chain(rawImport)
        .split(',')
        .map(_.trim)
        .compact()
        .map(importName => {
          let importBasename = importName;
          if (importName === '_') {
            importBasename = 'lodash';
          }
          return `const ${importName} = require('${moduleName}/lib/${importBasename}');`;
        })
        .sort()
        .join('\n')
        .value();
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
    const files = await this.jsFilesToConvert();
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
};
