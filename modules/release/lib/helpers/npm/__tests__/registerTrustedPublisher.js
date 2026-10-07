import { npmVersion } from 'aberlaas-versions';
import { __, registerTrustedPublisher } from '../registerTrustedPublisher.js';

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
      { env: { npm_config_otp: '654321' }, stdout: false, stderr: false },
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
