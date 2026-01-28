import { glob, read, readJson, remove, tmpDirectory } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import { __ as initHelper } from '../../helper.js';
import { __, run } from '../module.js';

describe('init > module', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(
      tmpDirectory('aberlaas/init/module'),
    );

    vi.spyOn(initHelper, 'getProjectName').mockReturnValue('my-project');
    vi.spyOn(initHelper, 'getProjectAuthor').mockReturnValue('my-name');
    vi.spyOn(initHelper, 'getAberlaasVersion').mockReturnValue('1.2.3');
  });
  afterEach(async () => {
    await remove(helper.hostGitRoot());
  });

  describe('createPackageJson', () => {
    it.each([
      [
        'should have correct metadata',
        {
          name: 'my-project',
          version: '0.0.1',
          author: 'my-name',
          description: '',
          keywords: [],
          repository: 'my-name/my-project',
          homepage: 'https://github.com/my-name/my-project',
        },
      ],
      [
        'should have correct license',
        {
          license: 'MIT',
        },
      ],
      [
        'should have ESM information',
        {
          type: 'module',
          sideEffects: false,
        },
      ],
      [
        'should have language and yarn version',
        {
          engines: {
            node: `>=${nodeVersion}`,
          },
          packageManager: `yarn@${yarnVersion}`,
        },
      ],
      [
        'should export the right files',
        {
          files: ['lib/*.js'],
          exports: { '.': './lib/main.js' },
          main: './lib/main.js',
        },
      ],
      [
        'should have the right dependencies',
        {
          devDependencies: {
            aberlaas: '1.2.3',
          },
          dependencies: {},
        },
      ],
      [
        'should have scripts',
        {
          scripts: {
            release: './scripts/release',
            test: './scripts/test',
            lint: './scripts/lint',
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      await __.createPackageJson();

      const actual = await readJson(helper.hostGitPath('package.json'));

      expect(actual).toMatchObject(expected);
    });
  });

  describe('run', () => {
    it('should build a module structure', async () => {
      await run();

      const actual = await glob('**/*', {
        cwd: helper.hostGitPath(),
        absolutePaths: false,
        directories: false,
      });

      expect(actual).toEqual([
        '.circleci/config.yml',
        '.gitattributes',
        '.github/renovate.json',
        '.gitignore',
        '.README.template.md',
        '.yarnrc.yml',
        'eslint.config.js',
        'lib/__tests__/main.js',
        'lib/main.js',
        'LICENSE',
        'lintstaged.config.js',
        'package.json',
        'prettier.config.js',
        'scripts/ci',
        'scripts/compress',
        'scripts/hooks/pre-commit',
        'scripts/lint',
        'scripts/lint-fix',
        'scripts/release',
        'scripts/test',
        'scripts/test-watch',
        'stylelint.config.js',
        'vite.config.js',
      ]);
    });

    it('should write a correct circleCI file', async () => {
      await run();

      const circleciConfig = await read(
        helper.hostGitPath('.circleci/config.yml'),
      );

      // Should not contain literal template placeholders
      expect(circleciConfig).not.toContain('{nodeVersion}');
      expect(circleciConfig).not.toContain('{yarnVersion}');

      // Should contain actual versions
      expect(circleciConfig).toContain(`cimg/node:${nodeVersion}`);
      expect(circleciConfig).toContain(`yarn set version ${yarnVersion}`);
    });
  });
});
