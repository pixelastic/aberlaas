import { npmVersion } from 'aberlaas-versions';
import { __, ensureNpmLogin } from '../ensureNpmLogin.js';

describe('ensureNpmLogin', () => {
  let mockProgress;
  beforeEach(() => {
    mockProgress = { tick: vi.fn(), success: vi.fn(), info: vi.fn() };
    vi.spyOn(__, 'spinner').mockReturnValue(mockProgress);
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
});
