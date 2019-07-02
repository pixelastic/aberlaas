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
  describe('inputFromCli', () => {
    it('should return positional arguments', () => {
      const cliArgs = { _: ['foo', 'bar'] };
      const actual = module.inputFromCli(cliArgs);

      expect(actual).toEqual(['foo', 'bar']);
    });
    it('should return an empty array if no arguments', () => {
      const cliArgs = { _: [] };
      const actual = module.inputFromCli(cliArgs);

      expect(actual).toEqual([]);
    });
    it('should return the default array if no arguments', () => {
      const cliArgs = { _: [] };
      const actual = module.inputFromCli(cliArgs, ['foo', 'bar']);

      expect(actual).toEqual(['foo', 'bar']);
    });
    it('should return the args even if a default value is set', () => {
      const cliArgs = { _: ['foo', 'bar'] };
      const actual = module.inputFromCli(cliArgs, ['bar', 'baz']);

      expect(actual).toEqual(['foo', 'bar']);
    });
    it('should return the default array if not an CLI object', () => {
      const cliArgs = {};
      const actual = module.inputFromCli(cliArgs);

      expect(actual).toEqual([]);
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
  describe('hostBlockedDirectories', () => {
    beforeEach(() => {
      jest.spyOn(module, 'hostRoot').mockReturnValue('./fixtures/host');
    });
    it('should contain build', async () => {});
    it('should contain tmp', async () => {});
    it('should contain node_modules', async () => {});
  });
  describe('findHostFiles', () => {
    beforeEach(() => {
      jest.spyOn(module, 'hostRoot').mockReturnValue('./fixtures/host');
    });
    it('should return absolute paths', async () => {
      const input = ['./lib/__tests__/foo.js'];
      const actual = await module.findHostFiles(input);

      expect(actual).toContain(module.hostPath('lib/__tests__/foo.js'));
    });
    it('should expand glob patterns', async () => {
      const input = ['./lib/**/*.js'];
      const actual = await module.findHostFiles(input);

      expect(actual).toContain(module.hostPath('lib/__tests__/foo.js'));
    });
    it('should find files in directories', async () => {
      const input = ['.'];
      const actual = await module.findHostFiles(input);

      expect(actual).toContain(module.hostPath('jest.config.js'));
      expect(actual).toContain(module.hostPath('package.json'));
    });
    it('should go deep in directories', async () => {
      const input = ['.'];
      const actual = await module.findHostFiles(input);

      expect(actual).toContain(module.hostPath('lib/__tests__/foo.js'));
    });
    it('should find hidden files', async () => {
      const input = ['.'];
      const actual = await module.findHostFiles(input);

      expect(actual).toContain(module.hostPath('.eslintrc.js'));
    });
    describe('exclude', () => {
      it('should allow safelisting some extensions', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input, ['.js']);

        expect(actual).not.toContain(module.hostPath('lib/assets/001.jpg'));
        expect(actual).toContain(module.hostPath('jest.config.js'));
      });
      it('should allow safelisting some extensions without dots', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input, ['js']);

        expect(actual).not.toContain(module.hostPath('lib/assets/001.jpg'));
        expect(actual).toContain(module.hostPath('jest.config.js'));
      });
      it('should exclude files in node_modules', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input);

        expect(actual).not.toContain(
          module.hostPath('node_modules/foo/foo.js')
        );
      });
      it('should exclude files in build', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input);

        expect(actual).not.toContain(module.hostPath('build/foo.js'));
      });
      it('should exclude files in tmp', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input);

        expect(actual).not.toContain(module.hostPath('tmp/foo.js'));
      });
      it('should exclude directories and only keep files', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input);

        expect(actual).not.toContain(module.hostPath('lib'));
      });
    });
  });
});
