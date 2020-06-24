const helper = require('../../../helper.js');
const current = require('../circleci.js');
const read = require('firost/lib/read');
const write = require('firost/lib/write');
const emptyDir = require('firost/lib/emptyDir');

describe('lint-circleci', () => {
  const tmpDirectory = './tmp/lint/circleci';
  beforeEach(async () => {
    jest.spyOn(current, 'isRunningOnCircleCi').mockReturnValue(false);
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should only get .circleci/config.yml', async () => {
      await write('foo: bar', helper.hostPath('.circleci/config.yml'));
      await write('foo: bar', helper.hostPath('.circleci/nope.yml'));
      await write('foo: bar', helper.hostPath('circleci.yml'));

      const actual = await current.getInputFiles();

      expect(actual).toEqual([helper.hostPath('.circleci/config.yml')]);
    });
  });
  describe('run', () => {
    describe('without circleci in the path', () => {
      beforeEach(async () => {
        jest.spyOn(current, 'hasCircleCiBin').mockReturnValue(false);
      });
      it('should return true if file is valid yml', async () => {
        await write('foo: bar', helper.hostPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toEqual(true);
      });
      it('should stop early if no file found', async () => {
        const actual = await current.run();

        expect(actual).toEqual(true);
      });
      it('should throw if yml is invalid', async () => {
        await write(
          'foo: bar\n bar: baz',
          helper.hostPath('.circleci/config.yml')
        );

        let actual = null;
        try {
          await current.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toEqual('YamlLintError');
        expect(actual).toHaveProperty('message');
      });
    });
    describe('with circleci in the path', () => {
      beforeEach(async () => {
        jest.spyOn(current, 'hasCircleCiBin').mockReturnValue(true);
      });
      it('should stop early if no file found', async () => {
        const actual = await current.run();

        expect(actual).toEqual(true);
      });
      it('should throw if yml is invalid', async () => {
        await write(
          'foo: bar\n bar: baz',
          helper.hostPath('.circleci/config.yml')
        );

        let actual = null;
        try {
          await current.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toEqual('YamlLintError');
        expect(actual).toHaveProperty('message');
      });
      it('should throw if config is invalid', async () => {
        jest.spyOn(current, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });
        await write('foo: invalid', helper.hostPath('.circleci/config.yml'));

        let actual = null;
        try {
          await current.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toEqual('CircleCiLintError');
        expect(actual).toHaveProperty(
          'message',
          expect.stringMatching('foo bar')
        );
      });
      it('should return true if file is valid yml and valid config', async () => {
        jest.spyOn(current, 'validateConfig').mockReturnValue(true);
        await write('foo: valid', helper.hostPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toEqual(true);
      });
      it('should always validate on CircleCI itself', async () => {
        jest.spyOn(current, 'isRunningOnCircleCi').mockReturnValue(true);
        jest.spyOn(current, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });

        await write('foo: valid', helper.hostPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toEqual(true);
      });
    });
  });
  describe('fix', () => {
    it('should fix yml issues', async () => {
      jest.spyOn(current, 'validateConfig').mockReturnValue(true);
      await write('    foo: "bar"', helper.hostPath('.circleci/config.yml'));

      await current.fix();

      const actual = await read(helper.hostPath('.circleci/config.yml'));

      expect(actual).toEqual("foo: 'bar'");
    });
    it('should throw an error if config still invalid', async () => {
      jest.spyOn(current, 'validateConfig').mockImplementation(() => {
        throw new Error('foo bar');
      });
      await write('    foo: bar', helper.hostPath('.circleci/config.yml'));

      let actual;
      try {
        await current.fix();
      } catch (err) {
        actual = err;
      }

      expect(actual.code).toEqual('CircleCiLintError');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching('foo bar')
      );
    });
    it('should do nothing if no file', async () => {
      let actual = null;
      try {
        await current.fix();
      } catch (err) {
        actual = err;
      }

      expect(actual).toEqual(null);
    });
  });
});
