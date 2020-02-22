const module = require('../migrate');
const helper = require('../../helper');
const emptyDir = require('firost/lib/emptyDir');
const read = require('firost/lib/read');
const write = require('firost/lib/write');

describe('migrate', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./tmp/migrate');
    jest.spyOn(module, '__consoleInfo').mockReturnValue();

    await emptyDir(helper.hostRoot());
  });
  describe('updateConfigFiles', () => {
    it('.eslintrc.js', async () => {
      const input = `/* eslint-disable import/no-commonjs */
module.exports = {
  extends: ['./node_modules/aberlaas/build/configs/eslint.js'],
};`;
      const expected = `/* eslint-disable import/no-commonjs */
module.exports = {
  extends: ['./node_modules/aberlaas/lib/configs/eslint.js'],
};`;
      const configFile = helper.hostPath(testName);
      await write(input, configFile);

      await module.updateConfigFiles();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('.huskyrc.js', async () => {
      const input = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/build/configs/husky.js');
module.exports = {
  ...config,
};`;
      const expected = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/lib/configs/husky.js');
module.exports = {
  ...config,
};`;
      const configFile = helper.hostPath(testName);
      await write(input, configFile);

      await module.updateConfigFiles();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('.lintstagedrc.js', async () => {
      const input = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/build/configs/lintstaged.js');
module.exports = {
  ...config,
};`;
      const expected = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/lib/configs/lintstaged.js');
module.exports = {
  ...config,
};`;
      const configFile = helper.hostPath(testName);
      await write(input, configFile);

      await module.updateConfigFiles();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('.prettierrc.js', async () => {
      const input = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/build/configs/prettier.js');
module.exports = {
  ...config,
};`;
      const expected = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/lib/configs/prettier.js');
module.exports = {
  ...config,
};`;
      const configFile = helper.hostPath(testName);
      await write(input, configFile);

      await module.updateConfigFiles();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('.stylelintrc.js', async () => {
      const input = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/build/configs/stylelint.js');
module.exports = {
  ...config,
};`;
      const expected = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/lib/configs/stylelint.js');
module.exports = {
  ...config,
};`;
      const configFile = helper.hostPath(testName);
      await write(input, configFile);

      await module.updateConfigFiles();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('babel.config.js', async () => {
      const input = `/* eslint-disable import/no-commonjs */
module.exports = {
  presets: ['aberlaas/build/configs/babel.js'],
};`;
      const expected = `/* eslint-disable import/no-commonjs */
module.exports = {
  presets: ['aberlaas/lib/configs/babel.js'],
};`;
      const configFile = helper.hostPath(testName);
      await write(input, configFile);

      await module.updateConfigFiles();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('jest.config.js', async () => {
      const input = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/build/configs/jest.js');
module.exports = {
  ...config,
};`;
      const expected = `/* eslint-disable import/no-commonjs */
const config = require('aberlaas/lib/configs/jest.js');
module.exports = {
  ...config,
};`;
      const configFile = helper.hostPath(testName);
      await write(input, configFile);

      await module.updateConfigFiles();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
  });
  describe('convertImportToRequire', () => {
    it("import foo from 'foo';", async () => {
      const expected = "const foo = require('foo');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertImportToRequire();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("import foo from './foo';", async () => {
      const expected = "const foo = require('./foo');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertImportToRequire();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("import { foo } from 'bar';", async () => {
      const expected = "const { foo } = require('bar');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertImportToRequire();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("import { foo, bar } from 'baz';", async () => {
      const expected = "const { foo, bar } = require('baz');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertImportToRequire();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("import { foo as bar } from 'baz';", async () => {
      const expected = "const { foo: bar } = require('baz');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertImportToRequire();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('should match multilines', async () => {
      const input = `import {
  searchBox,
  hits,
  pagination,
  refinementList,
} from 'instantsearch.js/es/widgets';`;
      const expected = `const {
  searchBox,
  hits,
  pagination,
  refinementList,
} = require('instantsearch.js/es/widgets');`;

      const configFile = helper.hostPath('lib/__tests__/foo.js');
      await write(input, configFile);

      await module.convertImportToRequire();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('should replace several lines', async () => {
      const input = `import foo from 'foo';
import bar from 'bar';`;
      const expected = `const foo = require('foo');
const bar = require('bar');`;

      const configFile = helper.hostPath('lib/__tests__/foo.js');
      await write(input, configFile);

      await module.convertImportToRequire();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('const expected = "import foo from \'foo\';"', async () => {
      const expected = testName;

      const configFile = helper.hostPath('lib/__tests__/foo.js');
      await write(testName, configFile);

      await module.convertImportToRequire();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    describe('in other directories', () => {
      it('in ./src', async () => {
        const input = "import foo from 'foo';";
        const expected = "const foo = require('foo');";

        const configFile = helper.hostPath('src/_data/foo.js');
        await write(input, configFile);

        await module.convertImportToRequire();

        const actual = await read(configFile);
        expect(actual).toEqual(expected);
      });
      it('in ./scripts', async () => {
        const input = "import foo from 'foo';";
        const expected = "const foo = require('foo');";

        const configFile = helper.hostPath('scripts/custom.js');
        await write(input, configFile);

        await module.convertImportToRequire();

        const actual = await read(configFile);
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('convertExportDefaultToModuleExports', () => {
    it('export default 42;', async () => {
      const expected = 'module.exports = 42;';

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertExportDefaultToModuleExports();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
  });
  describe('removeEslintNoCommonJsComment', () => {
    it('/* eslint-disable import/no-commonjs */', async () => {
      const expected = '';

      const configFile = helper.hostPath('.eslintrc.js');
      await write(testName, configFile);

      await module.removeEslintNoCommonJsComment();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it('const test = "/* eslint-disable import/no-commonjs */"', async () => {
      const expected = testName;

      const configFile = helper.hostPath('lib/__tests_/foo.js');
      await write(testName, configFile);

      await module.removeEslintNoCommonJsComment();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
  });
  // describe('splitNamedImportsInSeveralImports', () => {
  //   it('should split firost and golgoth', async () => {
  //     const input = `import { read, write } from 'firost';
  // import { _, pMap } from 'golgoth';`;
  //     const expected = `import read from 'firost/lib/read';
  // import write from 'firost/lib/write';
  // import _ from 'golgoth/lib/_';
  // import pMap from 'golgoth/lib/pMap';`;

  //     const configFile = helper.hostPath('lib/foo.js');
  //     await write(input, configFile);

  //     await module.splitNamedImportsInSeveralImports();

  //     const actual = await read(configFile);
  //     expect(actual).toEqual(expected);
  //   });
  // });
});
