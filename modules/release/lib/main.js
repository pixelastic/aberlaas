import path from 'node:path';
import { consoleInfo, firostError, readJson, run, writeJson } from 'firost';
import Gilmore from 'gilmore';
import { _, pMap } from 'golgoth';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import semver from 'semver';
import { ensureValidRepository } from './ensureValidRepository.js';

export default {
  /**
   * Wrapper to release the current module(s)
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   */
  async run(cliArgs = {}) {
    const bumpType = cliArgs._[0]; // major/minor/patch

    if (!_.includes(['patch', 'minor', 'major'], bumpType)) {
      throw firostError(
        'ABERLAAS_RELEASE_UNKNOWN_BUMP_TYPE',
        'Bump type should be either major, minor or patch',
      );
    }

    // Make sure we're in a valid state to release
    await ensureValidRepository(cliArgs);

    // Get all the packages to release and current version
    const allPackagesToRelease = await this.getAllPackagesToRelease();
    const currentVersion = allPackagesToRelease[0].content.version;
    const newVersion = semver.inc(currentVersion, bumpType);

    // We bump the version of all packages
    await pMap(allPackagesToRelease, async ({ filepath, content }) => {
      const packageName = content.name;
      consoleInfo(`Updating ${packageName} to ${newVersion}`);
      const newContent = { ...content, version: newVersion };
      await writeJson(newContent, filepath, {
        sort: false,
      });
    });

    // TODO: Need to generate a changelog
    //   // 6. Generate changelog
    //   console.log('📝 Generating changelog...');
    //   await changelog(newVersion);
    //   console.log('✓ Changelog generated\n');

    // Commit the changes
    const gitRoot = hostGitRoot();
    consoleInfo(`Creating new commit for version v${newVersion}`);
    const repo = new Gilmore(gitRoot);
    await repo.add(_.map(allPackagesToRelease, 'filepath'));
    await repo.commit(`v${newVersion}`, { skipHook: true });

    // Publish all the packages
    await pMap(
      allPackagesToRelease,
      async ({ filepath, content }) => {
        const packageName = content.name;
        consoleInfo(`Publishing ${packageName} to npm`);

        const packageDir = path.dirname(filepath);
        await run('npm publish --access public', { cwd: packageDir });
      },
      { concurrency: 1 },
    );

    // We create a tag for this version
    await repo.createTag(`v${newVersion}`);

    // We push to the remote
    consoleInfo(`Creating tag v${newVersion} and pushing to repo`);
    await repo.push();
    // TODO: Need to add tests for this process
  },

  async getAllPackagesToRelease() {
    const rootPackagePath = hostGitPath('package.json');
    const rootPackageContent = await readJson(rootPackagePath);
    const workspaces = rootPackageContent.workspaces;

    // If no workspaces, this is the package to publish
    if (!workspaces) {
      if (rootPackageContent.private) {
        return [];
      }
      return [
        {
          filepath: rootPackagePath,
          content: rootPackageContent,
        },
      ];
    }

    // If workspaces, we get the packages of all those workspaces
    const rootPath = hostGitRoot();
    const workspacePackagesPath = _.chain(workspaces)
      .castArray()
      .map((item) => {
        return `${rootPath}/${item}/package.json`;
      })
      .value();

    const rawList = await pMap(workspacePackagesPath, async (filepath) => {
      const content = await readJson(filepath);
      // We skip the private packages
      if (content.private) {
        return false;
      }
      return {
        filepath,
        content,
      };
    });

    return _.compact(rawList);
  },
};
