import { glob, readJson, remove, tmpDirectory } from 'firost';
import current from '../module.js';
import helper from '../../../helper.js';
import nodeConfig from '../../../configs/node.cjs';

const currentAberlaasVersion = (
  await readJson(helper.aberlaasPath('./package.json'))
).version;

describe('init > simple', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory('aberlaas/init'));

    vi.spyOn(current, '__getProjectName').mockReturnValue('my-project');
    vi.spyOn(current, '__getProjectAuthor').mockReturnValue('my-name');
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
          homepage: 'https://projects.pixelastic.com/my-project',
        },
      ],
      [
        'should have correct license',
        {
          license: 'MIT',
        },
      ],
      [
        'should have language and yarn version',
        {
          type: 'module',
          engines: {
            node: `>=${nodeConfig.nodeVersion}`,
          },
          packageManager: `yarn@${nodeConfig.yarnVersion}`,
        },
      ],
      [
        'should export the right files',
        {
          files: ['*.js'],
          exports: { '.': './main.js' },
          main: './main.js',
        },
      ],
      [
        'should have the right dependencies',
        {
          devDependencies: {
            aberlaas: currentAberlaasVersion,
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
        '.eslintignore',
        '.eslintrc.cjs',
        '.gitattributes',
        '.github/renovate.json',
        '.gitignore',
        '.yarnrc.yml',
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
