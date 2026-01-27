import Gilmore from 'gilmore';
import { read, remove, tmpDirectory } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { nodeVersion } from 'aberlaas-versions';
import { __, configureGit, configureNode, run } from '../main.js';

describe('init', () => {
  const testDirectory = tmpDirectory('aberlaas/init');
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
  });
  afterEach(async () => {
    await remove(helper.hostGitRoot());
  });
  // CONFIGURE
  describe('configureGit', () => {
    it('should change the default git hooksPath', async () => {
      const repo = new Gilmore(helper.hostGitRoot());
      await repo.init();

      await configureGit();

      const actual = await repo.getConfig('core.hooksPath');
      expect(actual).toBe('scripts/hooks');
    });
  });
  describe('configureNode', () => {
    it('should set a .nvmrc file', async () => {
      await configureNode();

      const actual = await read(helper.hostGitPath('.nvmrc'));

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

      const repo = new Gilmore(helper.hostGitRoot());
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
});
