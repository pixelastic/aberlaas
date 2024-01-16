import current from '../index.js';
import helper from '../../../helper.js';
import write from 'firost/write.js';
import absolute from 'firost/absolute.js';

describe('test', () => {
  const tmpDirectory = absolute('./tmp/test');
  beforeEach(() => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
  });
  describe('vitestCliOptions', () => {
    describe('--related', () => {
      it('should have no related by default', async () => {
        const input = {};
        const actual = await current.vitestCliOptions(input);

        expect(actual[0]).not.toBe('related');
      });
      it('should call vitest related with --related', async () => {
        const input = { related: true };
        const actual = await current.vitestCliOptions(input);

        expect(actual[0]).toBe('related');
      });
    });
    describe('--failFast', () => {
      it('should have no --bail by default', async () => {
        const input = {};
        const actual = await current.vitestCliOptions(input);

        expect(actual.toString()).not.toInclude('--bail');
      });
      it('should have --bail=1 with --failFast', async () => {
        const input = { failFast: true };
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain('--bail=1');
      });
    });
    describe('--watch', () => {
      it('should have vitest --watch=false by default', async () => {
        const input = {};
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain('--watch=false');
      });
      it('should have vitest --watch=true with --watch', async () => {
        const input = { watch: true };
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain('--watch=true');
      });
    });
    describe('default options', () => {
      it.each([['--passWithNoTests'], ['--hideSkippedTests']])(
        'vitest %s',
        async (optionName) => {
          const input = {};
          const actual = await current.vitestCliOptions(input);
          expect(actual).toContain(optionName);
        },
      );
    });
    describe('--config', () => {
      it('default host config file', async () => {
        await write('', helper.hostPath('vite.config.js'));
        const input = {};
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain(
          `--config=${helper.hostPath('vite.config.js')}`,
        );
      });
      it('should allow specifying the config file', async () => {
        const input = { config: 'custom.vite.config.js' };
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain(
          `--config=${helper.hostPath('custom.vite.config.js')}`,
        );
      });
    });
    describe('additional options', () => {
      it('should allow passing new options to vitest', async () => {
        const input = { version: true, open: false, reporter: 'json' };
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain('--version');
        expect(actual).toContain('--open=false');
        expect(actual).toContain('--reporter=json');
      });
    });

    describe('files', () => {
      it('should pass specified files', async () => {
        const input = { _: ['foo.js', 'bar.js'] };
        const actual = await current.vitestCliOptions(input);

        expect(actual[0]).toBe('foo.js');
        expect(actual[1]).toBe('bar.js');
      });
      it('should fallback to project root if no file', async () => {
        const input = {};
        const actual = await current.vitestCliOptions(input);

        expect(actual[0]).toEqual(tmpDirectory);
      });
    });
  });
  describe('testName', () => {
    it('this is the name of my test', async () => {
      expect(testName).toBe('this is the name of my test');
    });
  });
  describe('run', () => {
    it('should just pass', async () => {
      // We do not test this method on purpose.
      // First, testing the testing method from inside the testing framework proved
      // very difficult. I can't create test files in a ./tmp directory as those
      // are ignored by the config, and I can't create them outside of ./tmp as
      // they would be picked by the "real" test system.
      //
      // Second, if the test.run() method does not work, I wouldn't even be able
      // to run the test to see that it fails. I could see it clearly by the
      // tests not running at all. And if it works, then any other test running
      // is proof of that.
      //
      // So, we don't test this method.
      expect(true).toBe(true);
    });
  });
});
