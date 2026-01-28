import {
  consoleInfo,
  firostError,
  run as firostRun,
  spinner,
  write,
} from 'firost';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import { nodeVersion } from 'aberlaas-versions';
import Gilmore from 'gilmore';
import libdocsLayout from './layouts/libdocs.js';
import moduleLayout from './layouts/module.js';
import monorepoLayout from './layouts/monorepo.js';

export let __;

/**
 * Copy all config files and configure the scripts
 * @param {object} args Argument object, as passed by minimist
 */
export async function run(args = {}) {
  const progress = __.spinner();

  progress.tick('Configuring Git & Node');
  await __.configureGit();
  await __.configureNode();

  progress.tick('Adding default files ');

  // Create a different scaffolding based on if creating a monorepo or not
  const layout = __.getLayout(args);
  await layout.run();

  progress.success('aberlaas project initialized');

  __.consoleInfo('Synchronizing dependencies');
  await __.yarnInstall();

  __.consoleInfo(
    "Don't forget to run aberlaas setup after pushing your repository",
  );
}

__ = {
  /**
   * Configure git hooks to use scripts/hooks instead of .git/hooks
   */
  async configureGit() {
    const repo = new Gilmore(hostGitRoot());
    await repo.setConfig('core.hooksPath', 'scripts/hooks');
  },

  /**
   * Pin the node version through nvm
   */
  async configureNode() {
    const nvmrcPath = hostGitPath('.nvmrc');
    await write(nodeVersion, nvmrcPath);
  },

  /**
   * Run yarn install to install all deps
   */
  async yarnInstall() {
    await firostRun('yarn install');
  },

  /**
   * Returns the correct layout object, based on args
   * @param {object} args Arguments, as passed by minimist
   * @returns {object} Object with a .run() method
   **/
  getLayout(args) {
    if (args.monorepo && args.libdocs) {
      throw firostError(
        'ABERLAAS_INIT_LAYOUT_INCOMPATIBLE',
        "You can't specify both --monorepo and --libdocs",
      );
    }

    if (args.monorepo) {
      return __.monorepoLayout();
    }
    if (args.libdocs) {
      return __.libdocsLayout();
    }
    return __.moduleLayout();
  },

  // Why the old-school getters? So we can mock which layout is returned
  moduleLayout() {
    return moduleLayout;
  },
  libdocsLayout() {
    return libdocsLayout;
  },
  monorepoLayout() {
    return monorepoLayout;
  },
  spinner,
  consoleInfo,
};

export default {
  run,
};
