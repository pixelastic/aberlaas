/* eslint-disable vitest/valid-title */
describe('test > skip', () => {
  describe('describe', () => {
    describe('fdescribe', () => {
      it('should run', async () => {
        expect(true).toBe(true);
      });
    });
    xdescribe('describe', () => {
      it('should not run', async () => {
        expect(true).toBe(false);
      });
    });
  });
  describe('it', () => {
    it('should run', async () => {
      expect(true).toBe(true);
    });
    xit('should not run', async () => {
      expect(true).toBe(false);
    });
  });
  describe('test', () => {
    test('should run', async () => {
      expect(true).toBe(true);
    });
    xtest('should not run', async () => {
      expect(true).toBe(false);
    });
  });
});
