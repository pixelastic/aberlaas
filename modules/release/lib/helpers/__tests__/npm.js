import { exists, read, remove, tmpDirectory, write } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import { npmVersion } from 'aberlaas-versions';
import Gilmore from 'gilmore';
import {
  __,
  ensureNpmLogin,
  isFirstPublish,
  isTrustedPublisherRegistered,
  registerTrustedPublisher,
  removeLegacyNpmAuth,
} from '../npm.js';

describe('release/helpers/npm', () => {
  describe('ensureNpmLogin', () => {
    it('should skip login when already authenticated', async () => {
      vi.spyOn(__, 'isAuthenticated').mockReturnValue(true);
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'prompt').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();

      await ensureNpmLogin();

      expect(__.prompt).not.toHaveBeenCalled();
      expect(__.run).not.toHaveBeenCalled();
    });

    it('should explain that login is needed for trusted publisher registration', async () => {
      vi.spyOn(__, 'isAuthenticated')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'prompt').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();

      await ensureNpmLogin();

      expect(__.consoleInfo).toHaveBeenCalledWith(
        'Registering trusted publishers requires npm authentication.',
      );
    });

    it('should prompt user before running npm login', async () => {
      vi.spyOn(__, 'isAuthenticated')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'prompt').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();

      await ensureNpmLogin();

      expect(__.prompt).toHaveBeenCalledWith(
        'Press Enter to open npm login in your browser',
      );
    });

    it('should run npm login with auto-enter and suppressed output', async () => {
      vi.spyOn(__, 'isAuthenticated')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'prompt').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();

      await ensureNpmLogin();

      expect(__.run).toHaveBeenCalledWith(
        `echo | npx npm@${npmVersion} login --loglevel=warn`,
        { shell: true, stdout: false },
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
    it('should run npm trust circleci with all flags', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      await registerTrustedPublisher({
        packageName: '@scope/my-package',
        otp: '654321',
        circleciOrgId: 'org-uuid',
        circleciProjectId: 'proj-uuid',
        circleciPipelineDefinitionId: 'pipe-uuid',
        vcsOrigin: 'gh/owner/repo',
      });

      expect(__.run).toHaveBeenCalledWith([
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
        '--otp',
        '654321',
      ]);
    });
  });

  describe('isTrustedPublisherRegistered', () => {
    const matchingProjectId = 'abc-123-def';

    beforeEach(() => {
      vi.spyOn(__, 'fetch').mockReturnValue({
        json: () => [
          {
            type: 'circleci',
            claims: { 'oidc.circleci.com/project-id': matchingProjectId },
          },
          {
            type: 'github-actions',
            claims: { repository: 'owner/repo' },
          },
          {
            type: 'circleci',
            claims: { 'oidc.circleci.com/project-id': 'other-id' },
          },
        ],
      });
    });

    it.each([
      {
        title: 'matching CircleCI publisher found',
        projectId: matchingProjectId,
        expected: true,
      },
      {
        title: 'different projectId',
        projectId: 'wrong-id',
        expected: false,
      },
      {
        title: 'empty array',
        fetchResponse: [],
        projectId: matchingProjectId,
        expected: false,
      },
      {
        title: 'only GitHub publishers',
        fetchResponse: [
          { type: 'github-actions', claims: { repository: 'owner/repo' } },
        ],
        projectId: matchingProjectId,
        expected: false,
      },
    ])('$title', async ({ projectId, fetchResponse, expected }) => {
      if (fetchResponse) {
        vi.spyOn(__, 'fetch').mockReturnValue({ json: () => fetchResponse });
      }

      const actual = await isTrustedPublisherRegistered(
        'my-package',
        projectId,
      );

      expect(actual).toEqual(expected);
    });

    it('should encode scoped package names', async () => {
      await isTrustedPublisherRegistered(
        '@scope/my-package',
        matchingProjectId,
      );

      expect(__.fetch).toHaveBeenCalledWith(
        'https://registry.npmjs.org/-/package/@scope%2fmy-package/trust',
      );
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
