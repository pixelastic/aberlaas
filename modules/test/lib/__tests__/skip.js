/* eslint-disable vitest/no-disabled-tests,no-restricted-globals */
describe('test > skip', () => {
  describe('xdescribe', () => {
    xdescribe('[describe]', () => {
      it('should not run', async () => {
        expect(true).toBe(false);
      });
    });
    describe('fdescribe', () => {
      it('should run', async () => {
        expect(true).toBe(true);
      });
    });
  });

  describe('xit', () => {
    xit('should not run', async () => {
      expect(true).toBe(false);
    });
    it('should run', async () => {
      expect(true).toBe(true);
    });
  });
});
