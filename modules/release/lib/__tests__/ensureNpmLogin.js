import { emptyDir, firostError, read, tmpDirectory, writeJson } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { __, ensureNpmLogin } from '../ensureNpmLogin.js';

describe('ensureNpmLogin', () => {
  const testDirectory = tmpDirectory('aberlaas/release/ensureNpmLogin');
  beforeEach(async () => {
    await emptyDir(testDirectory);
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
    vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(testDirectory);
    vi.spyOn(__, 'consoleInfo').mockReturnValue();
  });

  describe('npmRun', () => {
    it('should return stdout when command succeeds', async () => {
      vi.spyOn(__, 'run').mockReturnValue({
        stdout: 'pixelastic',
      });

      const actual = await __.npmRun('whoami');

      expect(actual).toEqual('pixelastic');
      expect(__.run).toHaveBeenCalledWith('npm whoami', {
        stdout: false,
        stderr: false,
      });
    });

    it('should throw formatted error for EXXX', async () => {
      vi.spyOn(__, 'run').mockRejectedValue({
        stderr: 'npm error code E123\nnpm error 123 Custom Error',
      });

      let actual = null;
      try {
        await __.npmRun('whoami');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_NPM_ERROR_E123');
      expect(actual.message).toContain('123 Custom Error');
    });

    it('should throw the raw error if not a parseable npm one', async () => {
      vi.spyOn(__, 'run').mockRejectedValue({
        stderr: 'Some other error message',
      });

      let actual = null;
      try {
        await __.npmRun('whoami');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NPM_UNKNOWN_ERROR',
      );
      expect(actual.message).toContain('Some other error message');
    });
  });

  describe('displayLoginInstructions', () => {
    beforeEach(async () => {
      await writeJson({ name: 'my-package' }, `${testDirectory}/package.json`);
    });

    it('should display all instructions with generated token name and package name', async () => {
      await __.displayLoginInstructions();

      expect(__.consoleInfo).toHaveBeenCalledWith(
        'Token name*: ABERLAAS_RELEASE_MY_PACKAGE',
      );
      expect(__.consoleInfo).toHaveBeenCalledWith(
        '🔘 Only select packages and scopes: my-package',
      );
    });
  });

  describe('saveNpmToken', () => {
    it('should prompt for token and write it to .npmrc file', async () => {
      vi.spyOn(__, 'prompt').mockReturnValue('npm_mySecretToken123');

      await __.saveNpmToken();

      const npmrcPath = helper.hostGitPath('.npmrc');
      const actual = await read(npmrcPath);
      expect(actual).toEqual(
        '//registry.npmjs.org/:_authToken=npm_mySecretToken123',
      );
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
      { input: 'my-package', expected: 'ABERLAAS_RELEASE_MY_PACKAGE' },
      {
        input: '@scope/my-package',
        expected: 'ABERLAAS_RELEASE_SCOPE_MY_PACKAGE',
      },
    ])('$input → $expected', ({ input, expected }) => {
      const actual = __.generateTokenName(input);

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

  describe('ensureNpmLogin', () => {
    it('should return true when already authenticated', async () => {
      vi.spyOn(__, 'npmRun').mockReturnValue('pixelastic');

      const actual = await ensureNpmLogin();

      expect(actual).toEqual(true);
      expect(__.npmRun).toHaveBeenCalledWith('whoami');
    });

    it('should call waitForNpmLogin when not authenticated (E401)', async () => {
      vi.spyOn(__, 'npmRun').mockImplementation(() => {
        throw firostError(
          'ABERLAAS_RELEASE_NPM_ERROR_E401',
          'Not authenticated',
        );
      });
      vi.spyOn(__, 'waitForNpmLogin').mockReturnValue();

      await ensureNpmLogin();

      expect(__.waitForNpmLogin).toHaveBeenCalled();
    });

    it('should re-throw error when npm fails with non-E401 error', async () => {
      vi.spyOn(__, 'npmRun').mockImplementation(() => {
        throw firostError('ABERLAAS_RELEASE_NPM_ERROR_E711', 'Another error');
      });
      vi.spyOn(__, 'waitForNpmLogin').mockReturnValue();

      let actual = null;
      try {
        await ensureNpmLogin();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_NPM_ERROR_E711');
      expect(__.waitForNpmLogin).not.toHaveBeenCalled();
    });
  });
});
