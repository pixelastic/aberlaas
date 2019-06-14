import module from '../helper';
import firost from 'firost';

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
  describe('which', () => {
    it('should return path to the one saved in the host', async () => {
      const mockShell = jest.spyOn(firost, 'shell').mockReturnValue('/bar');

      const actual = await module.which('foo');

      expect(actual).toEqual('/bar');
      expect(mockShell).toHaveBeenCalledWith('yarn bin foo');
    });
    it('should return aberlaas path if none in host', async () => {
      const mockShell = jest
        .spyOn(firost, 'shell')
        .mockReturnValueOnce(null)
        .mockReturnValueOnce('/aberlaas/bar');
      jest.spyOn(module, 'aberlaasRoot').mockReturnValue('/aberlaas');

      const actual = await module.which('foo');

      expect(actual).toEqual('/aberlaas/bar');
      expect(mockShell).toHaveBeenCalledWith('yarn bin foo');
      expect(mockShell).toHaveBeenCalledWith('cd /aberlaas && yarn bin foo');
    });
    it('should return null if never found', async () => {
      jest.spyOn(firost, 'shell').mockReturnValue(null);

      const actual = await module.which('foo');

      expect(actual).toEqual(null);
    });
  });
});
