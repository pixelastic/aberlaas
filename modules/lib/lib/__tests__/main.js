import { absolute, packageRoot, readJson } from 'firost';
import current from '../main.js';

describe('aberlaas', () => {
  describe('run', () => {
    beforeEach(async () => {
      // Define INIT_CWD so we know where the script is called from
      vi.spyOn(current, '__env').mockImplementation((input) => {
        const envs = { INIT_CWD: '/workspace/' };
        return envs[input];
      });
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
        _: ['/workspace/foo.js', '/workspace/__tests__/foo.js'],
        fix: true,
        bar: 'baz',
        baz: false,
        n: true,
      });
    });
    it('should expand absolute path even when called from a child workspace', async () => {
      const mockRun = vi.fn();
      vi.spyOn(current, 'getCommand').mockReturnValue({ run: mockRun });

      // Simulate script being called from a workspace
      vi.spyOn(current, '__env').mockImplementation((input) => {
        const envs = {
          ABERLAAS_CWD: '/workspace/lib/',
          INIT_CWD: '/',
        };
        return envs[input];
      });

      const input = ['foo', './foo.js', './__tests__/foo.js'];

      await current.run(input);

      expect(mockRun).toHaveBeenCalledWith({
        _: ['/workspace/lib/foo.js', '/workspace/lib/__tests__/foo.js'],
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
        expect(current.__env).toHaveBeenCalledWith(
          'ABERLAAS_VERSION',
          expected,
        );
      });
      it('should not set it for other commands', async () => {
        vi.spyOn(current, 'getCommand').mockReturnValue({ test: vi.fn() });
        const input = ['test'];

        await current.run(input);
        expect(current.__env).not.toHaveBeenCalledWith(
          'ABERLAAS_VERSION',
          expect.anything(),
        );
      });
    });
  });
});
