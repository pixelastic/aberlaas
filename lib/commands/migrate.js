import pMap from 'golgoth/lib/pMap';
import read from 'firost/lib/read';
import write from 'firost/lib/write';
import exists from 'firost/lib/exists';
import glob from 'firost/lib/glob';
import _ from 'golgoth/lib/lodash';
import helper from '../helper';

export default {
  async run() {
    await this.updateConfigFiles();
    await this.splitNamedImportsInSeveralImports();
    await this.useJestImportInTests();
  },
  /**
   * Update paths to config to use ./lib/ instead of ./build/
   **/
  async updateConfigFiles() {
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
};
