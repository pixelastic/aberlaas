import current from '../index.js';

describe('ci', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__runTest').mockReturnValue();
      vi.spyOn(current, '__runLint').mockReturnValue();
    });
    describe('locally', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'isCI').mockReturnValue(false);
        vi.spyOn(current, '__consoleInfo').mockReturnValue();
      });
      it('should do nothing when not on a CI server', async () => {
        await current.run();

        expect(current.__runTest).not.toHaveBeenCalled();
        expect(current.__runLint).not.toHaveBeenCalled();
      });
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
      it('should succeed if all steps succeed', async () => {
        const actual = await current.run();

        expect(actual).toBe(true);
      });
    });
  });
});
