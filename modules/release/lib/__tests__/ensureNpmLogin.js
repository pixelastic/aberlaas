import { remove, tmpDirectory, writeJson } from 'firost';
import { __ as helper, mockHelperPaths } from 'aberlaas-helper';
import { __, ensureNpmLogin } from '../ensureNpmLogin.js';

describe('ensureNpmLogin', () => {
  const testDirectory = tmpDirectory('aberlaas/release/ensureNpmLogin');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
    vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(testDirectory);
    vi.spyOn(__, 'consoleInfo').mockReturnValue();
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('ensureNpmLogin', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'waitForNpmLogin').mockReturnValue();
    });
    it('should return true when already authenticated', async () => {
      vi.spyOn(__, 'isAuthenticated').mockReturnValue(true);

      const actual = await ensureNpmLogin();

      expect(actual).toEqual(true);
      expect(__.waitForNpmLogin).not.toHaveBeenCalled();
    });

    it('should call waitForNpmLogin when not authenticated (E401)', async () => {
      vi.spyOn(__, 'isAuthenticated').mockReturnValue(false);

      await ensureNpmLogin();

      expect(__.waitForNpmLogin).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'getNpmAuthToken').mockReturnValue();
    });
    it('should all yarn npm whoami with the right npm token', async () => {
      vi.spyOn(__, 'getNpmAuthToken').mockReturnValue('test_token_123');
      vi.spyOn(__, 'run').mockReturnValue();

      await __.isAuthenticated();

      expect(__.run).toHaveBeenCalledWith('yarn npm whoami', {
        stderr: false,
        stdout: false,
        env: {
          ABERLAAS_RELEASE_NPM_AUTH_TOKEN: 'test_token_123',
        },
      });
    });
    it('should return true if yarn npm login suceeds', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      const actual = await __.isAuthenticated();
      expect(actual).toEqual(true);
    });
    it('should return false if yarn npm login throw an error', async () => {
      vi.spyOn(__, 'run').mockImplementation(() => {
        throw new Error('Some error');
      });

      const actual = await __.isAuthenticated();
      await expect(actual).toEqual(false);
    });
  });

  describe('displayLoginInstructions', () => {
    beforeEach(async () => {
      await writeJson({ name: 'my-package' }, `${testDirectory}/package.json`);
    });

    it('should display all required token configuration instructions', async () => {
      await __.displayLoginInstructions();

      // Unique name per package
      expect(__.consoleInfo).toHaveBeenCalledWith(
        'Token name*: ABERLAAS_RELEASE_MY_PACKAGE',
      );
      // Bypass 2FA
      expect(__.consoleInfo).toHaveBeenCalledWith(
        '☑️ Bypass two-factor authentication (2FA)',
      );
      // Permissions to write
      expect(__.consoleInfo).toHaveBeenCalledWith(
        'Permissions: Read and write',
      );
      // I wish we could use scoped packages, but NPM doesn't allow scoping to
      // a package that does not yet exist. So if we scope, any new package
      // to a monorepo later would get rejected on publish, resulting in borked
      // published modules.
      // So, better to use a broad token.
      expect(__.consoleInfo).toHaveBeenCalledWith('🔘 All packages');

      // Expiration date
      expect(__.consoleInfo).toHaveBeenCalledWith('Expiration date: 90 days');
    });
  });

  describe('saveNpmToken', () => {
    it('should prompt for token and save it using helper', async () => {
      vi.spyOn(__, 'prompt').mockReturnValue('npm_mySecretToken123');
      vi.spyOn(__, 'setNpmAuthToken').mockResolvedValue();

      await __.saveNpmToken();

      expect(__.setNpmAuthToken).toHaveBeenCalledWith('npm_mySecretToken123');
    });
  });

  describe('waitForNpmLogin', () => {
    it('should orchestrate login workflow and retry ensureNpmLogin', async () => {
      vi.spyOn(__, 'consoleWarn').mockReturnValue();
      vi.spyOn(__, 'displayLoginInstructions').mockReturnValue();
      vi.spyOn(__, 'openBrowserForToken').mockReturnValue();
      vi.spyOn(__, 'saveNpmToken').mockReturnValue();
      vi.spyOn(__, 'ensureNpmLogin').mockReturnValue();

      await __.waitForNpmLogin();

      expect(__.consoleWarn).toHaveBeenCalled();
      expect(__.displayLoginInstructions).toHaveBeenCalled();
      expect(__.openBrowserForToken).toHaveBeenCalled();
      expect(__.saveNpmToken).toHaveBeenCalled();
      expect(__.ensureNpmLogin).toHaveBeenCalled();
    });
  });

  describe('generateTokenName', () => {
    it.each([
      {
        packageJson: { name: 'my-package' },
        expected: 'ABERLAAS_RELEASE_MY_PACKAGE',
      },
      {
        packageJson: { name: '@scope/my-package' },
        expected: 'ABERLAAS_RELEASE_SCOPE_MY_PACKAGE',
      },
      {
        packageJson: { name: 'my-project-monorepo', workspaces: ['modules/*'] },
        expected: 'ABERLAAS_RELEASE_MY_PROJECT',
      },
      {
        packageJson: { name: 'my-project-root', workspaces: ['docs', 'lib'] },
        expected: 'ABERLAAS_RELEASE_MY_PROJECT',
      },
      {
        packageJson: { name: 'get-git-root' },
        expected: 'ABERLAAS_RELEASE_GET_GIT_ROOT',
      },
      // {
      //   packageJson: { name: 'my-monorepo-tool' },
      //   expected: 'ABERLAAS_RELEASE_MY_MONOREPO_TOOL',
      // },
    ])('$packageJson.name → $expected', ({ packageJson, expected }) => {
      const actual = __.generateTokenName(packageJson);

      expect(actual).toEqual(expected);
    });
  });

  describe('openBrowserForToken', () => {
    it('should prompt, get username, build URL, open browser, and sleep', async () => {
      vi.spyOn(__, 'getNpmUsername').mockReturnValue('my-username');
      vi.spyOn(__, 'buildTokenUrl').mockReturnValue('my-url');
      vi.spyOn(__, 'prompt').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();
      vi.spyOn(__, 'sleep').mockReturnValue();

      await __.openBrowserForToken();
      expect(__.buildTokenUrl).toHaveBeenCalledWith('my-username');
      expect(__.prompt).toHaveBeenCalled();
      expect(__.run).toHaveBeenCalledWith('$BROWSER my-url', expect.anything());
      expect(__.sleep).toHaveBeenCalled();
    });
  });

  describe('getNpmUsername', () => {
    let mockedEnvs = {};
    beforeEach(async () => {
      vi.spyOn(__, 'env').mockImplementation((key) => {
        return mockedEnvs[key];
      });
    });
    it('should return env variable when set', async () => {
      mockedEnvs = { ABERLAAS_NPM_USERNAME: 'pixelastic' };
      const actual = await __.getNpmUsername();

      expect(actual).toEqual('pixelastic');
    });

    it('should prompt user when env variable is undefined', async () => {
      mockedEnvs = {};
      vi.spyOn(__, 'prompt').mockReturnValue('my-user');

      const actual = await __.getNpmUsername();

      expect(actual).toEqual('my-user');
    });

    it('should prompt user when env variable is null', async () => {
      mockedEnvs = { ABERLAAS_NPM_USERNAME: '' };
      vi.spyOn(__, 'prompt').mockReturnValue('my-user');

      const actual = await __.getNpmUsername();

      expect(actual).toEqual('my-user');
    });
  });

  describe('buildTokenUrl', () => {
    it('should build correct URL with username', () => {
      const actual = __.buildTokenUrl('pixelastic');

      expect(actual).toEqual(
        'https://www.npmjs.com/settings/pixelastic/tokens/granular-access-tokens/new',
      );
    });
  });
});
