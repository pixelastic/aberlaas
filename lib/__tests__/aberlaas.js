import module from '../aberlaas';
import firost from 'firost';

describe('aberlaas', () => {
  describe('run', () => {
    it('should error when calling a command that does not exist', async () => {
      jest.spyOn(module, 'safelist').mockReturnValue({});
      jest.spyOn(process, 'exit').mockReturnValue();
      jest.spyOn(firost, 'consoleError').mockReturnValue();

      const input = ['foo'];

      await module.run(input);

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(firost.consoleError).toHaveBeenCalledWith(
        expect.stringContaining('foo')
      );
    });
    it('should call the run method on the specified command', async () => {
      const mockRun = jest.fn();
      jest.spyOn(module, 'safelist').mockReturnValue({ foo: { run: mockRun } });

      const input = ['foo'];

      await module.run(input);

      expect(mockRun).toHaveBeenCalled();
    });
    it('should call the method with parsed arguments', async () => {
      const mockRun = jest.fn();
      jest.spyOn(module, 'safelist').mockReturnValue({ foo: { run: mockRun } });

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
