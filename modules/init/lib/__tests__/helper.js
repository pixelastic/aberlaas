import path from 'node:path';
import {
  exists,
  glob,
  isFile,
  newFile,
  read,
  remove,
  tmpDirectory,
  write,
} from 'firost';
import { hostGitPath, hostGitRoot, mockHelperPaths } from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';
import {
  __,
  addConfigFiles,
  addDefaultScripts,
  addDocsScripts,
  addLibFiles,
  addLicenseFile,
  getProjectAuthor,
  getProjectName,
} from '../helper.js';

describe('init > helper', () => {
  const testDirectory = tmpDirectory('aberlaas/init/helper');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('private methods', () => {
    describe('copyTemplateToHost', () => {
      it('should copy file from templates folder to host', async () => {
        const expected = await read('../../templates/_gitignore');
        await __.copyTemplateToHost('_gitignore', 'subfolder/custom-file-name');

        const actual = await read(hostGitPath('subfolder/custom-file-name'));
        expect(actual).toEqual(expected);
      });
      it('should return true if file copied', async () => {
        const actual = await __.copyTemplateToHost(
          '_gitignore',
          'custom-file-name',
        );

        expect(actual).toBe(true);
      });
      it('should throw an error if source does not exist', async () => {
        let actual = null;

        try {
          await __.copyTemplateToHost('_thisisnothere.yml', 'config.yml');
        } catch (error) {
          actual = error;
        }

        expect(actual).not.toBeNull();
      });
      it('should create a backup copy of destination in ./tmp/backup/ if already exists', async () => {
        vi.spyOn(__, 'consoleWarn').mockReturnValue();
        const templateContent = await read('../../templates/_gitignore');
        const existingFileContent = 'node_modules/*';
        await write(existingFileContent, hostGitPath('.gitignore'));

        await __.copyTemplateToHost('_gitignore', '.gitignore');

        const configContent = await read(hostGitPath('.gitignore'));
        expect(configContent).toBe(templateContent);

        const backupContent = await read(
          hostGitPath('./tmp/backup/.gitignore'),
        );
        expect(backupContent).toBe(existingFileContent);

        expect(__.consoleWarn).toHaveBeenCalled();
      });
      it('should not create a backup if the source and destination have the same content', async () => {
        vi.spyOn(__, 'consoleWarn').mockReturnValue();
        const templateContent = await read('../../templates/_gitignore');
        await write(templateContent, hostGitPath('.gitignore'));

        await __.copyTemplateToHost('_gitignore', '.gitignore');

        const configExist = await isFile(hostGitPath('.gitignore'));
        expect(configExist).toBe(true);

        const backupExist = await isFile(
          hostGitPath('./tmp/backup/.gitignore'),
        );
        expect(backupExist).toBe(false);

        expect(__.consoleWarn).not.toHaveBeenCalled();
      });
      it('should use source as destination when destination is not provided', async () => {
        const expected = await read('../../templates/scripts/ci');
        await __.copyTemplateToHost('scripts/ci');

        const actual = await read(hostGitPath('scripts/ci'));
        expect(actual).toEqual(expected);
      });
    });
    describe('addCircleCIConfigFile', () => {
      it('should create the file', async () => {
        const configPath = hostGitPath('.circleci/config.yml');
        await __.addCircleCIConfigFile();

        const actual = await exists(configPath);
        expect(actual).toBe(true);
      });
      it('should use the right node image version', async () => {
        const configPath = hostGitPath('.circleci/config.yml');
        await __.addCircleCIConfigFile();

        const actual = await read(configPath);
        expect(actual).toInclude(`- image: cimg/node:${nodeVersion}`);
      });
      it('should set the right yarn version', async () => {
        const configPath = hostGitPath('.circleci/config.yml');
        await __.addCircleCIConfigFile();

        const actual = await read(configPath);
        expect(actual).toInclude(`yarn set version ${yarnVersion}`);
      });
    });
  });

  describe('public methods', () => {
    describe('getProjectName', () => {
      it('should return the name of the current directory', async () => {
        const expected = path.basename(hostGitRoot());
        const actual = getProjectName();

        expect(actual).toEqual(expected);
      });
    });

    describe('getProjectAuthor', () => {
      it('should return the git author from the defined remote', async () => {
        vi.spyOn(__, 'getRepo').mockReturnValue({
          githubRepoOwner: vi.fn().mockReturnValue('my-name'),
        });

        const actual = await getProjectAuthor();

        expect(actual).toBe('my-name');
      });
      it('should return a placeholder if no remote GitHub owner defined', async () => {
        const actual = await getProjectAuthor();
        expect(actual).toBe('__placeholder__');
      });
    });

    describe('addLicenseFile', () => {
      beforeEach(async () => {
        vi.spyOn(__, 'getProjectAuthor').mockReturnValue('pixelastic');
      });
      it('should create the file', async () => {
        const input = 'LICENSE';
        await addLicenseFile(input);

        const actual = await exists(hostGitPath(input));
        expect(actual).toBe(true);
      });
      it('should be a MIT license', async () => {
        const input = 'LICENSE';
        await addLicenseFile(input);

        const actual = await read(hostGitPath(input));
        expect(actual).toInclude('MIT License');
      });
      it('should contain copyright with the current owner', async () => {
        const input = 'LICENSE';
        await addLicenseFile(input);

        const actual = await read(hostGitPath(input));
        expect(actual).toInclude('Copyright (c) pixelastic');
      });
    });
    describe('addDefaultScripts', () => {
      it('copies base scripts from templates/scripts, excluding docs scripts', async () => {
        await addDefaultScripts();

        const actual = await glob(`${testDirectory}/scripts/**`, {
          directories: false,
        });
        expect(actual).toEqual([
          `${testDirectory}/scripts/ci`,
          `${testDirectory}/scripts/compress`,
          `${testDirectory}/scripts/hooks/pre-commit`,
          `${testDirectory}/scripts/lint`,
          `${testDirectory}/scripts/lint-fix`,
          `${testDirectory}/scripts/release`,
          `${testDirectory}/scripts/test`,
          `${testDirectory}/scripts/test-watch`,
        ]);
      });
    });
    describe('addDocsScripts', () => {
      it('copies only documentation scripts from templates/scripts', async () => {
        await addDocsScripts();

        const actual = await glob(`${testDirectory}/scripts/**`, {
          directories: false,
        });
        expect(actual).toEqual([
          `${testDirectory}/scripts/build`,
          `${testDirectory}/scripts/build-prod`,
          `${testDirectory}/scripts/cms`,
          `${testDirectory}/scripts/serve`,
        ]);
      });
    });
    describe('addConfigFiles', () => {
      it.each([
        ['CircleCI config', '.circleci/config.yml'],
        ['Editorconfig', '.editorconfig'],
        ['ESLint config', 'eslint.config.js'],
        ['Git ignore', '.gitignore'],
        ['LintStaged config', 'lintstaged.config.js'],
        ['Prettier config', 'prettier.config.js'],
        ['Renovate config', '.github/renovate.json'],
        ['Stylelint config', 'stylelint.config.js'],
        ['Vite config', 'vite.config.js'],
        ['Yarn config', '.yarnrc.yml'],
      ])('%s', async (_title, filepath) => {
        await addConfigFiles();
        const actual = await isFile(hostGitPath(filepath));
        expect(actual).toBe(true);
      });
      it('should remove .gitattributes if it exists', async () => {
        const gitattributesPath = hostGitPath('.gitattributes');
        await newFile(gitattributesPath);

        await addConfigFiles();

        const actual = await isFile(gitattributesPath);
        expect(actual).toBe(false);
      });
    });
    describe('addLibFiles', () => {
      it('should include the minimum files', async () => {
        await addLibFiles();

        const hasMain = await isFile(hostGitPath('lib/main.js'));
        expect(hasMain).toBe(true);
        const hasTest = await isFile(hostGitPath('lib/__tests__/main.js'));
        expect(hasTest).toBe(true);
      });
    });
  });
});
