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
    describe('passWithNoTest', () => {
      it('even if not file matched, test should succeed', async () => {
        const input = {};
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain('--passWithNoTests');
      });
    });
    describe('watch', () => {
      it('should not watch by default', async () => {
        const input = {};
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain('--watch=false');
      });
      it('should watch with --watch', async () => {
        const input = { watch: true };
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain('--watch=true');
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
    describe('config file', () => {
      it('should allow specifying the config file', async () => {
        const input = { config: 'custom.vite.config.js' };
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain(
          `--config=${helper.hostPath('custom.vite.config.js')}`,
        );
      });
      it('should use project config file if none specified', async () => {
        await write('', helper.hostPath('vite.config.js'));
        const input = {};
        const actual = await current.vitestCliOptions(input);

        expect(actual).toContain(
          `--config=${helper.hostPath('vite.config.js')}`,
        );
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
    });
    // it('should handle failFast', async () => {
    //   vi.spyOn(current, 'setEnv').mockReturnValue();
    //   const input = { failFast: true };

    //   const actual = await current.jestCliArguments(input);

    //   expect(actual).not.toContain('--failFast');
    //   expect(current.setEnv).toHaveBeenCalledWith(
    //     'ABERLAAS_TEST_FAIL_FAST',
    //     true,
    //   );
    // });
  });
  describe('testName', () => {
    it('this is the name of my test', async () => {
      expect(testName).toBe('this is the name of my test');
    });
  });
});
