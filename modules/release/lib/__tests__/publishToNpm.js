import { firostError } from 'firost';
import { __, publishToNpm } from '../publishToNpm.js';

describe('publishToNpm', () => {
  describe('publishPackage', () => {
    const packageData = {
      filepath: '/path/to/package/package.json',
      content: {
        name: 'my-package',
      },
    };
    it('should run npm publish correctly', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      const actual = await __.publishPackage(packageData);

      expect(actual).toEqual(true);
      expect(__.run).toHaveBeenCalledWith('npm publish --access public', {
        cwd: '/path/to/package',
        stdout: false,
        stderr: false,
      });
    });

    it('should throw error if publish fails', async () => {
      vi.spyOn(__, 'run').mockImplementation(() => {
        throw firostError('NPM_FAIL', 'npm publish failed');
      });

      let actual = null;
      try {
        await __.publishPackage(packageData);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NPM_PUBLISH_FAILED',
      );
      expect(actual.message).toContain('Failed to publish my-package');
      expect(actual.message).toContain('npm publish failed');
    });
  });

  describe('publishToNpm', () => {
    let mockProgress;
    const releaseData = {
      newVersion: '2.0.0',
      allPackages: [
        {
          filepath: '/path/to/package-a/package.json',
          content: { name: 'package-a', version: '1.0.0' },
        },
        {
          filepath: '/path/to/package-b/package.json',
          content: { name: 'package-b', version: '1.0.0' },
        },
        {
          filepath: '/path/to/package-c/package.json',
          content: { name: 'package-c', version: '1.0.0' },
        },
      ],
    };

    beforeEach(() => {
      mockProgress = {
        tick: vi.fn(),
        success: vi.fn(),
      };

      vi.spyOn(__, 'spinner').mockReturnValue(mockProgress);
      vi.spyOn(__, 'publishPackage').mockReturnValue();
    });

    it('should create spinner with correct package count', async () => {
      await publishToNpm(releaseData);

      expect(__.spinner).toHaveBeenCalledWith(3);
      expect(mockProgress.tick).toHaveBeenCalledTimes(3);
      expect(mockProgress.tick).toHaveBeenCalledWith(
        'Publishing package-a@2.0.0',
      );
      expect(mockProgress.tick).toHaveBeenCalledWith(
        'Publishing package-b@2.0.0',
      );
      expect(mockProgress.tick).toHaveBeenCalledWith(
        'Publishing package-c@2.0.0',
      );
    });

    it('should throw error when publishPackage fails', async () => {
      vi.spyOn(__, 'publishPackage').mockImplementation(() => {
        throw firostError(
          'ABERLAAS_RELEASE_NPM_PUBLISH_FAILED',
          'Failed to publish package-a',
        );
      });

      let actual = null;
      try {
        await publishToNpm(releaseData);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NPM_PUBLISH_FAILED',
      );
    });
  });
});
