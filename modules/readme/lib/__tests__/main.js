import { emptyDir, newFile, read, tmpDirectory, write } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import dedent from 'dedent';
import Gilmore from 'gilmore';
import { __, run } from '../main.js';

describe('readme', () => {
  const testDirectory = tmpDirectory('aberlaas/readme');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
    await emptyDir(testDirectory);
  });

  describe('warnIfDeprecatedTemplate', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleWarn').mockReturnValue();
    });
    it('should warn if deprecated template location exists', async () => {
      await newFile(`${testDirectory}/.github/README.template.md`);

      await __.warnIfDeprecatedTemplate();

      expect(__.consoleWarn).toHaveBeenCalled();
    });

    it('should not warn if deprecated template does not exist', async () => {
      await __.warnIfDeprecatedTemplate();
      expect(__.consoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('ensureTemplateExists', () => {
    it('should not throw if template exists', async () => {
      await newFile(`${testDirectory}/.README.template.md`);

      let actual = null;
      try {
        await __.ensureTemplateExists();
      } catch (err) {
        actual = err;
      }

      await expect(actual).toEqual(null);
    });

    it('should throw if template does not exist', async () => {
      let actual = null;
      try {
        await __.ensureTemplateExists();
      } catch (err) {
        actual = err;
      }

      await expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_README_MISSING_TEMPLATE',
      );
    });
  });

  describe('getTemplateData', () => {
    it('should parse template and extract inputs, outputs, and body', async () => {
      await write('input content', `${testDirectory}/docs/intro.md`);
      await write(
        dedent`
        ---
        outputs:
          - README.md
          - lib/README.md
        ---
        # Title

        {file:docs/intro.md}
        `,
        `${testDirectory}/.README.template.md`,
      );

      const actual = await __.getTemplateData();

      expect(actual).toEqual({
        inputs: [
          {
            match: 'docs/intro.md',
            filepath: `${testDirectory}/docs/intro.md`,
          },
        ],
        outputs: [
          `${testDirectory}/README.md`,
          `${testDirectory}/lib/README.md`,
        ],
        body: '# Title\n\n{file:docs/intro.md}',
      });
    });

    it('should throw if input file does not exist', async () => {
      await write(
        dedent`
        ---
        outputs:
          - README.md
        ---
        {file:missing.md}
        `,
        `${testDirectory}/.README.template.md`,
      );

      let actual = null;
      try {
        actual = await __.getTemplateData();
      } catch (err) {
        actual = err;
      }

      await expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_README_MISSING_INPUT',
      );
    });

    it('should throw if outputs are empty', async () => {
      await write(
        dedent`
        ---
        ---
        Content
        `,
        `${testDirectory}/.README.template.md`,
      );

      let actual = null;
      try {
        actual = await __.getTemplateData();
      } catch (err) {
        actual = err;
      }

      await expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_README_MISSING_OUTPUTS',
      );
    });

    it('should handle template with no file placeholders', async () => {
      await write(
        dedent`
        ---
        outputs:
          - README.md
        ---
        Just plain text
        `,
        `${testDirectory}/.README.template.md`,
      );

      const actual = await __.getTemplateData();

      expect(actual).toEqual({
        inputs: [],
        outputs: [`${testDirectory}/README.md`],
        body: 'Just plain text',
      });
    });

    it('should handle multiple file placeholders', async () => {
      await write('intro', `${testDirectory}/docs/intro.md`);
      await write('install', `${testDirectory}/docs/install.md`);
      await write(
        dedent`
        ---
        outputs:
          - README.md
        ---
        {file:docs/intro.md}
        {file:docs/install.md}
        `,
        `${testDirectory}/.README.template.md`,
      );

      const actual = await __.getTemplateData();

      expect(actual).toEqual({
        inputs: [
          {
            match: 'docs/intro.md',
            filepath: `${testDirectory}/docs/intro.md`,
          },
          {
            match: 'docs/install.md',
            filepath: `${testDirectory}/docs/install.md`,
          },
        ],
        outputs: [`${testDirectory}/README.md`],
        body: '{file:docs/intro.md}\n{file:docs/install.md}',
      });
    });
  });

  describe('shouldContinue', () => {
    it.each([
      [
        {
          title: 'Should continue if no CLI files passed',
          expected: true,
          cliFiles: [],
          templateData: {
            outputs: [`${testDirectory}/lib/README.md`],
            inputs: [{ filepath: `${testDirectory}/README.md` }],
          },
        },
      ],
      [
        {
          title: 'Should continue if we change an input',
          expected: true,
          cliFiles: [`${testDirectory}/README.md`],
          templateData: {
            outputs: [`${testDirectory}/lib/README.md`],
            inputs: [{ filepath: `${testDirectory}/README.md` }],
          },
        },
      ],
      [
        {
          title: 'Should continue if we change the template',
          expected: true,
          cliFiles: [`${testDirectory}/.README.template.md`],
          templateData: {
            outputs: [`${testDirectory}/lib/README.md`],
            inputs: [{ filepath: `${testDirectory}/README.md` }],
          },
        },
      ],
      [
        {
          title: 'Should stop if no changed files required for readme',
          expected: false,
          cliFiles: [`${testDirectory}/lib/main.js`],
          templateData: {
            outputs: [`${testDirectory}/lib/README.md`],
            inputs: [{ filepath: `${testDirectory}/README.md` }],
          },
        },
      ],
      [
        {
          title: 'Should not continue if we change an output',
          expected: false,
          cliFiles: [`${testDirectory}/lib/README.md`],
          templateData: {
            outputs: [`${testDirectory}/lib/README.md`],
            inputs: [{ filepath: `${testDirectory}/README.md` }],
          },
        },
      ],
    ])('$title', async ({ cliFiles, templateData, expected }) => {
      const actual = __.shouldContinue(cliFiles, templateData);
      expect(actual).toEqual(expected);
    });
  });

  describe('generateAndWrite', () => {
    it('should generate content and write to all outputs', async () => {
      await write('README', `${testDirectory}/README.md`);
      await write('Authors', `${testDirectory}/docs/authors.md`);

      const templateData = {
        inputs: [
          {
            match: 'README.md',
            filepath: `${testDirectory}/README.md`,
          },
          {
            match: 'docs/authors.md',
            filepath: `${testDirectory}/docs/authors.md`,
          },
        ],
        outputs: [`${testDirectory}/lib/README.md`],
        body: dedent`
          # Project

          {file:README.md}

          {file:docs/authors.md}`,
      };

      await __.generateAndWrite(templateData);

      const expected = dedent`
        # Project

        README

        Authors`;

      const actual = await read(`${testDirectory}/lib/README.md`);
      expect(actual).toContain('<!--\n  This file was automatically generated');
      expect(actual).toContain(expected);
    });
  });

  describe('addToGit', () => {
    it('should add all output files to git staging area', async () => {
      const repo = new Gilmore(testDirectory);
      await repo.init();

      const templateData = {
        outputs: [`${testDirectory}/lib/README.md`],
      };
      await newFile(`${testDirectory}/lib/README.md`);

      await __.addToGit(templateData);

      const actual = await repo.stagedFiles();
      expect(actual).toEqual(['lib/README.md']);
    });
  });

  describe('run', () => {
    it('happy path', async () => {
      await write('# firost', `${testDirectory}/README.md`);
      await write(
        dedent`
        ---
        outputs:
          - lib/README.md
        ---
        {file:README.md}
        `,
        `${testDirectory}/.README.template.md`,
      );
      await run();

      const actual = await read(`${testDirectory}/lib/README.md`);
      expect(actual).toContain('# firost');
    });
    describe('--add-to-git', () => {
      beforeEach(async () => {
        vi.spyOn(__, 'warnIfDeprecatedTemplate').mockReturnValue();
        vi.spyOn(__, 'ensureTemplateExists').mockReturnValue();
        vi.spyOn(__, 'getTemplateData').mockReturnValue();
        vi.spyOn(__, 'shouldContinue').mockReturnValue(true);
        vi.spyOn(__, 'generateAndWrite').mockReturnValue();
        vi.spyOn(__, 'addToGit').mockReturnValue();
      });
      it('should not add to git by default', async () => {
        await run();
        expect(__.addToGit).not.toHaveBeenCalled();
      });
      it('should add to git if --add-to-git is passed', async () => {
        await run({ 'add-to-git': true });
        expect(__.addToGit).toHaveBeenCalled();
      });
    });
  });
});
