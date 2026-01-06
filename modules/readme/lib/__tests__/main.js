import { _, pProps } from 'golgoth';
import { absolute, emptyDir, read, write, writeJson } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import current from '../main.js';

describe('readme', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/readme');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(`${tmpDirectory}/host`);
    await emptyDir(tmpDirectory);
  });
  describe('run', () => {
    it.each([
      [
        'Simple repo with docs',
        {
          'package.json': { name: 'aoinan-monorepo' },
          'lib/package.json': { name: 'aoinan' },
          '.github/README.template.md': '## {package.name}\n\n{index}',
          'docs/src/index.md': 'Documentation content',
        },
        {},
        {
          'README.md': '## aoinan\n\nDocumentation content',
          'lib/README.md': '## aoinan\n\nDocumentation content',
        },
      ],
      [
        'Complex monorepo',
        {
          'package.json': { name: 'norska-monorepo' },
          'modules/lib/package.json': { name: 'norska' },
          'modules/docs/src/index.md': 'Documentation content',
          '.github/README.template.md': '## {package.name}\n\n{index}',
        },
        {
          docs: 'modules/docs/src',
          lib: 'modules/lib',
        },
        {
          'README.md': '## norska\n\nDocumentation content',
          'modules/lib/README.md': '## norska\n\nDocumentation content',
        },
      ],
      [
        'Custom output',
        {
          'lib/package.json': { name: 'aoinan' },
          'docs/src/index.md': 'Documentation content',
          '.github/README.template.md': '## {package.name}\n\n{index}',
        },
        {
          output: 'README.mkd,dist/README.md',
        },
        {
          'README.mkd': '## aoinan\n\nDocumentation content',
          'dist/README.md': '## aoinan\n\nDocumentation content',
        },
      ],
      [
        'Custom template',
        {
          'lib/package.json': { name: 'aoinan', version: '1.42' },
          'docs/src/examples.md': 'Some examples',
          'README.template.md':
            '## {package.name} v{package.version}\n\n{examples}',
        },
        {
          template: 'README.template.md',
        },
        {
          'README.md': '## aoinan v1.42\n\nSome examples',
          'lib/README.md': '## aoinan v1.42\n\nSome examples',
        },
      ],
    ])('%s', async (_title, sourceTree, cliArgs, destinationTree) => {
      await pProps(sourceTree, async (filecontent, filepath) => {
        const writeMethod = _.isObject(filecontent) ? writeJson : write;
        await writeMethod(filecontent, helper.hostGitPath(filepath));
      });

      await current.run(cliArgs);

      await pProps(destinationTree, async (expected, filepath) => {
        const actual = await read(helper.hostGitPath(filepath));
        expect(actual).toContain(expected);
      });
    });
  });
  describe('getTemplate', () => {
    it.each([
      [
        'Aberlaas template',
        {
          'aberlaas:/README.md': 'aberlaas template',
        },
        {},
        'aberlaas template',
      ],
      [
        'Host template',
        {
          'host:/.github/README.template.md': 'host template',
          'aberlaas:/README.md': 'aberlaas template',
        },
        {},
        'host template',
      ],
      [
        'Custom template',
        {
          'host:/README.template.md': 'custom template',
          'host:/.github/README.template.md': 'host template',
          'aberlaas:/README.md': 'aberlaas template',
        },
        { template: 'README.template.md' },
        'custom template',
      ],
      [
        'Custom template but does not exist',
        {
          'host:/.github/README.template.md': 'host template',
          'aberlaas:/README.md': 'aberlaas template',
        },
        { template: 'README.template.md' },
        'host template',
      ],
    ])('%s', async (_title, sourceTree, cliArgs, expected) => {
      await pProps(sourceTree, async (filecontent, filepath) => {
        const completeFilepath = _.chain(filepath)
          .replace('aberlaas:', absolute('../../templates'))
          .replace('host:', helper.hostGitRoot())
          .value();
        await write(filecontent, completeFilepath);
      });

      const actual = await current.getTemplate(cliArgs);

      expect(actual).toEqual(expected);
    });
  });
  describe('getPackageData', () => {
    it.each([
      [
        './lib/package.json is available',
        {
          'lib/package.json': { name: 'aoinan' },
          'package.json': { name: 'aoinan-monorepo' },
        },
        {},
        { name: 'aoinan' },
      ],
      [
        './lib/package.json is not available, but ./package.json is',
        {
          'package.json': { name: 'aoinan' },
        },
        {},
        { name: 'aoinan' },
      ],
      [
        'Custom --lib',
        {
          'package.json': { name: 'aoinan-monorepo' },
          'modules/lib/package.json': { name: 'aoinan' },
        },
        { lib: 'modules/lib' },
        { name: 'aoinan' },
      ],
      [
        'Custom package but does not exist',
        {
          'package.json': { name: 'aoinan-fallback' },
        },
        { lib: 'modules/lib' },
        { name: 'aoinan-fallback' },
      ],
    ])('%s', async (_title, sourceTree, cliArgs, expected) => {
      await pProps(sourceTree, async (filecontent, filepath) => {
        await writeJson(filecontent, helper.hostGitPath(filepath));
      });

      const actual = await current.getPackageData(cliArgs);

      expect(actual).toEqual(expected);
    });
  });
  describe('getDocsData', () => {
    it.each([
      [
        'All files in ./docs/src',
        {
          'docs/src/index.md': dedent(`
          ---
          title: My module
          ---

          Index content
          `),
          'docs/src/installation.md': 'Installation content',
          'docs/src/commands/index.md': 'Commands content',
          'docs/src/commands/init.md': 'Init command content',
          'docs/src/commands/read/index.md': 'Read command content',
        },
        {},
        {
          index: 'Index content',
          installation: 'Installation content',
          commands: {
            index: 'Commands content',
            init: 'Init command content',
            read: {
              index: 'Read command content',
            },
          },
        },
      ],
      [
        'Files in a custom dir',
        {
          'documentation/source/index.md': 'Index content',
        },
        { docs: 'documentation/source' },
        {
          index: 'Index content',
        },
      ],
    ])('%s', async (_title, sourceTree, cliArgs, expected) => {
      await pProps(sourceTree, async (filecontent, filepath) => {
        await write(filecontent, helper.hostGitPath(filepath));
      });

      const actual = await current.getDocsData(cliArgs);

      expect(actual).toEqual(expected);
    });
  });
  describe('getReadmes', () => {
    it.each([
      [
        './README.md and ./lib/README.md by default',
        {
          'lib/package.json': 'Module package',
        },
        {},
        ['README.md', 'lib/README.md'],
      ],
      ['./README.md only if no ./lib/package.json', {}, {}, ['README.md']],
      [
        './README.md and ./src/README.md if custom --lib passed',
        {
          'src/package.json': 'Module package',
        },
        { lib: 'src' },
        ['README.md', 'src/README.md'],
      ],
      [
        'Custom outputs if --output given',
        {},
        { output: 'README.markdown,code/README.md' },
        ['README.markdown', 'code/README.md'],
      ],
    ])('%s', async (_title, sourceTree, cliArgs, relativeExpected) => {
      await pProps(sourceTree, async (filecontent, filepath) => {
        await write(filecontent, helper.hostGitPath(filepath));
      });

      const actual = await current.getReadmes(cliArgs);

      const expected = _.map(relativeExpected, (filepath) => {
        return helper.hostGitPath(filepath);
      });

      expect(actual).toEqual(expected);
    });
  });
  describe('convert', () => {
    it.each([
      [
        'Reading from the package.json',
        '# {package.name}',
        { package: { name: 'aberlaas' } },
        '# aberlaas',
      ],
      [
        'Reading from documentation',
        '## Installation\n\n{installation}',
        { installation: 'Installation content' },
        '## Installation\n\nInstallation content',
      ],
      [
        'Reading nested documentation keys',
        '## Init\n\n{commands.init}',
        { commands: { init: 'Init content' } },
        '## Init\n\nInit content',
      ],
      [
        'Ignoring missing keys',
        '# {package.name}{nope.nope}',
        { package: { name: 'aberlaas' } },
        '# aberlaas',
      ],
    ])('%s', async (_title, source, data, expected) => {
      const actual = current.convert(source, data);
      expect(actual).toContain(expected);
    });
  });
});
