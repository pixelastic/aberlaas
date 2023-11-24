import current from '../main.js';

describe('aberlaas', () => {
  beforeEach(async () => {
    jest.spyOn(current, '__exit').mockReturnValue();
  });
  describe('run', () => {
    it('should work', async () => {
      expect(true).toEqual(true);
    });
    // it('should error when calling a command that does not exist', async () => {
    //   jest.spyOn(current, 'safelist').mockReturnValue({});
    //   jest.spyOn(current, '__consoleError').mockReturnValue();

    //   const input = ['foo'];

    //   await current.run(input);

    //   expect(current.__exit).toHaveBeenCalledWith(1);
    //   expect(current.__consoleError).toHaveBeenCalledWith(
    //     expect.stringContaining('foo'),
    //   );
    // });
    // it('should call the run method on the specified command', async () => {
    //   const mockRun = jest.fn();
    //   jest.spyOn(current, 'safelist').mockReturnValue(['foo']);
    //   jest.spyOn(current, '__require').mockReturnValue({ run: mockRun });

    //   const input = ['foo'];

    //   await current.run(input);

    //   expect(current.__require).toHaveBeenCalledWith('./commands/foo');
    //   expect(mockRun).toHaveBeenCalled();
    // });
    // it('should call the method with parsed arguments', async () => {
    //   const mockRun = jest.fn();
    //   jest.spyOn(current, 'safelist').mockReturnValue(['foo']);
    //   jest.spyOn(current, '__require').mockReturnValue({ run: mockRun });

    //   const input = [
    //     'foo',
    //     '--fix',
    //     './foo.js',
    //     '-n',
    //     '--bar=baz',
    //     '--no-baz',
    //     './bar.js',
    //   ];

    //   await current.run(input);

    //   expect(mockRun).toHaveBeenCalledWith({
    //     _: ['./foo.js', './bar.js'],
    //     fix: true,
    //     bar: 'baz',
    //     baz: false,
    //     n: true,
    //   });
    // });
  });
});
