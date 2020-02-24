const module = require('../migrate');
const helper = require('../../helper');
const emptyDir = require('firost/lib/emptyDir');
const exist = require('firost/lib/exist');
const read = require('firost/lib/read');
const write = require('firost/lib/write');
const writeJson = require('firost/lib/writeJson');
const readJson = require('firost/lib/readJson');

describe('migrate', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./tmp/migrate');

    await emptyDir(helper.hostRoot());
  });
  describe('replaceBuildWithLibInConfigFiles', () => {
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

      await module.replaceBuildWithLibInConfigFiles();

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

      await module.replaceBuildWithLibInConfigFiles();

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

      await module.replaceBuildWithLibInConfigFiles();

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

      await module.replaceBuildWithLibInConfigFiles();

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

      await module.replaceBuildWithLibInConfigFiles();

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

      await module.replaceBuildWithLibInConfigFiles();

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

      await module.replaceBuildWithLibInConfigFiles();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
  });
  describe('replaceBuildInPackageFiles', () => {
    it('should replace build/ with lib/*.js in .files', async () => {
      await writeJson(
        { files: ['build/', 'data.json'] },
        helper.hostPath('package.json')
      );

      await module.replaceBuildInPackageFiles();

      const actual = await readJson(helper.hostPath('package.json'));
      expect(actual.files).toContain('lib/*.js');
      expect(actual.files).toContain('data.json');
      expect(actual.files).not.toContain('build');
    });
  });
  describe('replaceMainInBuildWithMainInLib', () => {
    it('should replace main: build/index.js with main: lib/main.js', async () => {
      const packagePath = helper.hostPath('package.json');
      const mainPathBefore = helper.hostPath('lib/index.js');
      const mainPathAfter = helper.hostPath('lib/main.js');

      await writeJson({ main: 'build/index.js' }, packagePath);
      await write('foo', mainPathBefore);

      await module.replaceMainInBuildWithMainInLib();

      expect(await readJson(packagePath)).toHaveProperty('main', 'lib/main.js');
      expect(await exist(mainPathBefore)).toEqual(false);
      expect(await exist(mainPathAfter)).toEqual(true);
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
      it('in ./lambda', async () => {
        const input = "import foo from 'foo';";
        const expected = "const foo = require('foo');";

        const configFile = helper.hostPath('lambda/custom.js');
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
      it('in the root', async () => {
        const input = "import foo from 'foo';";
        const expected = "const foo = require('foo');";

        const configFile = helper.hostPath('norska.config.js');
        await write(input, configFile);

        await module.convertImportToRequire();

        const actual = await read(configFile);
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('convertNamedRequiresToSeveralLines', () => {
    it("const { read } = require('firost');", async () => {
      const expected = "const read = require('firost/lib/read');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertNamedRequiresToSeveralLines();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("const { write, read } = require('firost');", async () => {
      const expected = `const read = require('firost/lib/read');
const write = require('firost/lib/write');`;

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertNamedRequiresToSeveralLines();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("const { pMap } = require('golgoth');", async () => {
      const expected = "const pMap = require('golgoth/lib/pMap');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertNamedRequiresToSeveralLines();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("const { _ } = require('golgoth');", async () => {
      const expected = "const _ = require('golgoth/lib/lodash');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertNamedRequiresToSeveralLines();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("const { foo } = require('bar');", async () => {
      const expected = testName;

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertNamedRequiresToSeveralLines();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
    });
    it("const { netlify } = require('callirhoe');", async () => {
      const expected = "const netlify = require('callirhoe/lib/netlify');";

      const configFile = helper.hostPath('lib/foo.js');
      await write(testName, configFile);

      await module.convertNamedRequiresToSeveralLines();

      const actual = await read(configFile);
      expect(actual).toEqual(expected);
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
});
