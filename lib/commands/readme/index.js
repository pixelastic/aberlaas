const helper = require('../../helper.js');
const _ = require('golgoth/lodash');
const pMap = require('golgoth/pMap');
const readJson = require('firost/readJson');
const read = require('firost/read');
const write = require('firost/write');
const glob = require('firost/glob');
const exists = require('firost/exists');
const path = require('path');
const frontMatter = require('front-matter');
const dedent = require('golgoth/dedent');

module.exports = {
  /**
   * Update the main README.md based on the template and the documentation
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    const { docs, lib } = cliArgs;
    const template = await this.getTemplate();
    const data = await this.getData({ docs, lib });
    const content = this.convert(template, data);
    const destination = helper.hostPath('README.md');

    await write(content, destination);
  },
  /**
   * Returns the content of the template
   * Uses the one in .github/README.template.md, or fallback to the one in
   * aberlaas
   * @returns {string} Template content
   **/
  async getTemplate() {
    let filepath = helper.hostPath('.github/README.template.md');
    if (!(await exists(filepath))) {
      filepath = helper.aberlaasPath('templates/_github/README.template.md');
    }
    return await read(filepath);
  },
  /**
   * Returns the data object for conversion from the cliArgs
   * @param {object} userOptions Object to override default docs/lib path
   * @param {string} userOptions.docs Relative path to the documentation
   * @param {string} userOptions.lib Relative path to the lib
   * @returns {object} The data object to use for conversion
   */
  async getData(userOptions = {}) {
    const { docs, lib } = {
      docs: './docs/src',
      lib: './lib',
      ...userOptions,
    };
    const docsPath = helper.hostPath(docs);
    const libPath = helper.hostPath(lib);

    const mdFiles = await glob(`${docsPath}/**/*.md`);
    const packageJson = await readJson(path.resolve(libPath, 'package.json'));
    const data = {
      package: packageJson,
    };
    await pMap(mdFiles, async (filepath) => {
      const shortPath = path.relative(docsPath, filepath);
      const key = shortPath.replace(/\.md$/, '').replace('/', '.');
      const extname = path.extname(filepath);
      const value =
        extname === '.json'
          ? await this.readJson(filepath)
          : await this.read(filepath);
      _.set(data, key, value);
    });
    return data;
  },
  /**
   * Convert a source string by replace {key} with the matching keys of data
   * @param {string} source The source string
   * @param {object} data The data object to use to compile
   * @returns {string} The converted string
   **/
  convert(source, data) {
    const regexp = /{(?<key>.*?)}/gm;
    const matches = Array.from(source.matchAll(regexp));

    let convertedSource = dedent`
    <!--
      This page was automatically generated.
      DO NOT EDIT IT MANUALLY.
      Instead, update .github/README.template.md
      and run aberlaas readme
    -->

    ${source}`;

    _.each(matches, (match) => {
      const key = match.groups.key;
      convertedSource = convertedSource.replace(
        `{${key}}`,
        _.get(data, key, '')
      );
    });
    return convertedSource;
  },
  /**
   * Read a file from disk, removing its front-matter if it has one
   * @param {string} filepath Path to the file
   * @returns {string} File content, stripped of front-matter
   **/
  async read(filepath) {
    const source = await this.__read(filepath);
    const { body } = frontMatter(source);
    return body;
  },
  readJson,
  __read: read,
  exists,
};
