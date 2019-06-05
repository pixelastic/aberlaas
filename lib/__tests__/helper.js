import module from '../helper';

describe('helper', () => {
  describe('hostRoot', () => {
    it('should return the current working directory', () => {
      const cwd = process.cwd();
      const actual = module.hostRoot();

      expect(actual).toEqual(cwd);
    });
  });
  describe('hostPath', () => {
    it('should return path relative to working directory', () => {
      jest.spyOn(module, 'hostRoot').mockReturnValue('/basedir/');
      const actual = module.hostPath('foo/bar/baz.js');

      expect(actual).toEqual('/basedir/foo/bar/baz.js');
    });
  });
  describe('aberlaasRoot', () => {
    it('should return the aberlaas root', () => {
      const actual = module.aberlaasRoot();

      expect(actual).toMatch(/aberlaas$/);
    });
  });
  describe('aberlaasPath', () => {
    it('should return path relative to aberlaas directory', () => {
      jest.spyOn(module, 'aberlaasRoot').mockReturnValue('/aberlaas/');
      const actual = module.aberlaasPath('foo/bar/baz.js');

      expect(actual).toEqual('/aberlaas/foo/bar/baz.js');
    });
  });
});
