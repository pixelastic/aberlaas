import path from 'path';
import {
  absolute,
  emptyDir,
  exists,
  isFile,
  read,
  remove,
  tmpDirectory,
  write,
} from 'firost';
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

  describe('copyToHost', () => {
    beforeEach(async () => {
      vi.spyOn(helper, 'aberlaasRoot').mockReturnValue(
        absolute('<gitRoot>/tmp/aberlaas'),
      );
      await emptyDir(helper.aberlaasRoot());
    });
    it('should copy file from aberlaas to host', async () => {
      await write('config: true', helper.aberlaasPath('config.yml'));

      await current.copyToHost('config.yml', '.configrc');

      const actual = await read(helper.hostPath('.configrc'));
      expect(actual).toBe('config: true');
    });
    it('should return true if file copied', async () => {
      await write('config: true', helper.aberlaasPath('config.yml'));

      const actual = await current.copyToHost('config.yml', '.configrc');

      expect(actual).toBe(true);
    });
    it('should throw an error if source does not exist', async () => {
      let actual = null;

      try {
        await current.copyToHost('config.yml', '.configrc');
      } catch (error) {
        actual = error;
      }

      expect(actual).not.toBeNull();
    });
    it('should create a backup copy of destination if already exists', async () => {
      await write('config: true', helper.aberlaasPath('config.yml'));
      await write('config: 42', helper.hostPath('.configrc'));

      await current.copyToHost('config.yml', '.configrc');

      const configContent = await read(helper.hostPath('.configrc'));
      expect(configContent).toBe('config: true');

      const backupContent = await read(helper.hostPath('.configrc.backup'));
      expect(backupContent).toBe('config: 42');
    });
    it('should not create a backup if the source and destination have the same content', async () => {
      await write('config: true', helper.aberlaasPath('config.yml'));
      await write('config: true', helper.hostPath('.configrc'));

      await current.copyToHost('config.yml', '.configrc');

      const configExist = await isFile(helper.hostPath('.configrc'));
      expect(configExist).toBe(true);

      const backupExist = await isFile(helper.hostPath('.configrc.backup'));
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
