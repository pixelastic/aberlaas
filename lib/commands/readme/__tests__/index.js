const current = require('../index');
const helper = require('../../../helper');
const pProps = require('golgoth/pProps');
const write = require('firost/write');
const read = require('firost/read');
const writeJson = require('firost/writeJson');
const emptyDir = require('firost/emptyDir');
const _ = require('golgoth/lodash');

describe('readme', () => {
  const tmpDirectory = './tmp/readme';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(`${tmpDirectory}/host`);
    jest
      .spyOn(helper, 'aberlaasRoot')
      .mockReturnValue(`${tmpDirectory}/aberlaas`);
    await emptyDir(tmpDirectory);
  });
  describe('run', () => {
    it.each([
      [
        'Default case',
        {
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
        'No ./lib folder',
        {
          'package.json': { name: 'aoinan' },
          '.github/README.template.md': '## {package.name}\n\n{index}',
          'docs/src/index.md': 'Documentation content',
        },
        {},
        {
          'README.md': '## aoinan\n\nDocumentation content',
        },
      ],
      [
        'Custom options',
        {
          'src/package.json': { name: 'aoinan', version: '1.42' },
          '.README-template.md':
            '## {package.name} v{package.version}\n\n{docs}',
          'documentation/docs.md': 'Documentation content',
        },
        {
          docs: 'documentation',
          output: 'README.mkd,dist/README.md',
          package: 'src/package.json',
          template: '.README-template.md',
        },
        {
          'README.mkd': '## aoinan v1.42\n\nDocumentation content',
          'dist/README.md': '## aoinan v1.42\n\nDocumentation content',
        },
      ],
    ])('%s', async (_title, sourceTree, cliArgs, destinationTree) => {
      await pProps(sourceTree, async (filecontent, filepath) => {
        const writeMethod = _.isObject(filecontent) ? writeJson : write;
        await writeMethod(filecontent, helper.hostPath(filepath));
      });

      await current.run(cliArgs);

      await pProps(destinationTree, async (expected, filepath) => {
        const actual = await read(helper.hostPath(filepath));
        expect(actual).toContain(expected);
      });
    });
  });
  describe('getTemplate', () => {
    it.each([
      [
        'Aberlaas template',
        {
          'aberlaas:/templates/_github/README.template.md': 'aberlaas template',
        },
        {},
        'aberlaas template',
      ],
      [
        'Host template',
        {
          'host:/.github/README.template.md': 'host template',
          'aberlaas:/templates/_github/README.template.md': 'aberlaas template',
        },
        {},
        'host template',
      ],
      [
        'Custom template',
        {
          'host:/README.template.md': 'custom template',
          'host:/.github/README.template.md': 'host template',
          'aberlaas:/templates/_github/README.template.md': 'aberlaas template',
        },
        { template: 'README.template.md' },
        'custom template',
      ],
      [
        'Custom template but does not exist',
        {
          'host:/.github/README.template.md': 'host template',
          'aberlaas:/templates/_github/README.template.md': 'aberlaas template',
        },
        { template: 'README.template.md' },
        'host template',
      ],
    ])('%s', async (_title, sourceTree, cliArgs, expected) => {
      await pProps(sourceTree, async (filecontent, filepath) => {
        const completeFilepath = _.chain(filepath)
          .replace('aberlaas:', helper.aberlaasRoot())
          .replace('host:', helper.hostRoot())
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
        'Custom package',
        {
          'modules/helpers/package.json': { name: 'aoinan-helpers' },
        },
        { package: 'modules/helpers/package.json' },
        { name: 'aoinan-helpers' },
      ],
      [
        'Custom package but does not exist',
        {
          'lib/package.json': { name: 'aoinan' },
        },
        { package: 'modules/helpers/package.json' },
        { name: 'aoinan' },
      ],
    ])('%s', async (_title, sourceTree, cliArgs, expected) => {
      await pProps(sourceTree, async (filecontent, filepath) => {
        await writeJson(filecontent, helper.hostPath(filepath));
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
        await write(filecontent, helper.hostPath(filepath));
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
        './README.md and ./src/README.md if custom --package passed',
        {
          'src/package.json': 'Module package',
        },
        { package: 'src/package.json' },
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
        await write(filecontent, helper.hostPath(filepath));
      });

      const actual = await current.getReadmes(cliArgs);

      const expected = _.map(relativeExpected, (filepath) => {
        return helper.hostPath(filepath);
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
