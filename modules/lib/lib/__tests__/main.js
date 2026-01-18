import { absolute, packageRoot, readJson } from 'firost';
import current from '../main.js';

describe('aberlaas', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__setEnv').mockReturnValue();
      vi.spyOn(current, '__exit').mockReturnValue();
      vi.spyOn(current, '__consoleError').mockReturnValue();
      vi.spyOn(current, '__consoleInfo').mockReturnValue();
    });
    it('should error when calling a command that does not exist', async () => {
      vi.spyOn(current, 'getCommand').mockReturnValue(false);

      const input = ['foo'];

      await current.run(input);

      expect(current.__exit).toHaveBeenCalledWith(1);
      expect(current.__consoleError).toHaveBeenCalledWith(
        expect.stringContaining('foo'),
      );
    });
    it('should display the existing command when calling an unknown command', async () => {
      vi.spyOn(current, 'getCommand').mockReturnValue(false);

      const input = ['foo'];

      await current.run(input);

      expect(current.__consoleInfo).toHaveBeenCalledWith('- setup');
      expect(current.__consoleInfo).toHaveBeenCalledWith('- lint');
      expect(current.__consoleInfo).toHaveBeenCalledWith('- test');
    });
    it('should call the run method on the specified command', async () => {
      const mockRun = vi.fn();
      vi.spyOn(current, 'getCommand').mockReturnValue({ run: mockRun });

      const input = ['foo'];

      await current.run(input);

      expect(mockRun).toHaveBeenCalled();
    });
    it('should call the method with parsed arguments', async () => {
      const mockRun = vi.fn();
      vi.spyOn(current, 'getCommand').mockReturnValue({ run: mockRun });

      const input = [
        'foo',
        '--fix',
        './foo.js',
        '-n',
        '--bar=baz',
        '--no-baz',
        './__tests__/foo.js',
      ];

      await current.run(input);

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
        vi.spyOn(current, 'getCommand').mockReturnValue({ init: vi.fn() });
        const input = ['init'];

        await current.run(input);
        expect(current.__setEnv).toHaveBeenCalledWith(
          'ABERLAAS_VERSION',
          expected,
        );
      });
      it('should not set it for other commands', async () => {
        vi.spyOn(current, 'getCommand').mockReturnValue({ test: vi.fn() });
        const input = ['test'];

        await current.run(input);
        expect(current.__setEnv).not.toHaveBeenCalledWith(
          'ABERLAAS_VERSION',
          expect.anything(),
        );
      });
    });
  });
});
