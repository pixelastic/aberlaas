const module = require('../autoRelease.js');
const tempy = require('tempy');
const helper = require('../../../helper.js');
const testRepo = async function() {
  await module.gitRun('git init');
  return {
    async commit(commitMessage) {
      await module.gitRun(`git commit --allow-empty -m "${commitMessage}"`);
    },
    async tag(tagName) {
      await module.gitRun(`git tag "${tagName}"`);
    },
  };
};

describe('ci > autoRelease', () => {
  beforeEach(async () => {
    const tmpRepoPath = tempy.directory();
    jest.spyOn(helper, 'hostPath').mockReturnValue(tmpRepoPath);
  });
  describe('getCommitsSinceLastRelease', () => {
    it('should return from the repo creation if no release', async () => {
      const repo = await testRepo();
      await repo.commit('First commit');
      await repo.commit('Second commit');

      const actual = await module.getCommitsSinceLastRelease(repo.path);
      expect(actual).toEqual(['First commit', 'Second commit']);
    });
    it('should return from last rlease', async () => {
      const repo = await testRepo();
      await repo.commit('First commit');
      await repo.commit('Second commit');
      await repo.tag('v1.0.0');
      await repo.commit('Third commit');
      await repo.commit('Fourth commit');

      const actual = await module.getCommitsSinceLastRelease(repo.path);
      expect(actual).toEqual(['Third commit', 'Fourth commit']);
    });
  });
  describe('getReleaseVersion', () => {
    describe('patch', () => {
      it('at least one fix', async () => {
        const repo = await testRepo();
        await repo.commit('chore(lint): Lint files');
        await repo.commit('fix(pull): Allow pulling');

        const actual = await module.getReleaseVersion(repo.path);
        expect(actual).toEqual('patch');
      });
    });
    describe('minor', () => {
      it('at least one feature', async () => {
        const repo = await testRepo();
        await repo.commit('feat(push): Can now push');
        await repo.commit('fix(push): Fix push');

        const actual = await module.getReleaseVersion(repo.path);
        expect(actual).toEqual('minor');
      });
    });
    describe('nothing', () => {
      it('no specific commit', async () => {
        const repo = await testRepo();
        await repo.commit('chore(deps): Update deps');
        await repo.commit('test(push): Test push');
        await repo.commit('docs(push): Document push');

        const actual = await module.getReleaseVersion(repo.path);
        expect(actual).toEqual(false);
      });
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'release').mockReturnValue();
    });
    it('should do nothing if no releaseVersion found', async () => {
      jest.spyOn(module, 'getReleaseVersion').mockReturnValue(false);
      await module.run();
      expect(module.release).not.toHaveBeenCalled();
    });
    it('should call a release with no tests and the right releaseVersion', async () => {
      jest.spyOn(module, 'getReleaseVersion').mockReturnValue('minor');
      await module.run();
      expect(module.release).toHaveBeenCalledWith('minor');
    });
  });
  describe('release', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__releaseRun').mockReturnValue();
    });
    it('should pass the correct releaseVersion', async () => {
      await module.release('minor');
      expect(module.__releaseRun).toHaveBeenCalledWith(
        expect.objectContaining({
          _: ['minor'],
        })
      );
    });
    it('should disable tests', async () => {
      await module.release('minor');
      expect(module.__releaseRun).toHaveBeenCalledWith(
        expect.objectContaining({
          test: false,
        })
      );
    });
  });
});
