const current = require('../index');
const helper = require('../../../helper');
const pProps = require('golgoth/pProps');
const write = require('firost/write');
const writeJson = require('firost/writeJson');
const emptyDir = require('firost/emptyDir');

describe('readme', () => {
  const root = './tmp/readme';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(`${root}/host`);
    jest.spyOn(helper, 'aberlaasRoot').mockReturnValue(`${root}/aberlaas`);
  });
  describe('getTemplate', () => {
    beforeEach(async () => {
      await emptyDir(root);
    });
    it.each([
      [
        'Custom template in the host',
        {
          host: {
            '.github/README.template.md': 'custom template',
          },
          aberlaas: {
            'templates/_github/README.template.md': 'default template',
          },
        },
        'custom template',
      ],
      [
        'Default template',
        {
          host: {},
          aberlaas: {
            'templates/_github/README.template.md': 'default template',
          },
        },
        'default template',
      ],
    ])('%s', async (_name, files, expected) => {
      await pProps(files.host, async (content, path) => {
        await write(content, helper.hostPath(path));
      });
      await pProps(files.aberlaas, async (content, path) => {
        await write(content, helper.aberlaasPath(path));
      });

      const actual = await current.getTemplate();
      expect(actual).toEqual(expected);
    });
  });
  describe('convert', () => {
    it.each([
      ['# {package.name}', { package: { name: 'aberlaas' } }, '# aberlaas'],
      ['# {index}', { index: 'content' }, '# content'],
      [
        '# {package.name}{nope.nope}',
        { package: { name: 'aberlaas' } },
        '# aberlaas',
      ],
    ])('%s', async (source, data, expected) => {
      const actual = current.convert(source, data);
      expect(actual).toContain(expected);
    });
  });
  describe('getData', () => {
    it('should get all the data', async () => {
      await write('index content', helper.hostPath('docs/src/index.md'));
      await write('index content v2', helper.hostPath('docs/src/v2/index.md'));
      await writeJson(
        { name: 'packageName' },
        helper.hostPath('lib/package.json')
      );

      const actual = await current.getData();
      expect(actual).toHaveProperty('index', 'index content');
      expect(actual).toHaveProperty('v2.index', 'index content v2');
      expect(actual).toHaveProperty('package.name', 'packageName');
    });
  });
  describe('read', () => {
    it('should return the content, stripped of front-matter', async () => {
      const content = dedent`
      ---
      title: My title
      layout: docs
      ---

      This is the content`;
      const filepath = helper.hostPath('docs/src/index.md');

      await write(content, filepath);

      const actual = await current.read(filepath);
      expect(actual).toEqual('This is the content');
    });
  });
});
