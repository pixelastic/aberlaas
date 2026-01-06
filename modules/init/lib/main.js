import { consoleInfo, firostError, run, spinner, write } from 'firost';

import Gilmore from 'gilmore';
import { hostGitRoot, hostGitPath } from 'aberlaas-helper';
import { nodeVersion } from 'aberlaas-versions';
import moduleLayout from './layouts/module.js';
import libdocsLayout from './layouts/libdocs.js';
import monorepoLayout from './layouts/monorepo.js';

export default {
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
    await run('yarn install');
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
        "You can't specific both --monorepo and --libdocs",
      );
    }

    if (args.monorepo) {
      return this.__monorepoLayout();
    }
    if (args.libdocs) {
      return this.__libdocsLayout();
    }
    return this.__moduleLayout();
  },
  /**
   * Copy all config files and configure the scripts
   * @param {object} args Argument object, as passed by minimist
   */
  async run(args = {}) {
    const progress = this.__spinner();

    progress.tick('Configuring Git & Node');
    await this.configureGit();
    await this.configureNode();

    progress.tick('Adding default files ');

    // Create a different scaffolding based on if creating a monorepo or not
    const layout = this.getLayout(args);
    await layout.run();

    progress.success('aberlaas project initialized');

    this.__consoleInfo('Synchronizing dependencies');
    await this.yarnInstall();

    this.__consoleInfo(
      "Don't forget to run aberlaas setup after pushing your repository",
    );
  },
  __consoleInfo: consoleInfo,
  __spinner: spinner,
  // Why the old-school getters? So we can mock which layout is returned
  __moduleLayout() {
    return moduleLayout;
  },
  __libdocsLayout() {
    return libdocsLayout;
  },
  __monorepoLayout() {
    return monorepoLayout;
  },
};
