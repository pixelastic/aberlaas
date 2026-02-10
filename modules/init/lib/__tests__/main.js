import {
  glob,
  packageRoot,
  read,
  readJson,
  remove,
  tmpDirectory,
} from 'firost';
import { hostGitPath, hostGitRoot, mockHelperPaths } from 'aberlaas-helper';
import { nodeVersion } from 'aberlaas-versions';
import Gilmore from 'gilmore';
import { __, run } from '../main.js';

describe('init/main', () => {
  const testDirectory = tmpDirectory('aberlaas/init/main');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(hostGitRoot());
  });
  // CONFIGURE
  describe('configureGit', () => {
    it('should change the default git hooksPath', async () => {
      const repo = new Gilmore(hostGitRoot());
      await repo.init();

      await __.configureGit();

      const actual = await repo.getConfig('core.hooksPath');
      expect(actual).toBe('scripts/hooks');
    });
  });
  describe('configureNode', () => {
    it('should set a .nvmrc file', async () => {
      await __.configureNode();

      const actual = await read(hostGitPath('.nvmrc'));

      expect(actual).toEqual(nodeVersion);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'configureGit').mockReturnValue();
      vi.spyOn(__, 'configureNode').mockReturnValue();
      vi.spyOn(__, 'yarnInstall').mockReturnValue();
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'spinner').mockReturnValue({
        tick: vi.fn(),
        success: vi.fn(),
      });

      const repo = new Gilmore(hostGitRoot());
      await repo.init();
    });
    describe('layouts', () => {
      it('should build the module layout by default', async () => {
        const mockedRun = vi.fn();
        vi.spyOn(__, 'moduleLayout').mockReturnValue({
          run: mockedRun,
        });

        await run({});

        expect(mockedRun).toHaveBeenCalled();
      });
      it('should build the libdocs layout with --libdocs', async () => {
        const mockedRun = vi.fn();
        vi.spyOn(__, 'libdocsLayout').mockReturnValue({
          run: mockedRun,
        });

        await run({ libdocs: true });

        expect(mockedRun).toHaveBeenCalled();
      });
      it('should build the monorepo layout with --monorepo', async () => {
        const mockedRun = vi.fn();
        vi.spyOn(__, 'monorepoLayout').mockReturnValue({
          run: mockedRun,
        });

        await run({ monorepo: true });

        expect(mockedRun).toHaveBeenCalled();
      });
      it('should throw an error if both --libdocs and --monorepo are passed', async () => {
        let actual = null;
        try {
          await run({ monorepo: true, libdocs: true });
        } catch (err) {
          actual = err;
        }
        expect(actual).toHaveProperty(
          'code',
          'ABERLAAS_INIT_LAYOUT_INCOMPATIBLE',
        );
      });
    });
  });
  describe('package.json', () => {
    // Note: yarn doesn't automatically preserve the +x bit, so we need to
    // configure it
    it('all template scripts should be marked as executable once published', async () => {
      const aberlaasInitRoot = packageRoot();
      const packageJson = await readJson(`${aberlaasInitRoot}/package.json`);
      const executableFiles = packageJson.publishConfig.executableFiles;

      const scriptTemplates = await glob('templates/scripts/**/*', {
        cwd: aberlaasInitRoot,
        absolutePaths: false,
        directories: false,
      });

      expect(executableFiles).toEqual(scriptTemplates);
    });
  });
});
