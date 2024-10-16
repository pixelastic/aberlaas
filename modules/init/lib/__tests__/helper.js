import path from 'path';
import { exists, isFile, read, remove, tmpDirectory, write } from 'firost';
import helper from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import current from '../helper.js';

describe('init > helper', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory('aberlaas/init'));
  });
  afterEach(async () => {
    await remove(helper.hostRoot());
  });

  describe('getProjectName', () => {
    it('should return the name of the current directory', async () => {
      const expected = path.basename(helper.hostRoot());
      const actual = current.getProjectName();

      expect(actual).toEqual(expected);
    });
  });

  describe('getProjectAuthor', () => {
    it('should return the git author from the defined remote', async () => {
      vi.spyOn(current, '__getRepo').mockReturnValue({
        githubRepoOwner: vi.fn().mockReturnValue('my-name'),
      });

      const actual = await current.getProjectAuthor();

      expect(actual).toBe('my-name');
    });
    it('should return a placeholder if no remote GitHub owner defined', async () => {
      const actual = await current.getProjectAuthor();
      expect(actual).toBe('__placeholder__');
    });
  });

  describe('copyTemplateToHost', () => {
    it('should copy file from templates folder to host', async () => {
      const expected = await read('../../templates/_gitignore');
      await current.copyTemplateToHost(
        '_gitignore',
        'subfolder/custom-file-name',
      );

      const actual = await read(helper.hostPath('subfolder/custom-file-name'));
      expect(actual).toEqual(expected);
    });
    it('should return true if file copied', async () => {
      const actual = await current.copyTemplateToHost(
        '_gitignore',
        'custom-file-name',
      );

      expect(actual).toBe(true);
    });
    it('should throw an error if source does not exist', async () => {
      let actual = null;

      try {
        await current.copyTemplateToHost('_thisisnothere.yml', 'config.yml');
      } catch (error) {
        actual = error;
      }

      expect(actual).not.toBeNull();
    });
    it('should create a backup copy of destination if already exists', async () => {
      const templateContent = await read('../../templates/_gitignore');
      const existingFileContent = 'node_modules/*';
      await write(existingFileContent, helper.hostPath('.gitignore'));

      await current.copyTemplateToHost('_gitignore', '.gitignore');

      const configContent = await read(helper.hostPath('.gitignore'));
      expect(configContent).toBe(templateContent);

      const backupContent = await read(helper.hostPath('.gitignore.backup'));
      expect(backupContent).toBe(existingFileContent);
    });
    it('should not create a backup if the source and destination have the same content', async () => {
      const templateContent = await read('../../templates/_gitignore');
      await write(templateContent, helper.hostPath('.gitignore'));

      await current.copyTemplateToHost('_gitignore', '.gitignore');

      const configExist = await isFile(helper.hostPath('.gitignore'));
      expect(configExist).toBe(true);

      const backupExist = await isFile(helper.hostPath('.gitignore.backup'));
      expect(backupExist).toBe(false);
    });
  });
  describe('addLicenseFile', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'getProjectAuthor').mockReturnValue('pixelastic');
    });
    it('should create the file', async () => {
      const input = 'LICENSE';
      await current.addLicenseFile(input);

      const actual = await exists(helper.hostPath(input));
      expect(actual).toBe(true);
    });
    it('should be a MIT license', async () => {
      const input = 'LICENSE';
      await current.addLicenseFile(input);

      const actual = await read(helper.hostPath(input));
      expect(actual).toInclude('MIT License');
    });
    it('should contain copyright with the current owner', async () => {
      const input = 'LICENSE';
      await current.addLicenseFile(input);

      const actual = await read(helper.hostPath(input));
      expect(actual).toInclude('Copyright (c) pixelastic');
    });
  });
  describe('addCircleCIConfigFile', () => {
    it('should create the file', async () => {
      const configPath = helper.hostPath('.circleci/config.yml');
      await current.addCircleCIConfigFile();

      const actual = await exists(configPath);
      expect(actual).toBe(true);
    });
    it('should use the right node image version', async () => {
      const configPath = helper.hostPath('.circleci/config.yml');
      await current.addCircleCIConfigFile();

      const actual = await read(configPath);
      expect(actual).toInclude(`- image: cimg/node:${nodeVersion}`);
    });
    it('should set the right yarn version', async () => {
      const configPath = helper.hostPath('.circleci/config.yml');
      await current.addCircleCIConfigFile();

      const actual = await read(configPath);
      expect(actual).toInclude(`yarn set version ${yarnVersion}`);
    });
  });
  describe('addScripts', () => {
    it.each([
      ['pre-commit', 'hooks/pre-commit'],
      ['release', 'lib/release'],
      ['test', 'lib/test'],
      ['test:watch', 'lib/test-watch'],
      ['ci', 'ci'],
      ['compress', 'compress'],
      ['lint', 'lint'],
      ['lint:fix', 'lint-fix'],
    ])('%s', async (_title, filepath) => {
      await current.addScripts();
      const actual = await isFile(helper.hostPath(`scripts/${filepath}`));
      expect(actual).toBe(true);
    });
  });
  describe('addConfigFiles', () => {
    it.each([
      ['CircleCI config', '.circleci/config.yml'],
      ['ESLint config', 'eslint.config.js'],
      ['Git attributes', '.gitattributes'],
      ['Git ignore', '.gitignore'],
      ['LintStaged config', 'lintstaged.config.js'],
      ['Prettier config', 'prettier.config.js'],
      ['Renovate config', '.github/renovate.json'],
      ['Stylelint config', 'stylelint.config.js'],
      ['Vite config', 'vite.config.js'],
      ['Yarn config', '.yarnrc.yml'],
    ])('%s', async (_title, filepath) => {
      await current.addConfigFiles();
      const actual = await isFile(helper.hostPath(filepath));
      expect(actual).toBe(true);
    });
  });
  describe('addLibFiles', () => {
    it('should include the minimum files', async () => {
      await current.addLibFiles();

      const hasMain = await isFile(helper.hostPath('lib/main.js'));
      expect(hasMain).toBe(true);
      const hasTest = await isFile(helper.hostPath('lib/__tests__/main.js'));
      expect(hasTest).toBe(true);
    });
  });
});
