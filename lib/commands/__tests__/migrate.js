import module from '../migrate';
import helper from '../../helper';
import emptyDir from 'firost/lib/emptyDir';
import read from 'firost/lib/read';
import write from 'firost/lib/write';

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
  });
});
