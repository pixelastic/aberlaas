import path from 'node:path';
import { _, pMap } from 'golgoth';
import dedent from 'dedent';
import { absolute, exists, glob, read, readJson, write } from 'firost';
import frontMatter from 'front-matter';
import helper from 'aberlaas-helper';

export default {
  /**
   * Update the main README.md based on the template and the documentation
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {string} cliArgs.template Path to the template (default to
   * .github/README.template.md
   * @param {string} cliArgs.docs Path to the documentation folder
   * @param {string} cliArgs.lib Path to the library folder
   * @param {string} cliArgs.output List of files to output. Default to
   * README at the root, and next to package.json
   */
  async run(cliArgs) {
    const template = await this.getTemplate(cliArgs);

    const packageData = await this.getPackageData(cliArgs);
    const docsData = await this.getDocsData(cliArgs);
    const data = { package: packageData, ...docsData };

    const output = await this.getReadmes(cliArgs);

    const content = await this.convert(template, data);
    // console.info({ template, data, docsData });

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
   */
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

    const aberlaasDefaultTemplate = absolute('../templates/README.md');
    return await read(aberlaasDefaultTemplate);
  },
  /**
   * Returns the content of the library package.json
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * Will default search in cliArgs.lib, ./lib, or the root
   * @returns {object} package.json content
   */
  async getPackageData(cliArgs = {}) {
    const packagePath = await this.getPackagePath(cliArgs);
    return await readJson(packagePath);
  },
  /**
   * Returns the path to the package.json
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * Will default search in cliArgs.lib, ./lib, or the root
   * @returns {object} package.json content
   */
  async getPackagePath(cliArgs = {}) {
    const libFolder = helper.hostPath(cliArgs.lib || './lib');
    let packagePath = path.resolve(libFolder, 'package.json');

    if (await exists(packagePath)) {
      return packagePath;
    }

    return helper.hostPath('package.json');
  },
  /**
   * Returns all documentation as an object
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {string} cliArgs.docs Path to the documentation directory
   * Will default to ./docs/src
   * @returns {object} Documentation content
   */
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
   */
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
      'README.md',
    );

    const readmes = _.uniq([hostReadmePath, moduleReadmePath]);
    return readmes;
  },
  /**
   * Convert a source string by replace {key} with the matching keys of data
   * @param {string} source The source string
   * @param {object} data The data object to use to compile
   * @returns {string} The converted string
   */
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
        _.get(data, key, ''),
      );
    });
    return convertedSource;
  },
  /**
   * Read a file from disk, removing its front-matter if it has one
   * @param {string} filepath Path to the file
   * @returns {string} File content, stripped of front-matter
   */
  async read(filepath) {
    const source = await this.__read(filepath);
    const { body } = frontMatter(source);
    return body;
  },
};
