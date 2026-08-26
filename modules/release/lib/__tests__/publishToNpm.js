import { pMap } from 'golgoth';
import { __, publishToNpm } from '../publishToNpm.js';

describe('release/publishToNpm', () => {
  let mockProgress;

  const firstPublishA = {
    filepath: '/path/to/package-a/package.json',
    content: { name: 'package-a', version: '1.0.0' },
    isFirstPublish: true,
  };
  const firstPublishB = {
    filepath: '/path/to/package-b/package.json',
    content: { name: 'package-b', version: '1.0.0' },
    isFirstPublish: true,
  };
  const trustedPublishPkg = {
    filepath: '/path/to/package-c/package.json',
    content: { name: 'package-c', version: '1.0.0' },
    isFirstPublish: false,
  };

  const releaseData = {
    newVersion: '2.0.0',
    allPackages: [firstPublishA, trustedPublishPkg, firstPublishB],
  };

  beforeEach(() => {
    mockProgress = { tick: vi.fn(), success: vi.fn() };
    vi.spyOn(__, 'spinner').mockReturnValue(mockProgress);
    vi.spyOn(__, 'ensureYarnNpmLogin').mockReturnValue();
    vi.spyOn(__, 'pushToRegistry').mockReturnValue();
    vi.spyOn(__, 'withOtpRetry').mockImplementation(async (items, callback) => {
      await pMap(items, async (item) => {
        await callback(item, '123456');
      });
    });
  });

  describe('publishToNpm', () => {
    it('should publish first-publish packages with --otp flag', async () => {
      await publishToNpm(releaseData);

      expect(__.pushToRegistry).toHaveBeenCalledWith(firstPublishA, {
        otp: '123456',
      });
      expect(__.pushToRegistry).toHaveBeenCalledWith(firstPublishB, {
        otp: '123456',
      });
      expect(__.pushToRegistry).not.toHaveBeenCalledWith(
        trustedPublishPkg,
        expect.anything(),
      );
    });

    it('should call ensureYarnNpmLogin before publishing', async () => {
      let loginCalledBeforePublish = false;
      __.ensureYarnNpmLogin.mockImplementation(() => {
        loginCalledBeforePublish = !__.withOtpRetry.mock.calls.length;
      });

      await publishToNpm(releaseData);

      expect(__.ensureYarnNpmLogin).toHaveBeenCalled();
      expect(loginCalledBeforePublish).toEqual(true);
    });

    it('should retry on OTP expiry via withOtpRetry', async () => {
      await publishToNpm(releaseData);

      expect(__.withOtpRetry).toHaveBeenCalledWith(
        [firstPublishA, firstPublishB],
        expect.any(Function),
      );
    });

    it('should skip trusted-publish packages', async () => {
      const onlyTrusted = {
        ...releaseData,
        allPackages: [trustedPublishPkg],
      };
      await publishToNpm(onlyTrusted);

      expect(__.ensureYarnNpmLogin).not.toHaveBeenCalled();
      expect(__.withOtpRetry).not.toHaveBeenCalled();
      expect(__.pushToRegistry).not.toHaveBeenCalled();
    });
  });

  describe('pushToRegistry', () => {
    beforeEach(() => {
      __.pushToRegistry.mockRestore();
      vi.spyOn(__, 'run').mockReturnValue();
    });

    it('should run yarn npm publish correctly', async () => {
      await __.pushToRegistry(firstPublishA);

      expect(__.run).toHaveBeenCalledWith('yarn npm publish --access public', {
        cwd: '/path/to/package-a',
        stdout: false,
        stderr: false,
      });
    });

    it('should pass otp flag when provided', async () => {
      await __.pushToRegistry(firstPublishA, { otp: '654321' });

      expect(__.run).toHaveBeenCalledWith(
        'yarn npm publish --access public --otp 654321',
        {
          cwd: '/path/to/package-a',
          stdout: false,
          stderr: false,
        },
      );
    });
  });
});
