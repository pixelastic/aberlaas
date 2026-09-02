import { read, readJson, remove, tmpDirectory, write, writeJson } from 'firost';
import { hostGitPath, mockHelperPaths } from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import { __, fix, run } from '../versions.js';

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
    it('should return true when all versions match', async () => {
      await writeJson(
        {
          packageManager: `yarn@${yarnVersion}`,
          engines: { node: `>=${nodeVersion}` },
        },
        hostGitPath('package.json'),
      );

      const actual = await run();

      expect(actual).toBe(true);
    });

    describe('packageManager', () => {
      it.each([
        {
          title: 'wrong version',
          packageJson: {
            packageManager: 'yarn@4.5.0',
            engines: { node: `>=${nodeVersion}` },
          },
        },
        {
          title: 'missing field',
          packageJson: {
            name: 'my-project',
            engines: { node: `>=${nodeVersion}` },
          },
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
          {
            packageManager: 'yarn@4.5.0',
            engines: { node: `>=${nodeVersion}` },
          },
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

    describe('engines.node', () => {
      it.each([
        {
          title: 'mismatches',
          packageJson: {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: '>=18.0.0' },
          },
        },
        {
          title: 'is missing',
          packageJson: { packageManager: `yarn@${yarnVersion}` },
        },
      ])('should throw when engines.node $title', async ({ packageJson }) => {
        await writeJson(packageJson, hostGitPath('package.json'));

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_VERSIONS');
        expect(actual.message).toContain('engines.node');
      });
    });

    describe('.nvmrc', () => {
      it('should skip .nvmrc check when file does not exist', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );

        const actual = await run();

        expect(actual).toBe(true);
      });

      it('should return true when .nvmrc matches', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(nodeVersion, hostGitPath('.nvmrc'));

        const actual = await run();

        expect(actual).toBe(true);
      });

      it('should throw when .nvmrc mismatches', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write('18.0.0', hostGitPath('.nvmrc'));

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_VERSIONS');
        expect(actual.message).toContain('.nvmrc');
      });
    });

    describe('.circleci/config.yml', () => {
      it('should skip circleci checks when file does not exist', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );

        const actual = await run();

        expect(actual).toBe(true);
      });

      it('should skip cimg/node check when pattern is not in file', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(
          'jobs:\n  build:\n    docker:\n      - image: ubuntu:latest',
          hostGitPath('.circleci/config.yml'),
        );

        const actual = await run();

        expect(actual).toBe(true);
      });

      it('should skip yarn-set-version check when pattern is not in file', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(
          'jobs:\n  build:\n    steps:\n      - run: echo hello',
          hostGitPath('.circleci/config.yml'),
        );

        const actual = await run();

        expect(actual).toBe(true);
      });

      it('should throw when cimg/node pattern mismatches', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(
          'jobs:\n  build:\n    docker:\n      - image: cimg/node:18.0.0',
          hostGitPath('.circleci/config.yml'),
        );

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_VERSIONS');
        expect(actual.message).toContain('cimg/node:18.0.0');
        expect(actual.message).toContain(`cimg/node:${nodeVersion}`);
      });

      it('should throw when yarn-set-version pattern mismatches', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(
          'steps:\n  - run: yarn set version 4.0.0',
          hostGitPath('.circleci/config.yml'),
        );

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_VERSIONS');
        expect(actual.message).toContain('yarn set version 4.0.0');
        expect(actual.message).toContain(`yarn set version ${yarnVersion}`);
      });
    });

    describe('multiple mismatches', () => {
      it('should report all mismatches in a single error with count header', async () => {
        await writeJson(
          { packageManager: 'yarn@4.5.0', engines: { node: '>=18.0.0' } },
          hostGitPath('package.json'),
        );
        await write('18.0.0', hostGitPath('.nvmrc'));

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_VERSIONS');
        expect(actual.message).toContain('Version mismatch:');
        expect(actual.message).toContain('packageManager');
        expect(actual.message).toContain('engines.node');
        expect(actual.message).toContain('.nvmrc');
      });
    });
  });

  describe('fix', () => {
    describe('package.json fixes', () => {
      it('should fix packageManager in package.json', async () => {
        await writeJson(
          {
            packageManager: 'yarn@4.5.0',
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );

        await fix();

        const actual = await readJson(hostGitPath('package.json'));
        expect(actual).toHaveProperty('packageManager', `yarn@${yarnVersion}`);
      });

      it('should fix engines.node in package.json', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: '>=18.0.0' },
          },
          hostGitPath('package.json'),
        );

        await fix();

        const actual = await readJson(hostGitPath('package.json'));
        expect(actual).toHaveProperty('engines.node', `>=${nodeVersion}`);
      });
    });

    describe('.nvmrc fixes', () => {
      it('should fix .nvmrc content', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write('18.0.0', hostGitPath('.nvmrc'));

        await fix();

        const actual = await read(hostGitPath('.nvmrc'));
        expect(actual).toEqual(nodeVersion);
      });

      it('should skip .nvmrc fix when file does not exist', async () => {
        await writeJson(
          {
            packageManager: 'yarn@4.5.0',
            engines: { node: '>=18.0.0' },
          },
          hostGitPath('package.json'),
        );

        await fix();

        const actual = await readJson(hostGitPath('package.json'));
        expect(actual).toHaveProperty('packageManager', `yarn@${yarnVersion}`);
      });
    });

    describe('.circleci/config.yml fixes', () => {
      it('should fix cimg/node pattern in circleci config', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(
          'jobs:\n  build:\n    docker:\n      - image: cimg/node:18.0.0',
          hostGitPath('.circleci/config.yml'),
        );

        await fix();

        const actual = await read(hostGitPath('.circleci/config.yml'));
        expect(actual).toContain(`cimg/node:${nodeVersion}`);
      });

      it('should fix yarn-set-version pattern in circleci config', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(
          'steps:\n  - run: yarn set version 4.0.0',
          hostGitPath('.circleci/config.yml'),
        );

        await fix();

        const actual = await read(hostGitPath('.circleci/config.yml'));
        expect(actual).toContain(`yarn set version ${yarnVersion}`);
      });

      it('should skip circleci fix when file does not exist', async () => {
        await writeJson(
          {
            packageManager: 'yarn@4.5.0',
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );

        await fix();

        const actual = await readJson(hostGitPath('package.json'));
        expect(actual).toHaveProperty('packageManager', `yarn@${yarnVersion}`);
      });

      it('should skip circleci fix when patterns are not found', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(
          'jobs:\n  build:\n    steps:\n      - run: echo hello',
          hostGitPath('.circleci/config.yml'),
        );

        const actual = await fix();

        expect(actual).toBe(true);
      });
    });

    describe('idempotency', () => {
      it('should not modify files when versions already match', async () => {
        await writeJson(
          {
            packageManager: `yarn@${yarnVersion}`,
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        await write(nodeVersion, hostGitPath('.nvmrc'));
        await write(
          `jobs:\n  build:\n    docker:\n      - image: cimg/node:${nodeVersion}\n    steps:\n      - run: yarn set version ${yarnVersion}`,
          hostGitPath('.circleci/config.yml'),
        );

        await fix();

        const packageJson = await readJson(hostGitPath('package.json'));
        expect(packageJson).toHaveProperty(
          'packageManager',
          `yarn@${yarnVersion}`,
        );
        expect(packageJson).toHaveProperty('engines.node', `>=${nodeVersion}`);
        const nvmrc = await read(hostGitPath('.nvmrc'));
        expect(nvmrc).toEqual(nodeVersion);
        const circleci = await read(hostGitPath('.circleci/config.yml'));
        expect(circleci).toContain(`cimg/node:${nodeVersion}`);
        expect(circleci).toContain(`yarn set version ${yarnVersion}`);
      });
    });

    describe('verification', () => {
      it('should throw if mismatch persists after fix', async () => {
        await writeJson(
          {
            packageManager: 'yarn@4.5.0',
            engines: { node: `>=${nodeVersion}` },
          },
          hostGitPath('package.json'),
        );
        vi.spyOn(__, 'findMismatches').mockReturnValue({
          mismatches: [
            {
              file: 'package.json',
              field: 'packageManager',
              actual: 'yarn@4.5.0',
              expected: `yarn@${yarnVersion}`,
            },
          ],
          files: {
            'package.json': {
              path: hostGitPath('package.json'),
              content: { packageManager: 'yarn@4.5.0' },
            },
          },
        });

        let actual = null;
        try {
          await fix();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_VERSIONS');
      });
    });
  });
});
