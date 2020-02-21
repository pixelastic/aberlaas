const module = require('../aberlaas');

describe('aberlaas', () => {
  beforeEach(async () => {
    jest.spyOn(module, '__exit').mockReturnValue();
  });
  describe('run', () => {
    it('should error when calling a command that does not exist', async () => {
      jest.spyOn(module, 'safelist').mockReturnValue({});
      jest.spyOn(module, '__consoleError').mockReturnValue();

      const input = ['foo'];

      await module.run(input);

      expect(module.__exit).toHaveBeenCalledWith(1);
      expect(module.__consoleError).toHaveBeenCalledWith(
        expect.stringContaining('foo')
      );
    });
    it('should call the run method on the specified command', async () => {
      const mockRun = jest.fn();
      jest.spyOn(module, 'safelist').mockReturnValue(['foo']);
      jest.spyOn(module, '__require').mockReturnValue({ run: mockRun });

      const input = ['foo'];

      await module.run(input);

      expect(module.__require).toHaveBeenCalledWith('./commands/foo');
      expect(mockRun).toHaveBeenCalled();
    });
    it('should call the method with parsed arguments', async () => {
      const mockRun = jest.fn();
      jest.spyOn(module, 'safelist').mockReturnValue(['foo']);
      jest.spyOn(module, '__require').mockReturnValue({ run: mockRun });

      const input = [
        'foo',
        '--fix',
        './foo.js',
        '-n',
        '--bar=baz',
        '--no-baz',
        './bar.js',
      ];

      await module.run(input);

      expect(mockRun).toHaveBeenCalledWith({
        _: ['./foo.js', './bar.js'],
        fix: true,
        bar: 'baz',
        baz: false,
        n: true,
      });
    });
  });
});
