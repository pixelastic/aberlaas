import Gilmore from 'gilmore';
import { read, remove, tmpDirectory } from 'firost';
import helper from 'aberlaas-helper';
import { nodeVersion } from 'aberlaas-versions';
import current from '../main.js';

describe('init', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(
      tmpDirectory('aberlaas/init'),
    );
  });
  afterEach(async () => {
    await remove(helper.hostGitRoot());
  });
  // CONFIGURE
  describe('configureGit', () => {
    it('should change the default git hooksPath', async () => {
      const repo = new Gilmore(helper.hostGitRoot());
      await repo.init();

      await current.configureGit();

      const actual = await repo.getConfig('core.hooksPath');
      expect(actual).toBe('scripts/hooks');
    });
  });
  describe('configureNode', () => {
    it('should set a .nvmrc file', async () => {
      await current.configureNode();

      const actual = await read(helper.hostPath('.nvmrc'));

      expect(actual).toEqual(nodeVersion);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'configureGit').mockReturnValue();
      vi.spyOn(current, 'configureNode').mockReturnValue();
      vi.spyOn(current, 'yarnInstall').mockReturnValue();
      vi.spyOn(current, '__consoleInfo').mockReturnValue();
      vi.spyOn(current, '__spinner').mockReturnValue({
        tick: vi.fn(),
        success: vi.fn(),
      });

      const repo = new Gilmore(helper.hostGitRoot());
      await repo.init();
    });
    describe('layouts', () => {
      it('should build the module layout by default', async () => {
        const mockedRun = vi.fn();
        vi.spyOn(current, '__moduleLayout').mockReturnValue({
          run: mockedRun,
        });

        await current.run({});

        expect(mockedRun).toHaveBeenCalled();
      });
      it('should build the libdocs layout with --libdocs', async () => {
        const mockedRun = vi.fn();
        vi.spyOn(current, '__libdocsLayout').mockReturnValue({
          run: mockedRun,
        });

        await current.run({ libdocs: true });

        expect(mockedRun).toHaveBeenCalled();
      });
      it('should build the monorepo layout with --monorepo', async () => {
        const mockedRun = vi.fn();
        vi.spyOn(current, '__monorepoLayout').mockReturnValue({
          run: mockedRun,
        });

        await current.run({ monorepo: true });

        expect(mockedRun).toHaveBeenCalled();
      });
      it('should throw an error if both --libdocs and --monorepo are passed', async () => {
        let actual = null;
        try {
          await current.run({ monorepo: true, libdocs: true });
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
