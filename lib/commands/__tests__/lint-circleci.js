import helper from '../../helper';
import module from '../lint-circleci';
import { write, read, emptyDir } from 'firost';

describe('lint-circleci', () => {
  const tmpDirectory = './tmp/lint/circleci';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should only get .circleci/config.yml', async () => {
      await write('foo: bar', helper.hostPath('.circleci/config.yml'));
      await write('foo: bar', helper.hostPath('.circleci/nope.yml'));
      await write('foo: bar', helper.hostPath('circleci.yml'));

      const actual = await module.getInputFiles();

      expect(actual).toEqual([helper.hostPath('.circleci/config.yml')]);
    });
  });
  describe('run', () => {
    describe('without circleci in the path', () => {
      beforeEach(async () => {
        jest.spyOn(module, 'isRunningOnCircleCi').mockReturnValue(false);
        jest.spyOn(module, 'hasCircleCiBin').mockReturnValue(false);
      });
      it('should return true if file is valid yml', async () => {
        await write('foo: bar', helper.hostPath('.circleci/config.yml'));

        const actual = await module.run();

        expect(actual).toEqual(true);
      });
      it('should stop early if no file found', async () => {
        const actual = await module.run();

        expect(actual).toEqual(true);
      });
      it('should throw if yml is invalid', async () => {
        await write(
          'foo: bar\n bar: baz',
          helper.hostPath('.circleci/config.yml')
        );

        let actual = null;
        try {
          await module.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toEqual('YamlLintError');
        expect(actual).toHaveProperty('message');
      });
    });
    describe('with circleci in the path', () => {
      beforeEach(async () => {
        jest.spyOn(module, 'hasCircleCiBin').mockReturnValue(true);
      });
      it('should stop early if no file found', async () => {
        const actual = await module.run();

        expect(actual).toEqual(true);
      });
      it('should throw if yml is invalid', async () => {
        await write(
          'foo: bar\n bar: baz',
          helper.hostPath('.circleci/config.yml')
        );

        let actual = null;
        try {
          await module.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toEqual('YamlLintError');
        expect(actual).toHaveProperty('message');
      });
      it('should throw if config is invalid', async () => {
        jest.spyOn(module, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });
        await write('foo: invalid', helper.hostPath('.circleci/config.yml'));

        let actual = null;
        try {
          await module.run();
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
        jest.spyOn(module, 'validateConfig').mockReturnValue(true);
        await write('foo: valid', helper.hostPath('.circleci/config.yml'));

        const actual = await module.run();

        expect(actual).toEqual(true);
      });
      it('should always validate on CircleCI itself', async () => {
        jest.spyOn(module, 'isRunningOnCircleCi').mockReturnValue(true);
        jest.spyOn(module, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });

        await write('foo: valid', helper.hostPath('.circleci/config.yml'));

        const actual = await module.run();

        expect(actual).toEqual(true);
      });
    });
  });
  describe('fix', () => {
    it('should fix yml issues', async () => {
      jest.spyOn(module, 'validateConfig').mockReturnValue(true);
      await write('    foo: "bar"', helper.hostPath('.circleci/config.yml'));

      await module.fix();

      const actual = await read(helper.hostPath('.circleci/config.yml'));

      expect(actual).toEqual("foo: 'bar'");
    });
    it('should throw an error if config still invalid', async () => {
      jest.spyOn(module, 'validateConfig').mockImplementation(() => {
        throw new Error('foo bar');
      });
      await write('    foo: "bar"', helper.hostPath('.circleci/config.yml'));

      let actual;
      try {
        await module.fix();
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
      await module.fix();
    });
  });
});
