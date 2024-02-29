import { absolute, emptyDir, write } from 'firost';
import { _ } from 'golgoth';
import current from '../index.js';
import helper from '../../../helper.js';

describe('test', () => {
  const tmpDirectory = absolute('./tmp/test');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(helper.hostRoot());
  });
  describe('vitestOptions', () => {
    describe('--related', () => {
      it('should have no related by default', async () => {
        const input = {};
        const actual = await current.vitestOptions(input);

        expect(actual).not.toHaveProperty('related');
      });
      it('should have all files as part of the related field', async () => {
        const input = { _: ['file.js'], related: true };
        const actual = await current.vitestOptions(input);

        expect(actual).toHaveProperty('related', ['file.js']);
      });
    });
    describe('--failFast', () => {
      it('should have no --bail by default', async () => {
        const input = {};
        const actual = await current.vitestOptions(input);

        expect(actual).not.toHaveProperty('bail');
      });
      it('should have --bail=1 with --failFast', async () => {
        const input = { failFast: true };
        const actual = await current.vitestOptions(input);

        expect(actual).toHaveProperty('bail', 1);
      });
    });
    describe('--watch', () => {
      it('should have vitest --watch=false by default', async () => {
        const input = {};
        const actual = await current.vitestOptions(input);

        expect(actual).toHaveProperty('watch', false);
      });
      it('should have vitest --watch=true with --watch', async () => {
        const input = { watch: true };
        const actual = await current.vitestOptions(input);

        expect(actual).toHaveProperty('watch', true);
      });
    });
    describe('default options', () => {
      it.each([['--passWithNoTests'], ['--hideSkippedTests']])(
        'aberlaas test  %s',
        async (cliName) => {
          const input = {};
          const actual = await current.vitestOptions(input);
          const optionName = _.replace(cliName, '--', '');
          expect(actual).toHaveProperty(optionName, true);
        },
      );
    });
    describe('--config', () => {
      it('default host config file', async () => {
        await write(
          dedent`
        export default {
          test: {
            newOption: true
          }
        }`,
          helper.hostPath('vite.config.js'),
        );
        const input = {};
        const actual = await current.vitestOptions(input);
        expect(actual).toHaveProperty('newOption', true);
      });
      it('should allow specifying the config file', async () => {
        await write(
          dedent`
        export default {
          test: {
            newOption: true
          }
        }`,
          helper.hostPath('custom.vite.config.js'),
        );
        const input = { config: 'custom.vite.config.js' };
        const actual = await current.vitestOptions(input);

        expect(actual).toHaveProperty('newOption', true);
      });
    });
    describe('additional options', () => {
      it('should allow passing new options to vitest', async () => {
        const input = { open: false, reporter: 'json' };
        const actual = await current.vitestOptions(input);

        expect(actual).toHaveProperty('open', false);
        expect(actual).toHaveProperty('reporter', 'json');
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
