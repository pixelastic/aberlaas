const helper = require('../../../helper.js');
const lint = require('../index.js');
const current = require('../css.js');
const read = require('firost/read');
const write = require('firost/write');
const emptyDir = require('firost/emptyDir');

describe('lint-css', () => {
  const tmpDirectory = './tmp/lint/css';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should get css files', async () => {
      await write('foo: bar', helper.hostPath('foo.css'));
      await write('foo: bar', helper.hostPath('deep/foo.css'));
      await write('foo: bar', helper.hostPath('nope.txt'));

      const actual = await current.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.css'));
      expect(actual).toContain(helper.hostPath('deep/foo.css'));
    });
  });
  describe('run', () => {
    it('should return true if all passes', async () => {
      await write('body { color: red; }', helper.hostPath('foo.css'));

      const actual = await current.run();

      expect(actual).toEqual(true);
    });
    it('stop early if no file found', async () => {
      jest.spyOn(current, '__run');
      const actual = await current.run();

      expect(actual).toEqual(true);
      expect(current.__run).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await write('body { color: red; }', helper.hostPath('good.css'));
      await write('body{color:       red;}', helper.hostPath('bad.css'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toEqual('ERROR_CSS_LINT');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write('body { color: red; }', helper.hostPath('good.css'));
      await write('body{color:       red;}', helper.hostPath('bad.css'));
      await write('   body{color:   red;}', helper.hostPath('deep/bad.css'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('bad.css'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bad.css'),
      );
    });
    it('should allow specifying the config file to use', async () => {
      await write('body { color: red; }', helper.hostPath('foo.css'));

      const actual = await current.run();

      expect(actual).toEqual(true);
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('body{color:       red;}', helper.hostPath('foo.css'));

      await current.fix();

      const actual = await read(helper.hostPath('foo.css'));

      expect(actual).toEqual('body {\n  color: red;\n}');
    });
    it('stop early if no file found', async () => {
      jest.spyOn(lint, 'fixWithPrettier');
      const actual = await current.run();

      expect(actual).toEqual(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
    it('should throw if fix works but linting fails', async () => {
      await write('body{}', helper.hostPath('foo.css'));
      let actual;
      try {
        await current.fix();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ERROR_CSS_LINT');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching('Unexpected empty block'),
      );
    });
  });
});
