import { glob, readJson, remove, tmpDirectory } from 'firost';
import helper from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import current from '../module.js';

describe('init > module', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory('aberlaas/init'));

    vi.spyOn(current, '__getProjectName').mockReturnValue('my-project');
    vi.spyOn(current, '__getProjectAuthor').mockReturnValue('my-name');
    vi.spyOn(current, '__getAberlaasVersion').mockReturnValue('1.2.3');
  });
  afterEach(async () => {
    await remove(helper.hostRoot());
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
            build: './scripts/docs/build',
            release: './scripts/lib/release',
            lint: './scripts/lint',
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      await current.createPackageJson();

      const actual = await readJson(helper.hostPath('package.json'));

      expect(actual).toMatchObject(expected);
    });
  });

  describe('run', () => {
    it('should build a module structure', async () => {
      await current.run();

      const actual = await glob('**/*', {
        context: helper.hostPath(),
        absolutePaths: false,
        directories: false,
      });

      expect(actual).toEqual([
        '.circleci/config.yml',
        '.gitattributes',
        '.github/renovate.json',
        '.gitignore',
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
        'scripts/lib/release',
        'scripts/lib/test',
        'scripts/lib/test-watch',
        'scripts/lint',
        'scripts/lint-fix',
        'stylelint.config.js',
        'vite.config.js',
      ]);
    });
  });
});
