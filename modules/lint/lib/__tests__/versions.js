import { remove, tmpDirectory, writeJson } from 'firost';
import { hostGitPath, mockHelperPaths } from 'aberlaas-helper';
import { yarnVersion } from 'aberlaas-versions';
import { run } from '../versions.js';

describe('lint/versions', () => {
  let testDirectory;
  beforeEach(async () => {
    testDirectory = tmpDirectory(`aberlaas/${describeName}`);
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('run', () => {
    it('should return true when packageManager matches expected yarn version', async () => {
      await writeJson(
        { packageManager: `yarn@${yarnVersion}` },
        hostGitPath('package.json'),
      );

      const actual = await run();

      expect(actual).toBe(true);
    });

    it.each([
      {
        title: 'wrong version',
        packageJson: { packageManager: 'yarn@4.5.0' },
      },
      {
        title: 'missing field',
        packageJson: { name: 'my-project' },
      },
    ])(
      'should throw ABERLAAS_LINT_VERSIONS when packageManager has $title',
      async ({ packageJson }) => {
        await writeJson(packageJson, hostGitPath('package.json'));

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_VERSIONS');
      },
    );

    it('should include file name and both versions in error message', async () => {
      await writeJson(
        { packageManager: 'yarn@4.5.0' },
        hostGitPath('package.json'),
      );

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual.message).toContain('package.json#packageManager');
      expect(actual.message).toContain('yarn@4.5.0');
      expect(actual.message).toContain(`yarn@${yarnVersion}`);
    });
  });
});
