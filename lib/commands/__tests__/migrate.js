const module = jestImport('../migrate');
const helper = jestImport('../../helper');
const emptyDir = jestImport('firost/lib/emptyDir');
const read = jestImport('firost/lib/read');
const write = jestImport('firost/lib/write');

describe('migrate', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./tmp/migrate');

    await emptyDir(helper.hostRoot());
  });
  describe('v0 to v1', () => {
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
    describe('useJestImportInTests', () => {
      it('should replace all imports', async () => {
        const input = `import foo from '../foo';
import bar from '../../bar';
import baz from 'firost/lib/baz';`;
        const expected = `const foo = jestImport('../foo');
const bar = jestImport('../../bar');
const baz = jestImport('firost/lib/baz');`;

        const configFile = helper.hostPath('lib/subdir/__tests__/foo.js');
        await write(input, configFile);

        await module.useJestImportInTests();

        const actual = await read(configFile);
        expect(actual).toEqual(expected);
      });
      it('should not replace in comments', async () => {
        const input = "// We discuss import foo from '../foo';";
        const expected = input;

        const configFile = helper.hostPath('lib/subdir/__tests__/foo.js');
        await write(input, configFile);

        await module.useJestImportInTests();

        const actual = await read(configFile);
        expect(actual).toEqual(expected);
      });
      it('should not replace in variables', async () => {
        const input = 'const expected = "import foo from \'../foo\';"';
        const expected = input;

        const configFile = helper.hostPath('lib/subdir/__tests__/foo.js');
        await write(input, configFile);

        await module.useJestImportInTests();

        const actual = await read(configFile);
        expect(actual).toEqual(expected);
      });
    });
  });
});
