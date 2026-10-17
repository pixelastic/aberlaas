import { _, pMap } from 'golgoth';
import { absolute, firostError, read, write } from 'firost';
import { getConfigPath } from 'aberlaas-helper';
import { format as prettierFormat, resolveConfig } from 'prettier';
import * as prettierTailwindPlugin from 'prettier-plugin-tailwindcss';

/**
 * Fix files using prettier
 * @param {Array} inputFiles Files to auto-fix
 */
export async function prettierFix(inputFiles) {
  // Config file
  const configPath = await getConfigPath(
    null,
    'prettier.config.js',
    absolute('../../configs/prettier.js'),
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
        // Find the prettier options to apply
        const config = await resolveConfig(filepath, { config: configPath });
        const options = { ...config, plugins, filepath };
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
