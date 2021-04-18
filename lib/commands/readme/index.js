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
   * @param {string} cliArgs.template Path to the template (default to
   * .github/README.template.md
   * @param {string} cliArgs.docs Path to ./docs folder
   * @param {string} cliArgs.package Path to package.json
   * @param {string} cliArgs.output List of files to output. Default to
   * README at the root, and next to package.json
   **/
  async run(cliArgs) {
    const template = await this.getTemplate(cliArgs);

    const packageData = await this.getPackageData(cliArgs);
    const docsData = await this.getDocsData(cliArgs);
    const data = { package: packageData, ...docsData };

    const output = await this.getReadmes(cliArgs);

    const content = await this.convert(template, data);

    await pMap(output, async (filepath) => {
      await write(content, filepath);
    });
  },
  /**
   * Returns the content of the template
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {string} cliArgs.template Path to the template
   * Will default to .github/README.template.md in the host, or fallback to
   * a default value in aberllas
   * @returns {string} Template content
   **/
  async getTemplate(cliArgs = {}) {
    if (cliArgs.template) {
      const customTemplate = helper.hostPath(cliArgs.template);
      if (await exists(customTemplate)) {
        return await read(customTemplate);
      }
    }

    const hostDefaultTemplate = helper.hostPath('.github/README.template.md');
    if (await exists(hostDefaultTemplate)) {
      return await read(hostDefaultTemplate);
    }

    const aberlaasDefaultTemplate = helper.aberlaasPath(
      'templates/_github/README.template.md'
    );
    return await read(aberlaasDefaultTemplate);
  },
  /**
   * Returns the content of the package.json
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {string} cliArgs.package Path to a custom package.json
   * Will default to ./lib/package.json if available, or fallback to
   * ./package.json in the root
   * @returns {object} package.json content
   **/
  async getPackageData(cliArgs = {}) {
    const packagePath = await this.getPackagePath(cliArgs);
    return await readJson(packagePath);
  },
  /**
   * Returns the path to the package.json
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {string} cliArgs.package Path to a custom package.json
   * Will default to ./lib/package.json if available, or fallback to
   * ./package.json in the root
   * @returns {object} package.json content
   **/
  async getPackagePath(cliArgs = {}) {
    if (cliArgs.package) {
      const customPackagePath = helper.hostPath(cliArgs.package);
      if (await exists(customPackagePath)) {
        return customPackagePath;
      }
    }

    const libPackagePath = helper.hostPath('lib/package.json');
    if (await exists(libPackagePath)) {
      return libPackagePath;
    }

    const rootPackagePath = helper.hostPath('package.json');
    return rootPackagePath;
  },
  /**
   * Returns all documentation as an object
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {string} cliArgs.docs Path to the documentation directory
   * Will default to ./docs/src
   * @returns {object} Documentation content
   **/
  async getDocsData(cliArgs = {}) {
    const docsPath = helper.hostPath(cliArgs.docs || './docs/src');
    const mdFiles = await glob(`${docsPath}/**/*.md`);
    const docsData = {};
    await pMap(mdFiles, async (filepath) => {
      // Convert filepath to a (nested) dot key
      const key = _.chain(path.relative(docsPath, filepath))
        .replace(/\.md$/, '')
        .replace(/\//g, '.')
        .value();

      // Grab the content, excluding front-matter
      const rawContent = await read(filepath);
      const { body } = frontMatter(rawContent);
      _.set(docsData, key, body);
    });
    return docsData;
  },
  /**
   * Returns path to all README.md to write
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {string} cliArgs.output Comma-separated list of output path
   * Will default to a README.md at the git root, and one in the module code
   * (./lib by default)
   * @returns {Array} List of paths to write the READMEs
   **/
  async getReadmes(cliArgs = {}) {
    // Custom --output passed as a comma-separated list
    if (cliArgs.output) {
      return _.chain(cliArgs.output)
        .split(',')
        .map((filepath) => {
          return helper.hostPath(filepath);
        })
        .sort()
        .value();
    }

    // README.md at the git root for GitHub
    const hostReadmePath = helper.hostPath('README.md');

    // README.md in the module folder for npm/yarn
    const packagePath = await this.getPackagePath(cliArgs);
    const moduleReadmePath = path.resolve(
      path.dirname(packagePath),
      'README.md'
    );

    const readmes = _.uniq([hostReadmePath, moduleReadmePath]);
    return readmes;
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
      This page was automatically generated by aberlaas readme.
      DO NOT EDIT IT MANUALLY.
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
};
