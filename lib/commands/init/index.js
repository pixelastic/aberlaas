import { consoleInfo, run, spinner, write } from 'firost';

import Gilmore from 'gilmore';
import helper from '../../helper.js';
import nodeConfig from '../../configs/node.cjs';
import initMonorepo from './monorepo.js';
import initSimple from './simple.js';

export default {
  /**
   * Configure git hooks to use scripts/hooks instead of .git/hooks
   **/
  async configureGit() {
    const repo = new Gilmore(helper.hostRoot());
    await repo.setConfig('core.hooksPath', 'scripts/hooks');
  },
  /**
   * Pin the node version through nvm
   **/
  async configureNode() {
    const nvmrcPath = helper.hostPath('.nvmrc');
    await write(nodeConfig.nodeVersion, nvmrcPath);
  },
  /**
   * Run yarn install to install all deps
   **/
  async yarnInstall() {
    await run('yarn install');
  },
  /**
   * Copy all config files and configure the scripts
   * @param {object} args Argument object, as passed by minimist
   **/
  async run(args = {}) {
    const isMonorepo = args.monorepo;

    const progress = this.__spinner();

    progress.tick('Configuring Git & Node');
    await this.configureGit();
    await this.configureNode();

    progress.tick('Adding default files ');

    // Create a different scaffolding based on if creating a monorepo or not
    isMonorepo ? await initMonorepo.run() : await initSimple.run();

    progress.success('aberlaas project initialized');

    this.__consoleInfo('Synchronizing dependencies');
    await this.yarnInstall();

    this.__consoleInfo(
      "Don't forget to run aberlaas setup after pushing your repository",
    );
  },
  __consoleInfo: consoleInfo,
  __spinner: spinner,
};
