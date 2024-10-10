import current from '../main.js';

describe('aberlaas', () => {
  beforeEach(async () => {
    vi.spyOn(current, '__exit').mockReturnValue();
  });
  describe('run', () => {
    beforeEach(async () => {
      // Define INIT_CWD so we know where the script is called from
      vi.spyOn(current, '__env').mockImplementation((input) => {
        const envs = { INIT_CWD: '/workspace/' };
        return envs[input];
      });
    });
    it('should error when calling a command that does not exist', async () => {
      vi.spyOn(current, 'allCommands').mockReturnValue({});
      vi.spyOn(current, '__consoleError').mockReturnValue();

      const input = ['foo'];

      await current.run(input);

      expect(current.__exit).toHaveBeenCalledWith(1);
      expect(current.__consoleError).toHaveBeenCalledWith(
        expect.stringContaining('foo'),
      );
    });
    it('should call the run method on the specified command', async () => {
      const mockRun = vi.fn();
      vi.spyOn(current, 'allCommands').mockReturnValue({
        foo: { run: mockRun },
      });

      const input = ['foo'];

      await current.run(input);

      expect(mockRun).toHaveBeenCalled();
    });
    it('should call the method with parsed arguments', async () => {
      const mockRun = vi.fn();
      vi.spyOn(current, 'allCommands').mockReturnValue({
        foo: { run: mockRun },
      });

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
      vi.spyOn(current, 'allCommands').mockReturnValue({
        foo: { run: mockRun },
      });
      // Simulate script being called from a workspace
      vi.spyOn(current, '__env').mockImplementation((input) => {
        const envs = {
          ABERLAAS_CWD: '/workspace/lib/',
          INIT_CWD: '/workspace/',
        };
        return envs[input];
      });

      const input = ['foo', './foo.js', './__tests__/foo.js'];

      await current.run(input);

      expect(mockRun).toHaveBeenCalledWith({
        _: ['/workspace/lib/foo.js', '/workspace/lib/__tests__/foo.js'],
      });
    });
  });
});
