/* eslint-disable vitest/valid-title, vitest/no-identical-title */
describe('test > focus', () => {
  describe('describe', () => {
    fdescribe('fdescribe', () => {
      it('should run', async () => {
        expect(true).toBe(true);
      });
    });
    describe('describe', () => {
      it('should not run', async () => {
        expect(true).toBe(false);
      });
    });
  });
  describe('it', () => {
    fit('should run', async () => {
      expect(true).toBe(true);
    });
    it('should not run', async () => {
      expect(true).toBe(false);
    });
  });
  describe('test', () => {
    ftest('should run', async () => {
      expect(true).toBe(true);
    });
    test('should not run', async () => {
      expect(true).toBe(false);
    });
  });
});
