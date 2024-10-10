describe('test > skip', () => {
  describe('xdescribe', () => {
    // eslint-disable-next-line no-restricted-globals
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
    // eslint-disable-next-line no-restricted-globals
    xit('should not run', async () => {
      expect(true).toBe(false);
    });
    it('should run', async () => {
      expect(true).toBe(true);
    });
  });
});
