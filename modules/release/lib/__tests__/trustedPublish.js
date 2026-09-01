import { __, trustedPublish } from '../trustedPublish.js';

describe('release/trustedPublish', () => {
  beforeEach(() => {
    vi.spyOn(__, 'getAllPublicPackages').mockReturnValue([
      {
        filepath: '/path/to/alpha/package.json',
        content: { name: 'alpha' },
      },
      {
        filepath: '/path/to/beta/package.json',
        content: { name: 'beta' },
      },
      {
        filepath: '/path/to/gamma/package.json',
        content: { name: 'gamma' },
      },
    ]);
    vi.spyOn(__, 'getOidcToken').mockReturnValue('oidc-token-abc');
    vi.spyOn(__, 'pushToRegistry').mockReturnValue();
  });

  it('should parse CSV string and publish matching packages', async () => {
    await trustedPublish('alpha,gamma');

    expect(__.pushToRegistry).toHaveBeenCalledWith(
      { filepath: '/path/to/alpha/package.json', content: { name: 'alpha' } },
      { env: { NPM_ID_TOKEN: 'oidc-token-abc' } },
    );
    expect(__.pushToRegistry).toHaveBeenCalledWith(
      { filepath: '/path/to/gamma/package.json', content: { name: 'gamma' } },
      { env: { NPM_ID_TOKEN: 'oidc-token-abc' } },
    );
    expect(__.pushToRegistry).not.toHaveBeenCalledWith(
      expect.objectContaining({ content: { name: 'beta' } }),
      expect.anything(),
    );
  });

  it('should fetch OIDC token via circleci CLI', async () => {
    await trustedPublish('alpha');

    expect(__.getOidcToken).toHaveBeenCalled();
  });

  it('should pass OIDC token as env to pushToRegistry', async () => {
    await trustedPublish('alpha');

    expect(__.pushToRegistry).toHaveBeenCalledWith(expect.anything(), {
      env: { NPM_ID_TOKEN: 'oidc-token-abc' },
    });
  });

  describe('getOidcToken', () => {
    beforeEach(() => {
      __.getOidcToken.mockRestore();
      vi.spyOn(__, 'run').mockReturnValue({ stdout: 'oidc-token-xyz' });
    });

    it('should call circleci CLI with npm audience claim', async () => {
      await __.getOidcToken();

      expect(__.run).toHaveBeenCalledWith(
        [
          'circleci',
          'run',
          'oidc',
          'get',
          '--claims',
          '{"aud": "npm:registry.npmjs.org"}',
        ],
        { stdout: false },
      );
    });

    it('should return the token from stdout', async () => {
      const actual = await __.getOidcToken();

      expect(actual).toEqual('oidc-token-xyz');
    });
  });
});
