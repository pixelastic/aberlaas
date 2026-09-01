import { firostError } from 'firost';
import { __, ensureTrustedPublishing } from '../ensureTrustedPublishing.js';
import * as npmHelpers from '../helpers/npm.js';

describe('release/ensureTrustedPublishing', () => {
  const trustConfig = {
    circleciOrgId: 'org-123',
    circleciProjectId: 'proj-456',
    circleciPipelineDefinitionId: 'pipe-789',
    vcsOrigin: 'github/acme/repo',
  };

  let releaseData;
  let mockRepo;

  beforeEach(() => {
    // Rich context: mix of first-publish, registered, and unregistered
    releaseData = {
      allPackages: [
        {
          content: { name: 'pkg-a' },
          isFirstPublish: false,
          hasTrustedPublisher: true,
        },
        {
          content: { name: 'pkg-b' },
          isFirstPublish: false,
          hasTrustedPublisher: false,
        },
        {
          content: { name: 'pkg-c' },
          isFirstPublish: true,
          hasTrustedPublisher: false,
        },
      ],
    };

    mockRepo = {
      currentCommit: vi.fn().mockReturnValue('abc123'),
      push: vi.fn().mockReturnValue(),
    };

    vi.spyOn(__, 'consoleInfo').mockReturnValue();
    vi.spyOn(__, 'spinner').mockReturnValue({
      tick: vi.fn(),
      success: vi.fn(),
    });
    vi.spyOn(__, 'ensureCircleciToken').mockReturnValue();
    vi.spyOn(__, 'ensureRepoConfig').mockReturnValue();
    vi.spyOn(__, 'getCircleciTrustConfig').mockReturnValue(trustConfig);
    vi.spyOn(__, 'ensureNpmLogin').mockReturnValue();
    vi.spyOn(__, 'registerTrustedPublishers').mockReturnValue();
  });

  it('should skip entirely when all packages are first-publish', async () => {
    releaseData.allPackages = [
      {
        content: { name: 'pkg-x' },
        isFirstPublish: true,
        hasTrustedPublisher: false,
      },
      {
        content: { name: 'pkg-y' },
        isFirstPublish: true,
        hasTrustedPublisher: false,
      },
    ];

    await ensureTrustedPublishing(releaseData);

    expect(__.ensureCircleciToken).not.toHaveBeenCalled();
  });

  it('should not call ensureNpmLogin when all packages have hasTrustedPublisher', async () => {
    releaseData.allPackages = [
      {
        content: { name: 'pkg-a' },
        isFirstPublish: false,
        hasTrustedPublisher: true,
      },
      {
        content: { name: 'pkg-b' },
        isFirstPublish: false,
        hasTrustedPublisher: true,
      },
    ];

    await ensureTrustedPublishing(releaseData);

    expect(__.ensureNpmLogin).not.toHaveBeenCalled();
  });

  it('should not call getCircleciTrustConfig when all packages have hasTrustedPublisher', async () => {
    releaseData.allPackages = [
      {
        content: { name: 'pkg-a' },
        isFirstPublish: false,
        hasTrustedPublisher: true,
      },
      {
        content: { name: 'pkg-b' },
        isFirstPublish: false,
        hasTrustedPublisher: true,
      },
    ];

    await ensureTrustedPublishing(releaseData);

    expect(__.getCircleciTrustConfig).not.toHaveBeenCalled();
  });

  it('should call ensureNpmLogin when some packages lack hasTrustedPublisher', async () => {
    await ensureTrustedPublishing(releaseData);

    expect(__.ensureNpmLogin).toHaveBeenCalled();
  });

  it('should call ensureRepoConfig even when all packages have hasTrustedPublisher', async () => {
    releaseData.allPackages = [
      {
        content: { name: 'pkg-a' },
        isFirstPublish: false,
        hasTrustedPublisher: true,
      },
      {
        content: { name: 'pkg-b' },
        isFirstPublish: false,
        hasTrustedPublisher: true,
      },
    ];

    await ensureTrustedPublishing(releaseData);

    expect(__.ensureRepoConfig).toHaveBeenCalled();
  });

  it('should only register packages that lack hasTrustedPublisher', async () => {
    await ensureTrustedPublishing(releaseData);

    expect(__.registerTrustedPublishers).toHaveBeenCalledWith(
      ['pkg-b'],
      trustConfig,
    );
  });

  it('should throw when CircleCI token is missing', async () => {
    vi.spyOn(__, 'ensureCircleciToken').mockImplementation(() => {
      throw firostError('ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN', 'no token');
    });

    let actual = null;
    try {
      await ensureTrustedPublishing(releaseData);
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN');
  });

  describe('ensureRepoConfig', () => {
    beforeEach(() => {
      vi.spyOn(__, 'ensureRepoConfig').mockRestore();
      vi.spyOn(__, 'createRepo').mockReturnValue(mockRepo);
      vi.spyOn(__, 'removeLegacyNpmAuth').mockReturnValue(false);
      vi.spyOn(__, 'hasPublishWorkflow').mockReturnValue(true);
      vi.spyOn(__, 'addPublishWorkflow').mockReturnValue();
    });

    it('should log when legacy npm auth was cleaned up', async () => {
      vi.spyOn(__, 'removeLegacyNpmAuth').mockReturnValue(true);

      await __.ensureRepoConfig();

      expect(__.consoleInfo).toHaveBeenCalledWith(
        'Removed legacy npm auth from repo',
      );
    });

    it('should not log when no legacy npm auth cleanup was needed', async () => {
      await __.ensureRepoConfig();

      expect(__.consoleInfo).not.toHaveBeenCalledWith(
        'Removed legacy npm auth from repo',
      );
    });

    it('should call addPublishWorkflow when workflow is missing', async () => {
      vi.spyOn(__, 'hasPublishWorkflow').mockReturnValue(false);

      await __.ensureRepoConfig();

      expect(__.addPublishWorkflow).toHaveBeenCalled();
    });

    it('should skip addPublishWorkflow when workflow exists', async () => {
      await __.ensureRepoConfig();

      expect(__.addPublishWorkflow).not.toHaveBeenCalled();
    });

    it('should push after commits from removeLegacyNpmAuth and/or addPublishWorkflow', async () => {
      mockRepo.currentCommit
        .mockReturnValueOnce('sha-before')
        .mockReturnValueOnce('sha-after');

      await __.ensureRepoConfig();

      expect(mockRepo.push).toHaveBeenCalled();
    });

    it('should skip push when no commits were created', async () => {
      await __.ensureRepoConfig();

      expect(mockRepo.push).not.toHaveBeenCalled();
    });
  });

  describe('registerTrustedPublishers', () => {
    beforeEach(() => {
      vi.spyOn(__, 'registerTrustedPublishers').mockRestore();
      vi.spyOn(npmHelpers, 'registerTrustedPublisher').mockReturnValue();
      vi.spyOn(__, 'withOtpRetry').mockImplementation(
        async (items, callback) => {
          for (const item of items) {
            await callback(item, '123456');
          }
        },
      );
    });

    it('should show context message before OTP prompt', async () => {
      await __.registerTrustedPublishers(['pkg-a', 'pkg-b'], trustConfig);

      expect(__.consoleInfo).toHaveBeenCalledWith(
        'Registering trusted publishers for 2 package(s) (requires OTP)',
      );
    });

    it('should show registration progress with spinner', async () => {
      const mockSpinner = { tick: vi.fn(), success: vi.fn() };
      vi.spyOn(__, 'spinner').mockReturnValue(mockSpinner);

      await __.registerTrustedPublishers(['pkg-a', 'pkg-b'], trustConfig);

      expect(mockSpinner.tick).toHaveBeenCalledWith(
        'Registering trusted publisher: pkg-a',
      );
      expect(mockSpinner.tick).toHaveBeenCalledWith(
        'Registering trusted publisher: pkg-b',
      );
      expect(mockSpinner.success).toHaveBeenCalledWith(
        'All trusted publishers registered',
      );
    });

    it('should skip when no packages to register', async () => {
      await __.registerTrustedPublishers([], trustConfig);

      expect(__.withOtpRetry).not.toHaveBeenCalled();
    });
  });
});
