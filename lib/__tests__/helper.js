const current = require('../helper');
const writeJson = require('firost/lib/writeJson');
const emptyDir = require('firost/lib/emptyDir');
const readJson = require('firost/lib/readJson');

describe('current', () => {
  const tmpDirectory = './tmp/helper';
  describe('hostRoot', () => {
    it('should return the current working directory', () => {
      const cwd = process.cwd();
      const actual = current.hostRoot();

      expect(actual).toEqual(cwd);
    });
  });
  describe('hostPath', () => {
    it('should return path relative to working directory', () => {
      jest.spyOn(current, 'hostRoot').mockReturnValue('/basedir/');
      const actual = current.hostPath('foo/bar/baz.js');

      expect(actual).toEqual('/basedir/foo/bar/baz.js');
    });
  });
  describe('aberlaasRoot', () => {
    it('should return the aberlaas root', async () => {
      const path = current.aberlaasRoot();
      const actual = await readJson(`${path}/package.json`);

      expect(actual).toHaveProperty('name', 'aberlaas');
    });
  });
  describe('aberlaasPath', () => {
    it('should return path relative to aberlaas directory', () => {
      jest.spyOn(current, 'aberlaasRoot').mockReturnValue('/aberlaas/');
      const actual = current.aberlaasPath('foo/bar/baz.js');

      expect(actual).toEqual('/aberlaas/foo/bar/baz.js');
    });
  });
  describe('findHostFiles', () => {
    beforeEach(() => {
      jest.spyOn(current, 'hostRoot').mockReturnValue('./fixtures/host');
    });
    it('should return absolute paths', async () => {
      const input = ['./lib/__tests__/foo.js'];
      const actual = await current.findHostFiles(input);

      expect(actual).toContain(current.hostPath('lib/__tests__/foo.js'));
    });
    it('should expand glob patterns', async () => {
      const input = ['./lib/**/*.js'];
      const actual = await current.findHostFiles(input);

      expect(actual).toContain(current.hostPath('lib/__tests__/foo.js'));
    });
    it('should find files in directories', async () => {
      const input = ['.'];
      const actual = await current.findHostFiles(input);

      expect(actual).toContain(current.hostPath('jest.config.js'));
      expect(actual).toContain(current.hostPath('package.json'));
    });
    it('should go deep in directories', async () => {
      const input = ['.'];
      const actual = await current.findHostFiles(input);

      expect(actual).toContain(current.hostPath('lib/__tests__/foo.js'));
    });
    it('should find hidden files', async () => {
      const input = ['.'];
      const actual = await current.findHostFiles(input);

      expect(actual).toContain(current.hostPath('.eslintrc.js'));
    });
    describe('exclude', () => {
      it('should allow safelisting some extensions', async () => {
        const input = ['.'];
        const actual = await current.findHostFiles(input, ['.js']);

        expect(actual).not.toContain(current.hostPath('lib/assets/001.jpg'));
        expect(actual).toContain(current.hostPath('jest.config.js'));
      });
      it('should allow safelisting some extensions without dots', async () => {
        const input = ['.'];
        const actual = await current.findHostFiles(input, ['js']);

        expect(actual).not.toContain(current.hostPath('lib/assets/001.jpg'));
        expect(actual).toContain(current.hostPath('jest.config.js'));
      });
      it('should exclude files in node_currents', async () => {
        const input = ['.'];
        const actual = await current.findHostFiles(input);

        expect(actual).not.toContain(
          current.hostPath('node_currents/foo/foo.js')
        );
      });
      it('should exclude files in build', async () => {
        const input = ['.'];
        const actual = await current.findHostFiles(input);

        expect(actual).not.toContain(current.hostPath('build/foo.js'));
      });
      it('should exclude files in dist', async () => {
        const input = ['.'];
        const actual = await current.findHostFiles(input);

        expect(actual).not.toContain(current.hostPath('dist/foo.js'));
      });
      it('should exclude files in tmp', async () => {
        const input = ['.'];
        const actual = await current.findHostFiles(input);

        expect(actual).not.toContain(current.hostPath('tmp/foo.js'));
      });
      it('should exclude files in vendors', async () => {
        const input = ['.'];
        const actual = await current.findHostFiles(input);

        expect(actual).not.toContain(current.hostPath('src/vendors/jQuery.js'));
      });
      it('should exclude directories and only keep files', async () => {
        const input = ['.'];
        const actual = await current.findHostFiles(input);

        expect(actual).not.toContain(current.hostPath('lib'));
      });
    });
  });
  describe('configFile', () => {
    beforeEach(() => {
      jest.spyOn(current, 'hostRoot').mockReturnValue('./fixtures/host');
      jest
        .spyOn(current, 'aberlaasRoot')
        .mockReturnValue('./fixtures/aberlaas');
    });
    it('should take the --config CLI option first', async () => {
      const userPath = 'eslint.config.custom.js';
      const hostPath = 'eslint.config.js';
      const aberlaasPath = 'lib/config/eslint.js';

      const actual = await current.configFile(userPath, hostPath, aberlaasPath);

      expect(actual).toEqual(current.hostPath(userPath));
    });
    it('should allow absolute cli arguments', async () => {
      const userPath = current.aberlaasPath('lib/config/eslint.js');
      const hostPath = 'eslint.config.js';
      const aberlaasPath = 'lib/config/eslint.js';

      const actual = await current.configFile(userPath, hostPath, aberlaasPath);

      expect(actual).toEqual(userPath);
    });
    it('should take the host file if no cli argument', async () => {
      const userPath = null;
      const hostPath = 'eslint.config.js';
      const aberlaasPath = 'lib/config/eslint.js';

      const actual = await current.configFile(userPath, hostPath, aberlaasPath);

      expect(actual).toEqual(current.hostPath(hostPath));
    });
    it('should take the aberlaas default if no host file', async () => {
      const userPath = null;
      const hostPath = 'nope.js';
      const aberlaasPath = 'lib/config/eslint.js';

      const actual = await current.configFile(userPath, hostPath, aberlaasPath);

      expect(actual).toEqual(current.aberlaasPath(aberlaasPath));
    });
  });
  describe('which', () => {
    it('should return path to the one saved in the host', async () => {
      jest.spyOn(current, '__run').mockReturnValue({ stdout: '/bar' });

      const actual = await current.which('foo');

      expect(current.__run).toHaveBeenCalledWith('yarn bin foo', {
        stdout: false,
        stderr: false,
      });
      expect(actual).toEqual('/bar');
    });
    it('should return aberlaas path if none in host', async () => {
      jest
        .spyOn(current, '__run')
        .mockReturnValueOnce({ stdout: null })
        .mockReturnValueOnce({ stdout: '/aberlaas/bar' });
      jest.spyOn(current, 'aberlaasRoot').mockReturnValue('/aberlaas');

      const actual = await current.which('foo');

      expect(actual).toEqual('/aberlaas/bar');
      expect(current.__run).toHaveBeenCalledWith(
        'yarn bin foo',
        expect.anything()
      );
      expect(current.__run).toHaveBeenCalledWith(
        'cd /aberlaas && yarn bin foo',
        expect.anything()
      );
    });
    it('should return null if never found', async () => {
      jest.spyOn(current, '__run').mockReturnValue({ stdout: null });

      const actual = await current.which('foo');

      expect(actual).toEqual(null);
    });
    it('should strip ANSI characters', async () => {
      jest
        .spyOn(current, '__run')
        .mockReturnValue({ stdout: '\u001b[2K\u001b[1Gfoo' });

      const actual = await current.which('foo');

      expect(actual).toEqual('foo');
    });
  });
  describe('yarnRun', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'hostRoot').mockReturnValue(tmpDirectory);
      await emptyDir(current.hostRoot());
    });
    it('should display script stdout to stdout', async () => {
      await writeJson(
        { license: 'MIT', scripts: { lint: 'echo "foo"' } },
        current.hostPath('package.json')
      );

      const actual = await captureOutput(async () => {
        await current.yarnRun('lint');
      });

      expect(actual.stdout).toInclude('foo');
    });
    it('should throw an error if the script fails', async () => {
      await writeJson(
        { license: 'MIT', scripts: { lint: 'exit 42' } },
        current.hostPath('package.json')
      );

      let actual;
      try {
        await captureOutput(async () => {
          await current.yarnRun('lint');
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
