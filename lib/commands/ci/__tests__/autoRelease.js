const current = require('../autoRelease.js');
const helper = require('../../../helper.js');
const emptyDir = require('firost/lib/emptyDir');
const mkdirp = require('firost/lib/mkdirp');
const path = require('path');
const ciInfo = require('ci-info');
const testRepo = async function () {
  await current.gitRun('git init');
  if (ciInfo.isCI) {
    await current.gitRun('git config user.name Tester');
    await current.gitRun('git config user.email tester@aberlaas.com');
  }
  return {
    async commit(commitMessage) {
      await current.gitRun(`git commit --allow-empty -m "${commitMessage}"`);
    },
    async tag(tagName) {
      await current.gitRun(`git tag "${tagName}"`);
    },
  };
};

describe('ci > autoRelease', () => {
  beforeEach(async () => {
    const tmpRepoPath = path.resolve('./tmp/ci/autoRelease/');
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpRepoPath);
    await mkdirp(helper.hostRoot());
    await emptyDir(helper.hostRoot());
  });
  describe('getCommitsSinceLastRelease', () => {
    it('should return from the repo creation if no release', async () => {
      const repo = await testRepo();
      await repo.commit('First commit');
      await repo.commit('Second commit');

      const actual = await current.getCommitsSinceLastRelease(repo.path);
      expect(actual).toEqual(['First commit', 'Second commit']);
    });
    it('should return from last release', async () => {
      const repo = await testRepo();
      await repo.commit('First commit');
      await repo.commit('Second commit');
      await repo.tag('v1.0.0');
      await repo.commit('Third commit');
      await repo.commit('Fourth commit');

      const actual = await current.getCommitsSinceLastRelease(repo.path);
      expect(actual).toEqual(['Third commit', 'Fourth commit']);
    });
  });
  describe('getReleaseVersion', () => {
    describe('patch', () => {
      it('at least one fix', async () => {
        const repo = await testRepo();
        await repo.commit('chore(lint): Lint files');
        await repo.commit('fix(pull): Allow pulling');

        const actual = await current.getReleaseVersion(repo.path);
        expect(actual).toEqual('patch');
      });
    });
    describe('minor', () => {
      it('at least one feature', async () => {
        const repo = await testRepo();
        await repo.commit('feat(push): Can now push');
        await repo.commit('fix(push): Fix push');

        const actual = await current.getReleaseVersion(repo.path);
        expect(actual).toEqual('minor');
      });
    });
    describe('nothing', () => {
      it('no specific commit', async () => {
        const repo = await testRepo();
        await repo.commit('chore(deps): Update deps');
        await repo.commit('test(push): Test push');
        await repo.commit('docs(push): Document push');

        const actual = await current.getReleaseVersion(repo.path);
        expect(actual).toEqual(false);
      });
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__releaseRun').mockReturnValue();
      jest.spyOn(current, '__consoleInfo').mockReturnValue();
      jest.spyOn(current, 'configureGit').mockReturnValue();
      jest.spyOn(current, 'configureNpm').mockReturnValue();
    });
    it('should do nothing if no releaseVersion found', async () => {
      jest.spyOn(current, 'getReleaseVersion').mockReturnValue(false);
      await current.run();
      expect(current.__releaseRun).not.toHaveBeenCalled();
    });
    it('should pass the correct releaseVersion', async () => {
      jest.spyOn(current, 'getReleaseVersion').mockReturnValue('minor');
      await current.run();
      expect(current.__releaseRun).toHaveBeenCalledWith(
        expect.objectContaining({
          _: ['minor'],
        })
      );
    });
    it('should disable tests', async () => {
      jest.spyOn(current, 'getReleaseVersion').mockReturnValue('minor');
      await current.run();
      expect(current.__releaseRun).toHaveBeenCalledWith(
        expect.objectContaining({
          test: false,
        })
      );
    });
    it('should configure git', async () => {
      jest.spyOn(current, 'getReleaseVersion').mockReturnValue('patch');
      await current.run();
      expect(current.configureGit).toHaveBeenCalled();
    });
    it('should configure npm', async () => {
      jest.spyOn(current, 'getReleaseVersion').mockReturnValue('patch');
      await current.run();
      expect(current.configureNpm).toHaveBeenCalled();
    });
  });
  describe('gitConfigSet', () => {
    beforeEach(async () => {
      await testRepo();
    });
    it('should set a config value', async () => {
      await current.gitConfigSet('aberlaas.test', 'my_value');
      const actual = await current.gitRun('git config aberlaas.test');
      expect(actual).toEqual('my_value');
    });
    it('should not set a config value if already set', async () => {
      await current.gitConfigSet('aberlaas.test', 'first_value');
      await current.gitConfigSet('aberlaas.test', 'second_value');
      const actual = await current.gitRun('git config aberlaas.test');
      expect(actual).toEqual('first_value');
    });
  });
  describe('configureGit', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'gitConfigSet').mockReturnValue();
      jest.spyOn(current, 'getEnvVar').mockImplementation((input) => {
        return input;
      });
    });
    it('should set the user email', async () => {
      await current.configureGit();
      expect(current.gitConfigSet).toHaveBeenCalledWith(
        'user.email',
        'GIT_USER_EMAIL'
      );
    });
    it('should set the user name', async () => {
      await current.configureGit();
      expect(current.gitConfigSet).toHaveBeenCalledWith(
        'user.name',
        'GIT_USER_NAME'
      );
    });
  });
  describe('configureNpm', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__write').mockReturnValue();
      jest.spyOn(current, 'getEnvVar').mockImplementation((input) => {
        return input;
      });
    });
    it('should create a ~/.npmrc file if does not exist', async () => {
      jest.spyOn(current, '__exists').mockReturnValue(false);
      await current.configureNpm();
      expect(current.__write).toHaveBeenCalledWith(
        expect.stringContaining('NPM_TOKEN'),
        '~/.npmrc'
      );
    });
    it('should not change the ~/.npmrc if already there', async () => {
      jest.spyOn(current, '__exists').mockReturnValue(true);
      await current.configureNpm();
      expect(current.__write).not.toHaveBeenCalled();
    });
  });
});
