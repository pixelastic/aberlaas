import { exists, read, remove, tmpDirectory, write } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import { npmVersion } from 'aberlaas-versions';
import Gilmore from 'gilmore';
import {
  __,
  ensureNpmLogin,
  isFirstPublish,
  registerTrustedPublisher,
  removeLegacyNpmAuth,
} from '../npm.js';

describe('release/helpers/npm', () => {
  describe('ensureNpmLogin', () => {
    let mockProgress;
    beforeEach(() => {
      mockProgress = { tick: vi.fn(), success: vi.fn(), info: vi.fn() };
      vi.spyOn(__, 'spinner').mockReturnValue(mockProgress);
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();
    });

    it('should show spinner while checking authentication', async () => {
      vi.spyOn(__, 'isAuthenticated').mockReturnValue(true);

      await ensureNpmLogin();

      expect(mockProgress.tick).toHaveBeenCalledWith(
        'Checking npm authentication...',
      );
    });

    it('should show success when already authenticated', async () => {
      vi.spyOn(__, 'isAuthenticated').mockReturnValue(true);

      await ensureNpmLogin();

      expect(mockProgress.success).toHaveBeenCalledWith('Authenticated to npm');
      expect(__.run).not.toHaveBeenCalled();
    });

    it('should stop spinner with info before npm login', async () => {
      vi.spyOn(__, 'isAuthenticated')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      await ensureNpmLogin();

      expect(mockProgress.info).toHaveBeenCalledWith(
        'Opening npm login (required for trusted publisher registration)...',
      );
    });

    it('should run npm login interactively', async () => {
      vi.spyOn(__, 'isAuthenticated')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      await ensureNpmLogin();

      expect(__.run).toHaveBeenCalledWith(
        `npx npm@${npmVersion} login --loglevel=warn`,
        { stdin: true },
      );
    });
  });

  describe('isAuthenticated', () => {
    it('should call npm whoami with suppressed output', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      await __.isAuthenticated();

      expect(__.run).toHaveBeenCalledWith(`npx npm@${npmVersion} whoami`, {
        stderr: false,
        stdout: false,
      });
    });

    it('should return true when whoami succeeds', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      const actual = await __.isAuthenticated();

      expect(actual).toEqual(true);
    });

    it('should return false when whoami fails', async () => {
      vi.spyOn(__, 'run').mockImplementation(() => {
        throw new Error('not logged in');
      });

      const actual = await __.isAuthenticated();

      expect(actual).toEqual(false);
    });
  });

  describe('registerTrustedPublisher', () => {
    const registrationOptions = {
      packageName: '@scope/my-package',
      otp: '654321',
      circleciOrgId: 'org-uuid',
      circleciProjectId: 'proj-uuid',
      circleciPipelineDefinitionId: 'pipe-uuid',
      vcsOrigin: 'gh/owner/repo',
    };

    it('should run npm trust circleci with --yes and OTP via env var', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      await registerTrustedPublisher(registrationOptions);

      expect(__.run).toHaveBeenCalledWith(
        [
          'npx',
          `npm@${npmVersion}`,
          'trust',
          'circleci',
          '@scope/my-package',
          '--org-id',
          'org-uuid',
          '--project-id',
          'proj-uuid',
          '--pipeline-definition-id',
          'pipe-uuid',
          '--vcs-origin',
          'gh/owner/repo',
          '--allow-publish',
          '--yes',
        ],
        { env: { npm_config_otp: '654321' } },
      );
    });

    it('should succeed when npm returns "already registered" error', async () => {
      const error = new Error('Command failed with exit code 1');
      error.stderr =
        'npm error code E409\nnpm error 409 Conflict - POST https://registry.npmjs.org/-/package/@scope%2Fmy-package/trust';
      vi.spyOn(__, 'run').mockImplementation(() => {
        throw error;
      });

      let actual = null;
      try {
        await registerTrustedPublisher(registrationOptions);
      } catch (err) {
        actual = err;
      }
      expect(actual).toEqual(null);
    });

    it('should throw when npm returns a non-registration error', async () => {
      const error = new Error('Command failed with exit code 1');
      error.stderr =
        'npm error code E403\nnpm error 403 Forbidden - POST https://registry.npmjs.org/-/package/@scope%2Fmy-package/trust';
      vi.spyOn(__, 'run').mockImplementation(() => {
        throw error;
      });

      let actual = null;
      try {
        await registerTrustedPublisher(registrationOptions);
      } catch (err) {
        actual = err;
      }
      expect(actual).toEqual(error);
    });
  });

  describe('isFirstPublish', () => {
    it.each([
      {
        title: 'registry returns 404',
        status: 404,
        expected: true,
      },
      {
        title: 'registry returns 200',
        status: 200,
        expected: false,
      },
    ])('should return $expected when $title', async ({ status, expected }) => {
      vi.spyOn(__, 'fetch').mockReturnValue({ status });

      const actual = await isFirstPublish('my-package');

      expect(actual).toEqual(expected);
    });

    it('should encode scoped package names correctly', async () => {
      vi.spyOn(__, 'fetch').mockReturnValue({ status: 404 });

      await isFirstPublish('@scope/my-package');

      expect(__.fetch).toHaveBeenCalledWith(
        'https://registry.npmjs.org/@scope%2fmy-package',
        { method: 'HEAD' },
      );
    });
  });

  it.slow('removeLegacyNpmAuth', async () => {
    const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
    mockHelperPaths(testDirectory);

    const repo = new Gilmore(testDirectory);
    await repo.init();
    await repo.newFile('README.md');
    await repo.commitAll('Initial commit');

    await write(
      dedent`
        nodeLinker: node-modules
        npmAuthToken: secret-token-123
        yarnPath: .yarn/releases/yarn-4.0.0.cjs
      `,
      `${testDirectory}/.yarnrc.yml`,
    );
    await repo.add('.yarnrc.yml');
    await repo.commit('add yarnrc');
    await write('NPM_TOKEN=legacy-token', `${testDirectory}/.env`);

    const actual = await removeLegacyNpmAuth();

    expect(actual).toEqual(true);
    const yarnrcContent = await read(`${testDirectory}/.yarnrc.yml`);
    expect(yarnrcContent).toEqual(dedent`
      nodeLinker: node-modules
      yarnPath: .yarn/releases/yarn-4.0.0.cjs
    `);

    const lastCommit = (await repo.commitList())[0];
    expect(lastCommit).toHaveProperty(
      'subject',
      'chore(release): remove legacy npm auth token',
    );

    const envExists = await exists(`${testDirectory}/.env`);
    expect(envExists).toEqual(false);

    await remove(testDirectory);
  });
});
