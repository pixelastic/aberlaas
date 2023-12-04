import current from '../index.js';
import helper from '../../../helper.js';
import write from 'firost/write.js';

// TODO: xit/xdescribe
describe('test', () => {
  // const tmpDirectory = './tmp/test';
  // beforeEach(() => {
  //   vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
  // });
  // xdescribe('jestCliArguments', () => {
  //   it('should run jest on the correct test inputs', async () => {
  //     const input = { _: ['foo.js', 'bar.js'] };
  //     const actual = await current.jestCliArguments(input);

  //     expect(actual[0]).toBe('foo.js');
  //     expect(actual[1]).toBe('bar.js');
  //   });
  //   it('should allow specifying the config file', async () => {
  //     const input = { config: 'custom.jest.config.js' };
  //     const actual = (await current.jestCliArguments(input)).join(' ');

  //     expect(actual).toContain(
  //       `--config ${helper.hostPath('custom.jest.config.js')}`,
  //     );
  //   });
  //   it('should use project config file if none specified', async () => {
  //     await write('', helper.hostPath('jest.config.js'));
  //     const input = {};
  //     const actual = (await current.jestCliArguments(input)).join(' ');

  //     expect(actual).toContain(`--config ${helper.hostPath('jest.config.js')}`);
  //   });
  //   it('should pass if no tests', async () => {
  //     const input = {};
  //     const actual = await current.jestCliArguments(input);

  //     expect(actual).toContain('--passWithNoTests');
  //   });
  //   it('should not use caching', async () => {
  //     const input = {};
  //     const actual = await current.jestCliArguments(input);

  //     expect(actual).toContain('--no-cache');
  //   });
  //   it('should enable watch mode if --watch', async () => {
  //     const input = { watch: true };
  //     const actual = await current.jestCliArguments(input);

  //     expect(actual).toContain('--watch');
  //     expect(actual).toContain('--no-watchman');
  //   });
  //   it('should not enable watch mode if not --watch', async () => {
  //     const input = {};
  //     const actual = await current.jestCliArguments(input);

  //     expect(actual).not.toContain('--watch');
  //   });
  //   it('should allow passing options to jest directly', async () => {
  //     const input = { bail: true, maxWorkers: 12, findRelatedTests: true };
  //     const actual = await current.jestCliArguments(input);

  //     expect(actual).toContain('--bail');
  //     expect(actual).toContain('--findRelatedTests');
  //     expect(actual).toContain('--maxWorkers');
  //     expect(actual).toContain('12');
  //   });
  //   it('should handle failFast', async () => {
  //     vi.spyOn(current, 'setEnv').mockReturnValue();
  //     const input = { failFast: true };

  //     const actual = await current.jestCliArguments(input);

  //     expect(actual).not.toContain('--failFast');
  //     expect(current.setEnv).toHaveBeenCalledWith(
  //       'ABERLAAS_TEST_FAIL_FAST',
  //       true,
  //     );
  //   });
  // });
  // describe('run', () => {
  //   it('should run jest tests with cli options', async () => {
  //     vi.spyOn(current, '__jestRun').mockImplementation();
  //     vi.spyOn(current, 'jestCliArguments').mockReturnValue('args');
  //     await current.run();

  //     expect(current.__jestRun).toHaveBeenCalledWith('args');
  //   });
  // });
  describe('testName', () => {
    it('this is the name of my test', async () => {
      expect(testName).toBe('this is the name of my test');
    });
  });
});
