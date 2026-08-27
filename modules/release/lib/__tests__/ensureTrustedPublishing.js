import { firostError } from 'firost';
import { __, ensureTrustedPublishing } from '../ensureTrustedPublishing.js';

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
    releaseData = {
      allPackages: [
        { content: { name: 'pkg-a' }, isFirstPublish: false },
        { content: { name: 'pkg-b' }, isFirstPublish: false },
        { content: { name: 'pkg-c' }, isFirstPublish: true },
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
    vi.spyOn(__, 'createRepo').mockReturnValue(mockRepo);
    vi.spyOn(__, 'ensureCircleciToken').mockReturnValue();
    vi.spyOn(__, 'removeLegacyNpmAuth').mockReturnValue(false);
    vi.spyOn(__, 'hasPublishWorkflow').mockReturnValue(true);
    vi.spyOn(__, 'addPublishWorkflow').mockReturnValue();
    vi.spyOn(__, 'getCircleciTrustConfig').mockReturnValue(trustConfig);
    vi.spyOn(__, 'isTrustedPublisherRegistered').mockReturnValue(true);
    vi.spyOn(__, 'ensureNpmLogin').mockReturnValue();
    vi.spyOn(__, 'withOtpRetry').mockReturnValue();
  });

  it('should skip entirely when all packages are first-publish', async () => {
    releaseData.allPackages = [
      { content: { name: 'pkg-x' }, isFirstPublish: true },
      { content: { name: 'pkg-y' }, isFirstPublish: true },
    ];

    await ensureTrustedPublishing(releaseData);

    expect(__.ensureCircleciToken).not.toHaveBeenCalled();
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

  it('should log when legacy npm auth was cleaned up', async () => {
    vi.spyOn(__, 'removeLegacyNpmAuth').mockReturnValue(true);

    await ensureTrustedPublishing(releaseData);

    expect(__.consoleInfo).toHaveBeenCalledWith(
      'Removed legacy npm auth from repo',
    );
  });

  it('should not log when no legacy npm auth cleanup was needed', async () => {
    await ensureTrustedPublishing(releaseData);

    expect(__.consoleInfo).not.toHaveBeenCalledWith(
      'Removed legacy npm auth from repo',
    );
  });

  it('should call addPublishWorkflow when workflow is missing', async () => {
    vi.spyOn(__, 'hasPublishWorkflow').mockReturnValue(false);

    await ensureTrustedPublishing(releaseData);

    expect(__.addPublishWorkflow).toHaveBeenCalled();
  });

  it('should skip addPublishWorkflow when workflow exists', async () => {
    await ensureTrustedPublishing(releaseData);

    expect(__.addPublishWorkflow).not.toHaveBeenCalled();
  });

  it('should push after commits from removeLegacyNpmAuth and/or addPublishWorkflow', async () => {
    mockRepo.currentCommit
      .mockReturnValueOnce('sha-before')
      .mockReturnValueOnce('sha-after');

    await ensureTrustedPublishing(releaseData);

    expect(mockRepo.push).toHaveBeenCalled();
  });

  it('should skip push when no commits were created', async () => {
    await ensureTrustedPublishing(releaseData);

    expect(mockRepo.push).not.toHaveBeenCalled();
  });

  it('should register only unregistered packages', async () => {
    vi.spyOn(__, 'isTrustedPublisherRegistered').mockImplementation(
      (packageName) => {
        return packageName === 'pkg-b';
      },
    );

    await ensureTrustedPublishing(releaseData);

    expect(__.ensureNpmLogin).toHaveBeenCalled();
    expect(__.withOtpRetry).toHaveBeenCalledWith(
      ['pkg-a'],
      expect.any(Function),
    );
  });

  it('should show context before OTP prompt with package count', async () => {
    vi.spyOn(__, 'isTrustedPublisherRegistered').mockImplementation(
      (packageName) => {
        return packageName === 'pkg-b';
      },
    );

    await ensureTrustedPublishing(releaseData);

    expect(__.consoleInfo).toHaveBeenCalledWith(
      'Registering trusted publishers for 1 package(s) (requires OTP)',
    );
  });

  it('should skip registration when all packages are registered', async () => {
    await ensureTrustedPublishing(releaseData);

    expect(__.ensureNpmLogin).not.toHaveBeenCalled();
    expect(__.withOtpRetry).not.toHaveBeenCalled();
  });

  describe('spinner message', () => {
    let mockSpinner;
    beforeEach(() => {
      mockSpinner = { tick: vi.fn(), success: vi.fn() };
      vi.spyOn(__, 'spinner').mockReturnValue(mockSpinner);
    });

    it('should report all registered when no packages need registration', async () => {
      await ensureTrustedPublishing(releaseData);

      expect(mockSpinner.success).toHaveBeenCalledWith(
        'All trusted publishers registered',
      );
    });

    it('should report count when some packages need registration', async () => {
      vi.spyOn(__, 'isTrustedPublisherRegistered').mockImplementation(
        (packageName) => {
          return packageName === 'pkg-b';
        },
      );

      await ensureTrustedPublishing(releaseData);

      expect(mockSpinner.success).toHaveBeenCalledWith(
        '1 package(s) need trusted publisher registration',
      );
    });
  });
});
