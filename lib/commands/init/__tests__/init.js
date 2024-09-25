import Gilmore from 'gilmore';
import { read, remove, tmpDirectory } from 'firost';
import current from '../index.js';
import helper from '../../../helper.js';
import nodeConfig from '../../../configs/node.cjs';

describe('init', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory('aberlaas/init'));
  });
  afterEach(async () => {
    await remove(helper.hostRoot());
  });
  // CONFIGURE
  describe('configureGit', () => {
    it('should change the default git hooksPath', async () => {
      const repo = new Gilmore(helper.hostRoot());
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

      expect(actual).toEqual(nodeConfig.nodeVersion);
    });
  });

  // TODO: Check that the tree structure is different if --monorepo is passed or
  // not
  // Test the creation of some dedicated files
});
