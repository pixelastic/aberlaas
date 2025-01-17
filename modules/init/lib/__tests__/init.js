import Gilmore from 'gilmore';
import { glob, read, remove, tmpDirectory } from 'firost';
import helper from 'aberlaas-helper';
import { nodeVersion } from 'aberlaas-versions';
import current from '../main.js';

describe('init', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory('aberlaas/init'));
  });
  afterEach(async () => {
    await remove(helper.hostRoot());
  });
  // CONFIGURE
  describe('configureGit', () => {
    it('should change the default git hooksPath', async () => {
      const repo = new Gilmore(helper.hostRoot());
      await repo.init();

      await current.configureGit();

      const actual = await repo.getConfig('core.hooksPath');
      expect(actual).toBe('scripts/hooks');
    });
  });
  describe('configureNode', () => {
    it('should set a .nvmrc file', async () => {
      await current.configureNode();

      const actual = await read(helper.hostPath('.nvmrc'));

      expect(actual).toEqual(nodeVersion);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'yarnInstall').mockReturnValue();
      vi.spyOn(current, '__consoleInfo').mockReturnValue();
      vi.spyOn(current, '__spinner').mockReturnValue({
        tick: vi.fn(),
        success: vi.fn(),
      });

      const repo = new Gilmore(helper.hostRoot());
      await repo.init();
    });
    it('should build a default structure', async () => {
      const actual = await glob(['**/*', '!.git/**'], {
        context: helper.hostPath(),
        absolutePaths: false,
        directories: false,
      });

      expect(actual).toEqual([
        '.circleci/config.yml',
        '.gitattributes',
        '.github/renovate.json',
        '.gitignore',
        '.nvmrc',
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
    it('should build a monorepo structure', async () => {
      await current.run({ monorepo: true });

      const actual = await glob(['**/*', '!.git/**'], {
        context: helper.hostPath(),
        absolutePaths: false,
        directories: false,
      });

      expect(actual).toEqual([
        '.circleci/config.yml',
        '.gitattributes',
        '.github/renovate.json',
        '.gitignore',
        '.nvmrc',
        '.yarnrc.yml',
        'docs/package.json',
        'eslint.config.js',
        'lerna.json',
        'lib/__tests__/main.js',
        'lib/LICENSE',
        'lib/main.js',
        'lib/package.json',
        'LICENSE',
        'lintstaged.config.js',
        'package.json',
        'prettier.config.js',
        'scripts/ci',
        'scripts/compress',
        'scripts/docs/build',
        'scripts/docs/build-prod',
        'scripts/docs/cms',
        'scripts/docs/serve',
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
