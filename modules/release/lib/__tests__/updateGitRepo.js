import { readJson, remove, tmpDirectory, writeJson } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { __, updateGitRepo } from '../updateGitRepo.js';

describe('updateGitRepo', () => {
  const testDirectory = tmpDirectory('aberlaas/release/updateGitRepo/repo');
  let repo;

  beforeEach(async () => {
    mockHelperPaths(testDirectory);

    repo = new Gilmore(testDirectory, { globalConfig: false });
    await repo.init();
    await repo.newFile('README.md');
    await repo.commitAll();
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('bumpAllPackageVersions', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
    });
    it('should update only the package.json files passed in releaseData', async () => {
      const releaseData = {
        newVersion: '2.0.0',
        allPackages: [
          {
            filepath: `${testDirectory}/packages/a/package.json`,
            content: { name: 'package-a', version: '1.5.9', author: 'me' },
          },
          {
            filepath: `${testDirectory}/packages/b/package.json`,
            content: {
              name: 'package-b',
              version: '1.5.9',
              description: 'my package',
            },
          },
        ],
      };

      await writeJson(
        releaseData.allPackages[0].content,
        releaseData.allPackages[0].filepath,
      );
      await writeJson(
        releaseData.allPackages[1].content,
        releaseData.allPackages[1].filepath,
      );

      await __.bumpAllPackageVersions(releaseData);

      const packageA = await readJson(releaseData.allPackages[0].filepath);
      const packageB = await readJson(releaseData.allPackages[1].filepath);

      expect(packageA).toEqual({
        name: 'package-a',
        version: '2.0.0',
        author: 'me',
      });
      expect(packageB).toEqual({
        name: 'package-b',
        version: '2.0.0',
        description: 'my package',
      });
    });
  });

  describe.slow('commitTagAndPush', () => {
    const testDirectoryRemote = tmpDirectory(
      'aberlaas/release/updateGitRepo/remote',
    );
    let remote;
    beforeEach(async () => {
      // configure remote
      remote = new Gilmore(testDirectoryRemote, { globalConfig: false });
      remote.init({ bare: true });

      // configure repo
      await repo.setRemote('origin', `file://${testDirectoryRemote}`);
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
    });
    afterEach(async () => {
      await remove(testDirectoryRemote);
    });
    it('should create commit, tag, and push to remote', async () => {
      await repo.newFile('CHANGELOG.md');
      await writeJson(
        { name: 'test-package', version: '2.0.0' },
        `${testDirectory}/package.json`,
      );

      const releaseData = { newVersion: '2.0.0' };
      await __.commitTagAndPush(releaseData);

      const commits = await repo.commitList();
      expect(commits[0]).toHaveProperty('subject', 'v2.0.0');

      const tags = await repo.tagList();
      expect(tags).toEqual([{ name: 'v2.0.0', isCurrent: true }]);

      const remoteCommits = await remote.commitList();
      expect(remoteCommits[0]).toHaveProperty('subject', 'v2.0.0');

      const remoteTags = await remote.tagList();
      expect(remoteTags).toEqual([{ name: 'v2.0.0', isCurrent: true }]);
    });
  });

  describe.slow('updateGitRepo', () => {
    beforeEach(() => {
      vi.spyOn(__, 'updateChangelog').mockReturnValue();
      vi.spyOn(__, 'bumpAllPackageVersions').mockReturnValue();
      vi.spyOn(__, 'commitTagAndPush').mockReturnValue();
    });

    it('should orchestrate all git operations in correct order', async () => {
      const releaseData = {
        skipChangelog: false,
        currentVersion: '1.0.0',
        newVersion: '2.0.0',
      };

      await updateGitRepo(releaseData);

      expect(__.updateChangelog).toHaveBeenCalledWith(releaseData);
      expect(__.bumpAllPackageVersions).toHaveBeenCalledWith(releaseData);
      expect(__.commitTagAndPush).toHaveBeenCalledWith(releaseData);
    });
  });
});
