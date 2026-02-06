import { remove, tmpDirectory } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { getLastReleasePoint } from '../helper.js';

describe('helper', () => {
  const testDirectory = tmpDirectory('aberlaas/release/helpers');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('getLastReleasePoint', () => {
    it('should return the tag name when the tag exists', async () => {
      const repo = new Gilmore(testDirectory);
      await repo.init();
      await repo.newFile('README.md');
      await repo.commitAll('Initial commit');
      await repo.createTag('v1.2.3');

      const actual = await getLastReleasePoint('1.2.3');

      expect(actual).toEqual('v1.2.3');
    });

    it('should return null when the tag does not exist', async () => {
      const repo = new Gilmore(testDirectory);
      await repo.init();
      await repo.newFile('README.md');
      await repo.commitAll('Initial commit');

      const actual = await getLastReleasePoint('1.2.3');

      expect(actual).toEqual(null);
    });
  });
});
