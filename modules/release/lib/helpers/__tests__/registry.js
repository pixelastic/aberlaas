import { __, pushToRegistry } from '../registry.js';

describe('release/helpers/registry', () => {
  beforeEach(() => {
    vi.spyOn(__, 'run').mockReturnValue();
  });

  describe('pushToRegistry', () => {
    it('should run yarn npm publish in the package directory', async () => {
      await pushToRegistry({
        filepath: '/path/to/alpha/package.json',
      });

      expect(__.run).toHaveBeenCalledWith('yarn npm publish --access public', {
        cwd: '/path/to/alpha',
        stdout: false,
        stderr: false,
      });
    });

    it('should pass otp as CLI flag', async () => {
      await pushToRegistry(
        { filepath: '/path/to/alpha/package.json' },
        { otp: '654321' },
      );

      expect(__.run).toHaveBeenCalledWith(
        'yarn npm publish --access public --otp 654321',
        {
          cwd: '/path/to/alpha',
          stdout: false,
          stderr: false,
        },
      );
    });

    it('should pass env variables to the child process', async () => {
      await pushToRegistry(
        { filepath: '/path/to/alpha/package.json' },
        { env: { NPM_ID_TOKEN: 'my-token' } },
      );

      expect(__.run).toHaveBeenCalledWith('yarn npm publish --access public', {
        cwd: '/path/to/alpha',
        env: expect.objectContaining({ NPM_ID_TOKEN: 'my-token' }),
        stdout: false,
        stderr: false,
      });
    });
  });
});
