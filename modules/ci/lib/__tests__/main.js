import { __, run } from '../main.js';

describe('ci', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'yarnRunTest').mockReturnValue();
      vi.spyOn(__, 'yarnRunLint').mockReturnValue();
      vi.spyOn(__, 'displayVersions').mockReturnValue();
      vi.spyOn(__, 'trustedPublish').mockReturnValue();
    });

    it('should fail if not on a CI server', async () => {
      vi.spyOn(__, 'isCI').mockReturnValue(false);
      let actual = null;
      try {
        await run();
      } catch (err) {
        actual = err;
      }

      expect(__.yarnRunTest).not.toHaveBeenCalled();
      expect(__.yarnRunLint).not.toHaveBeenCalled();
      expect(__.displayVersions).not.toHaveBeenCalled();
      expect(actual).toHaveProperty('code', 'ABERLAAS_CI_NOT_CI_ENVIRONMENT');
    });

    describe('--trusted-publish', () => {
      beforeEach(async () => {
        vi.spyOn(__, 'isCI').mockReturnValue(true);
      });

      it('should route to trustedPublish when --trusted-publish is set', async () => {
        await run({ 'trusted-publish': true, _: ['pkg-a,pkg-b'] });

        expect(__.trustedPublish).toHaveBeenCalledWith('pkg-a,pkg-b');
      });

      it('should throw when --trusted-publish has no packages list', async () => {
        let actual = null;
        try {
          await run({ 'trusted-publish': true, _: [] });
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty(
          'code',
          'ABERLAAS_CI_TRUSTED_PUBLISH_NO_PACKAGES',
        );
      });

      it('should skip test and lint when --trusted-publish is set', async () => {
        await run({ 'trusted-publish': true, _: ['pkg-a'] });

        expect(__.yarnRunTest).not.toHaveBeenCalled();
        expect(__.yarnRunLint).not.toHaveBeenCalled();
      });
    });

    describe('on CI server', () => {
      beforeEach(async () => {
        vi.spyOn(__, 'isCI').mockReturnValue(true);
      });
      describe('should fail if any sub command fails', () => {
        it.each([['yarnRunTest'], ['yarnRunLint']])(
          'should fail if %s fails',
          async (input) => {
            vi.spyOn(__, input).mockImplementation(() => {
              throw new Error();
            });

            let actual = null;
            try {
              await run();
            } catch (error) {
              actual = error;
            }

            expect(actual).not.toBeNull();
          },
        );
      });
      it('should not call further lint if test fails', async () => {
        vi.spyOn(__, 'yarnRunTest').mockImplementation(() => {
          throw new Error();
        });

        try {
          await run();
        } catch (_error) {
          // Swallow error
        }

        expect(__.yarnRunLint).not.toHaveBeenCalled();
      });
      it('should display the currently used versions', async () => {
        await run();

        expect(__.displayVersions).toHaveBeenCalled();
      });
      it('should succeed if all steps succeed', async () => {
        const actual = await run();

        expect(actual).toBe(true);
      });
    });
  });
  describe('displayVersions', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
    });
    it('should display both node and yarn version', async () => {
      vi.spyOn(__, 'runCommand').mockImplementation((command) => {
        if (command.startsWith('node')) {
          return '42.0.n';
        }
        if (command.startsWith('yarn')) {
          return '42.0.y';
        }
      });

      await __.displayVersions();

      expect(__.consoleInfo).toHaveBeenCalledWith('node 42.0.n, yarn 42.0.y');
    });
    it('should a real command with suppressed output', async () => {
      vi.spyOn(__, 'firostRun').mockReturnValue({ stdout: 'output' });
      await __.displayVersions();
      expect(__.firostRun).toHaveBeenCalledWith(expect.anything(), {
        stdout: false,
      });
    });
  });
});
