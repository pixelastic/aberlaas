const helper = jestImport('../../helper');
const lint = jestImport('../lint');
const module = jestImport('../lint-yml');
const read = jestImport('firost/lib/read');
const write = jestImport('firost/lib/write');
const emptyDir = jestImport('firost/lib/emptyDir');

describe('lint-yml', () => {
  const tmpDirectory = './tmp/lint/yml';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should get yml and yaml', async () => {
      await write('foo: bar', helper.hostPath('foo.yml'));
      await write('foo: bar', helper.hostPath('deep/foo.yaml'));
      await write('foo: bar', helper.hostPath('nope.txt'));

      const actual = await module.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.yml'));
      expect(actual).toContain(helper.hostPath('deep/foo.yaml'));
    });
  });
  describe('run', () => {
    it('should return true if all passes', async () => {
      await write('foo: bar', helper.hostPath('foo.yml'));

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
    it('stop early if no file found', async () => {
      jest.spyOn(module, '__lint');
      const actual = await module.run();

      expect(actual).toEqual(true);
      expect(module.__lint).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await write('foo: bar', helper.hostPath('good.yml'));
      await write('foo: ****', helper.hostPath('bad.yml'));

      let actual = null;
      try {
        await module.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toEqual('YamlLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write('foo: bar', helper.hostPath('good.yml'));
      await write('foo: ****', helper.hostPath('foo.yml'));
      await write('foo: ****', helper.hostPath('deep/bar.yaml'));

      let actual = null;
      try {
        await module.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('foo.yml')
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bar.yaml')
      );
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('    foo: "bar"', helper.hostPath('foo.yml'));

      await module.fix();

      const actual = await read(helper.hostPath('foo.yml'));

      expect(actual).toEqual("foo: 'bar'");
    });
    it('stop early if no file found', async () => {
      jest.spyOn(lint, 'fixWithPrettier');
      const actual = await module.run();

      expect(actual).toEqual(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
  });
});