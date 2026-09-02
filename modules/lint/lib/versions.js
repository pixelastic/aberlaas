import { _ } from 'golgoth';
import { exists, firostError, read, readJson, write, writeJson } from 'firost';
import { hostGitPath } from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';

export let __;

/**
 * Check that version fields in project files match expected values
 * @returns {boolean} True when all versions match
 */
export async function run() {
  const { mismatches } = await __.findMismatches();

  if (_.isEmpty(mismatches)) {
    return true;
  }

  const summary = mismatches
    .map(({ file, field, actual, expected }) => {
      const label = field ? `${file}#${field}` : file;
      return `  ${label}: ${actual} → ${expected}`;
    })
    .join('\n');
  const message = `Version mismatch:\n${summary}`;
  throw firostError('ABERLAAS_LINT_VERSIONS', message);
}

/**
 * Fix version mismatches in project files, then verify
 * @returns {boolean} True when all versions match after patching
 */
export async function fix() {
  const { mismatches, files } = await __.findMismatches();

  if (_.isEmpty(mismatches)) {
    return true;
  }

  const mismatchedFiles = _.map(mismatches, 'file');

  // package.json
  if (_.includes(mismatchedFiles, 'package.json')) {
    const { path, content: packageJson } = files['package.json'];
    _.each(mismatches, ({ file, field, expected }) => {
      if (file !== 'package.json') {
        return;
      }
      _.set(packageJson, field, expected);
    });
    await writeJson(packageJson, path);
  }

  // .nvmrc
  if (_.includes(mismatchedFiles, '.nvmrc')) {
    await write(nodeVersion, files['.nvmrc'].path);
  }

  // .circleci/config.yml
  if (_.includes(mismatchedFiles, '.circleci/config.yml')) {
    let { content: circleCiConfig } = files['.circleci/config.yml'];
    circleCiConfig = circleCiConfig.replace(
      /cimg\/node:\S+/g,
      `cimg/node:${nodeVersion}`,
    );
    circleCiConfig = circleCiConfig.replace(
      /yarn set version \S+/g,
      `yarn set version ${yarnVersion}`,
    );
    await write(circleCiConfig, files['.circleci/config.yml'].path);
  }

  return await run();
}

__ = {
  /**
   * Collect all version mismatches and loaded file contents
   * @returns {object} { mismatches: object[], files: object }
   */
  async findMismatches() {
    const mismatches = [];
    const files = {};

    const packageJsonPath = await hostGitPath('package.json');
    const packageJson = await readJson(packageJsonPath);
    files['package.json'] = { path: packageJsonPath, content: packageJson };
    const expectedPackageManager = `yarn@${yarnVersion}`;
    const actualPackageManager = packageJson.packageManager;

    if (actualPackageManager !== expectedPackageManager) {
      mismatches.push({
        file: 'package.json',
        field: 'packageManager',
        actual: actualPackageManager || '(missing)',
        expected: expectedPackageManager,
      });
    }

    // engines.node
    const expectedEnginesNode = `>=${nodeVersion}`;
    const actualEnginesNode = _.get(packageJson, 'engines.node');
    if (actualEnginesNode !== expectedEnginesNode) {
      mismatches.push({
        file: 'package.json',
        field: 'engines.node',
        actual: actualEnginesNode || '(missing)',
        expected: expectedEnginesNode,
      });
    }

    // .nvmrc (skip if file does not exist)
    const nvmrcPath = await hostGitPath('.nvmrc');
    if (await exists(nvmrcPath)) {
      files['.nvmrc'] = { path: nvmrcPath };
      const actualNvmrc = _.trim(await read(nvmrcPath));
      if (actualNvmrc !== nodeVersion) {
        mismatches.push({
          file: '.nvmrc',
          actual: actualNvmrc,
          expected: nodeVersion,
        });
      }
    }

    // .circleci/config.yml (skip if file does not exist)
    const circleCiPath = await hostGitPath('.circleci/config.yml');
    if (await exists(circleCiPath)) {
      const circleCiContent = await read(circleCiPath);
      files['.circleci/config.yml'] = {
        path: circleCiPath,
        content: circleCiContent,
      };

      // cimg/node pattern
      const cimgMatch = circleCiContent.match(/cimg\/node:(\S+)/);
      if (cimgMatch) {
        const actualCimg = `cimg/node:${cimgMatch[1]}`;
        const expectedCimg = `cimg/node:${nodeVersion}`;
        if (actualCimg !== expectedCimg) {
          mismatches.push({
            file: '.circleci/config.yml',
            actual: actualCimg,
            expected: expectedCimg,
          });
        }
      }

      // yarn set version pattern
      const yarnSetMatch = circleCiContent.match(/yarn set version (\S+)/);
      if (yarnSetMatch) {
        const actualYarnSet = `yarn set version ${yarnSetMatch[1]}`;
        const expectedYarnSet = `yarn set version ${yarnVersion}`;
        if (actualYarnSet !== expectedYarnSet) {
          mismatches.push({
            file: '.circleci/config.yml',
            actual: actualYarnSet,
            expected: expectedYarnSet,
          });
        }
      }
    }

    return { mismatches, files };
  },
};

export default {
  run,
  fix,
};
