const module = jestImport('../helper');
const writeJson = jestImport('firost/lib/writeJson');
const emptyDir = jestImport('firost/lib/emptyDir');
const readJson = jestImport('firost/lib/readJson');

describe('module', () => {
  const tmpDirectory = './tmp/helper';
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
    it('should return the aberlaas root', async () => {
      const path = module.aberlaasRoot();
      const actual = await readJson(`${path}/package.json`);

      expect(actual).toHaveProperty('name', 'aberlaas');
    });
  });
  describe('aberlaasPath', () => {
    it('should return path relative to aberlaas directory', () => {
      jest.spyOn(module, 'aberlaasRoot').mockReturnValue('/aberlaas/');
      const actual = module.aberlaasPath('foo/bar/baz.js');

      expect(actual).toEqual('/aberlaas/foo/bar/baz.js');
    });
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
      it('should exclude files in dist', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input);

        expect(actual).not.toContain(module.hostPath('dist/foo.js'));
      });
      it('should exclude files in tmp', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input);

        expect(actual).not.toContain(module.hostPath('tmp/foo.js'));
      });
      it('should exclude files in vendors', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input);

        expect(actual).not.toContain(module.hostPath('src/vendors/jQuery.js'));
      });
      it('should exclude directories and only keep files', async () => {
        const input = ['.'];
        const actual = await module.findHostFiles(input);

        expect(actual).not.toContain(module.hostPath('lib'));
      });
    });
  });
  describe('configFile', () => {
    beforeEach(() => {
      jest.spyOn(module, 'hostRoot').mockReturnValue('./fixtures/host');
      jest.spyOn(module, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
    });
    it('should take the --config CLI option first', async () => {
      const userPath = 'babel.config.custom.js';
      const hostPath = 'babel.config.js';
      const aberlaasPath = 'lib/config/babel.js';

      const actual = await module.configFile(userPath, hostPath, aberlaasPath);

      expect(actual).toEqual(module.hostPath(userPath));
    });
    it('should allow absolute cli arguments', async () => {
      const userPath = module.aberlaasPath('lib/config/babel.js');
      const hostPath = 'babel.config.js';
      const aberlaasPath = 'lib/config/babel.js';

      const actual = await module.configFile(userPath, hostPath, aberlaasPath);

      expect(actual).toEqual(userPath);
    });
    it('should take the host file if no cli argument', async () => {
      const userPath = null;
      const hostPath = 'babel.config.js';
      const aberlaasPath = 'lib/config/babel.js';

      const actual = await module.configFile(userPath, hostPath, aberlaasPath);

      expect(actual).toEqual(module.hostPath(hostPath));
    });
    it('should take the aberlaas default if no host file', async () => {
      const userPath = null;
      const hostPath = 'nope.js';
      const aberlaasPath = 'lib/config/babel.js';

      const actual = await module.configFile(userPath, hostPath, aberlaasPath);

      expect(actual).toEqual(module.aberlaasPath(aberlaasPath));
    });
  });
  describe('which', () => {
    it('should return path to the one saved in the host', async () => {
      jest.spyOn(module, '__run').mockReturnValue({ stdout: '/bar' });

      const actual = await module.which('foo');

      expect(module.__run).toHaveBeenCalledWith('yarn bin foo', {
        stdout: false,
        stderr: false,
      });
      expect(actual).toEqual('/bar');
    });
    it('should return aberlaas path if none in host', async () => {
      jest
        .spyOn(module, '__run')
        .mockReturnValueOnce({ stdout: null })
        .mockReturnValueOnce({ stdout: '/aberlaas/bar' });
      jest.spyOn(module, 'aberlaasRoot').mockReturnValue('/aberlaas');

      const actual = await module.which('foo');

      expect(actual).toEqual('/aberlaas/bar');
      expect(module.__run).toHaveBeenCalledWith(
        'yarn bin foo',
        expect.anything()
      );
      expect(module.__run).toHaveBeenCalledWith(
        'cd /aberlaas && yarn bin foo',
        expect.anything()
      );
    });
    it('should return null if never found', async () => {
      jest.spyOn(module, '__run').mockReturnValue({ stdout: null });

      const actual = await module.which('foo');

      expect(actual).toEqual(null);
    });
    it('should strip ANSI characters', async () => {
      jest
        .spyOn(module, '__run')
        .mockReturnValue({ stdout: '\u001b[2K\u001b[1Gfoo' });

      const actual = await module.which('foo');

      expect(actual).toEqual('foo');
    });
  });
  describe('yarnRun', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'hostRoot').mockReturnValue(tmpDirectory);
      await emptyDir(module.hostRoot());
    });
    it('should display script stdout to stdout', async () => {
      await writeJson(
        { license: 'MIT', scripts: { lint: 'echo "foo"' } },
        module.hostPath('package.json')
      );

      const actual = await captureOutput(async () => {
        await module.yarnRun('lint');
      });

      expect(actual.stdout).toInclude('foo');
    });
    it('should throw an error if the script fails', async () => {
      await writeJson(
        { license: 'MIT', scripts: { lint: 'exit 42' } },
        module.hostPath('package.json')
      );

      let actual;
      try {
        await captureOutput(async () => {
          await module.yarnRun('lint');
        });
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining(
          'Command failed with exit code 42: yarn run lint'
        )
      );
      expect(actual).toHaveProperty('code', 42);
    });
  });
});