import { absolute, packageRoot, readJson } from 'firost';
import { __, run } from '../main.js';

describe('aberlaas', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'setEnv').mockReturnValue();
      vi.spyOn(__, 'exit').mockReturnValue();
      vi.spyOn(__, 'consoleError').mockReturnValue();
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
    });
    it('should error when calling a command that does not exist', async () => {
      vi.spyOn(__, 'getCommand').mockReturnValue(false);

      const input = ['foo'];

      await run(input);

      expect(__.exit).toHaveBeenCalledWith(1);
      expect(__.consoleError).toHaveBeenCalledWith(
        expect.stringContaining('foo'),
      );
    });
    it('should display the existing command when calling an unknown command', async () => {
      vi.spyOn(__, 'getCommand').mockReturnValue(false);

      const input = ['foo'];

      await run(input);

      expect(__.consoleInfo).toHaveBeenCalledWith('- setup');
      expect(__.consoleInfo).toHaveBeenCalledWith('- lint');
      expect(__.consoleInfo).toHaveBeenCalledWith('- test');
    });
    it('should call the run method on the specified command', async () => {
      const mockRun = vi.fn();
      vi.spyOn(__, 'getCommand').mockReturnValue({ run: mockRun });

      const input = ['foo'];

      await run(input);

      expect(mockRun).toHaveBeenCalled();
    });
    it('should call the method with parsed arguments', async () => {
      const mockRun = vi.fn();
      vi.spyOn(__, 'getCommand').mockReturnValue({ run: mockRun });

      const input = [
        'foo',
        '--fix',
        './foo.js',
        '-n',
        '--bar=baz',
        '--no-baz',
        './__tests__/foo.js',
      ];

      await run(input);

      expect(mockRun).toHaveBeenCalledWith({
        _: ['./foo.js', './__tests__/foo.js'],
        fix: true,
        bar: 'baz',
        baz: false,
        n: true,
      });
    });
    describe('ABERLAAS_VERSION', () => {
      it('should set it when command is init', async () => {
        const expected = (
          await readJson(absolute(packageRoot(), './package.json'))
        ).version;
        vi.spyOn(__, 'getCommand').mockReturnValue({ init: vi.fn() });
        const input = ['init'];

        await run(input);
        expect(__.setEnv).toHaveBeenCalledWith('ABERLAAS_VERSION', expected);
      });
      it('should not set it for other commands', async () => {
        vi.spyOn(__, 'getCommand').mockReturnValue({ test: vi.fn() });
        const input = ['test'];

        await run(input);
        expect(__.setEnv).not.toHaveBeenCalledWith(
          'ABERLAAS_VERSION',
          expect.anything(),
        );
      });
    });
  });
});
