import current from '../main.js';

describe('ci', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__runTest').mockReturnValue();
      vi.spyOn(current, '__runLint').mockReturnValue();
      vi.spyOn(current, 'displayVersions').mockReturnValue();
    });

    it('should fail if not on a CI server', async () => {
      vi.spyOn(current, 'isCI').mockReturnValue(false);
      let actual = null;
      try {
        await current.run();
      } catch (err) {
        actual = err;
      }

      expect(current.__runTest).not.toHaveBeenCalled();
      expect(current.__runLint).not.toHaveBeenCalled();
      expect(current.displayVersions).not.toHaveBeenCalled();
      expect(actual).toHaveProperty('code', 'ABERLAAS_CI_NOT_CI_ENVIRONMENT');
    });

    describe('on CI server', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'isCI').mockReturnValue(true);
      });
      describe('should fail if any sub command fails', () => {
        it.each([['__runTest'], ['__runLint']])(
          'should fail if %s fails',
          async (input) => {
            vi.spyOn(current, input).mockImplementation(() => {
              throw new Error();
            });

            let actual = null;
            try {
              await current.run();
            } catch (error) {
              actual = error;
            }

            expect(actual).not.toBeNull();
          },
        );
      });
      it('should not call further lint if test fails', async () => {
        vi.spyOn(current, '__runTest').mockImplementation(() => {
          throw new Error();
        });

        try {
          await current.run();
        } catch (_error) {
          // Swallow error
        }

        expect(current.__runLint).not.toHaveBeenCalled();
      });
      it('should display the currently used versions', async () => {
        await current.run();

        expect(current.displayVersions).toHaveBeenCalled();
      });
      it('should succeed if all steps succeed', async () => {
        const actual = await current.run();

        expect(actual).toBe(true);
      });
    });
  });
  describe('displayVersions', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__consoleInfo').mockReturnValue();
    });
    it('should display both node and yarn version', async () => {
      vi.spyOn(current, 'runCommand').mockImplementation((command) => {
        if (command.startsWith('node')) {
          return '42.0.n';
        }
        if (command.startsWith('yarn')) {
          return '42.0.y';
        }
      });

      await current.displayVersions();

      expect(current.__consoleInfo).toHaveBeenCalledWith(
        'node 42.0.n, yarn 42.0.y',
      );
    });
    it('should a real command with suppressed output', async () => {
      vi.spyOn(current, '__run').mockReturnValue({ stdout: 'output' });
      await current.displayVersions();
      expect(current.__run).toHaveBeenCalledWith(expect.anything(), {
        stdout: false,
      });
    });
  });
});
