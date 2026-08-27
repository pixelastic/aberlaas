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
  const trustedPublishPkgD = {
    filepath: '/path/to/package-d/package.json',
    content: { name: 'package-d', version: '1.0.0' },
    isFirstPublish: false,
  };

  const releaseData = {
    newVersion: '2.0.0',
    allPackages: [
      firstPublishA,
      trustedPublishPkg,
      firstPublishB,
      trustedPublishPkgD,
    ],
  };

  beforeEach(() => {
    mockProgress = { tick: vi.fn(), success: vi.fn() };
    vi.spyOn(__, 'spinner').mockReturnValue(mockProgress);
    vi.spyOn(__, 'ensureYarnNpmLogin').mockReturnValue();
    vi.spyOn(__, 'pushToRegistry').mockReturnValue();
    vi.spyOn(__, 'triggerPipeline').mockReturnValue('pipeline-uuid');
    vi.spyOn(__, 'pollPipelineStatus').mockReturnValue();
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

    it('should publish first-publish packages then trigger CI for trusted-publish', async () => {
      let directPublishDone = false;
      __.withOtpRetry.mockImplementation(async (items, callback) => {
        await pMap(items, async (item) => {
          await callback(item, '123456');
        });
        directPublishDone = true;
      });
      __.triggerPipeline.mockImplementation(() => {
        if (!directPublishDone) {
          throw new Error('triggerPipeline called before direct publish');
        }
        return 'pipeline-uuid';
      });

      await publishToNpm(releaseData);

      expect(__.triggerPipeline).toHaveBeenCalledWith('v2.0.0', [
        'package-c',
        'package-d',
      ]);
      expect(__.pollPipelineStatus).toHaveBeenCalledWith('pipeline-uuid');
    });

    it('should skip CI trigger when all packages are first-publish', async () => {
      const onlyFirstPublish = {
        ...releaseData,
        allPackages: [firstPublishA, firstPublishB],
      };
      await publishToNpm(onlyFirstPublish);

      expect(__.triggerPipeline).not.toHaveBeenCalled();
      expect(__.pollPipelineStatus).not.toHaveBeenCalled();
    });

    it('should skip direct publish when no packages are first-publish', async () => {
      const onlyTrusted = {
        ...releaseData,
        allPackages: [trustedPublishPkg, trustedPublishPkgD],
      };
      await publishToNpm(onlyTrusted);

      expect(__.ensureYarnNpmLogin).not.toHaveBeenCalled();
      expect(__.withOtpRetry).not.toHaveBeenCalled();
      expect(__.pushToRegistry).not.toHaveBeenCalled();
      expect(__.triggerPipeline).toHaveBeenCalledWith('v2.0.0', [
        'package-c',
        'package-d',
      ]);
      expect(__.pollPipelineStatus).toHaveBeenCalled();
    });
  });
});
