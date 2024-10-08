describe('test > focus', () => {
  describe('fdescribe', () => {
    // eslint-disable-next-line no-restricted-globals
    fdescribe('[fdescribe]', () => {
      it('should run', async () => {
        expect(true).toBe(true);
      });
    });
    describe('[describe]', () => {
      it('should not run', async () => {
        expect(true).toBe(false);
      });
    });
  });

  describe('fit', () => {
    // eslint-disable-next-line no-restricted-globals
    fit('should run', async () => {
      expect(true).toBe(true);
    });
    it('should not run', async () => {
      expect(true).toBe(false);
    });
  });
});
