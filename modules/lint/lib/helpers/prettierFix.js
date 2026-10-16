import path from 'node:path';
import { _, pMap } from 'golgoth';
import { firostError, read, write } from 'firost';
import { getConfig } from 'aberlaas-helper';
import { format as prettierFormat } from 'prettier';
import * as prettierTailwindPlugin from 'prettier-plugin-tailwindcss';
import prettierConfig from '../../configs/prettier.js';

export let __;

/**
 * Fix files using prettier
 * @param {Array} inputFiles Files to auto-fix
 */
export async function prettierFix(inputFiles) {
  // Config file
  const { overrides, ...config } = await getConfig(
    null,
    'prettier.config.js',
    prettierConfig,
  );

  // Plugins
  const plugins = [prettierTailwindPlugin];

  const errors = [];

  // Read all files, run them through the formatter and save them back to disk
  // If any emits error, store the errors and display them all in one output
  await pMap(
    inputFiles,
    async (filepath) => {
      try {
        const content = await read(filepath);
        const overrideOptions = __.getOverrideOptions(overrides, filepath);
        const options = { ...config, ...overrideOptions, plugins, filepath };
        const result = await prettierFormat(content, options);
        await write(result, filepath);
      } catch (error) {
        const message = error.toString();
        errors.push({ filepath, message });
      }
    },
    { concurrency: 10 },
  );

  if (_.isEmpty(errors)) {
    return;
  }

  let formattedErrors = '';
  _.each(errors, (error) => {
    formattedErrors = `${formattedErrors}${error.filepath}\n\n${error.message}\n\n`;
  });

  throw firostError(
    'ABERLAAS_LINT_PRETTIER_FIX',
    `Some files could not be automatically fixed:\n\n${formattedErrors}`,
  );
}

__ = {
  /**
   * Merge the options of all overrides matching a file.
   * Prettier's format() ignores overrides, only its config resolver applies
   * them, so we have to do it ourselves.
   * @param {Array} overrides Prettier overrides, each with files and options
   * @param {string} filepath File being formatted
   * @returns {object} Options of all matching overrides
   */
  getOverrideOptions(overrides, filepath) {
    return _.chain(overrides)
      .filter(({ files }) =>
        _.chain(files)
          .castArray()
          .some((pattern) =>
            path.matchesGlob(
              _.includes(pattern, '/') ? filepath : path.basename(filepath),
              pattern,
            ),
          )
          .value(),
      )
      .transform((result, { options }) => _.assign(result, options), {})
      .value();
  },
};
