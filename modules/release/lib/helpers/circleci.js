import { _ } from 'golgoth';
import {
  consoleInfo,
  firostError,
  read,
  remove,
  run,
  select,
  write,
} from 'firost';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import YAML, { Alias, Pair, Scalar } from 'yaml';

const CONFIG_PATH = '.circleci/config.yml';

export let __;

/**
 * Check if the CircleCI config already has a trusted-publish workflow
 * @returns {boolean} True if trusted-publish workflow exists
 */
export async function hasPublishWorkflow() {
  const content = await read(hostGitPath(CONFIG_PATH));
  const doc = YAML.parseDocument(content);
  const workflows = doc.get('workflows');
  return workflows.has('trusted-publish');
}

/**
 * Add the trusted-publish workflow to the CircleCI config
 */
export async function addPublishWorkflow() {
  const configPath = hostGitPath(CONFIG_PATH);
  const originalContent = await read(configPath);
  const doc = YAML.parseDocument(originalContent);

  __.addParameters(doc);
  __.addPublishJob(doc);
  __.addPublishWorkflow(doc);
  __.addCommitWorkflowGuard(doc);

  const modifiedContent = doc.toString();
  const approvedContent = await __.confirmOrEditConfig(
    originalContent,
    modifiedContent,
  );
  await write(approvedContent, configPath);
  await __.commitConfig();
}

__ = {
  /**
   * Add parameters block to config:
   *
   * ```yaml
   * parameters:
   *   trusted_publish:
   *     type: boolean
   *     default: false
   *   packages:
   *     type: string
   *     default: ''
   * ```
   *
   * Inserted after 'version' for readability.
   * @param {object} doc - YAML document
   */
  addParameters(doc) {
    const params = doc.createNode({
      trusted_publish: { type: 'boolean', default: false },
      packages: { type: 'string', default: '' },
    });

    const items = doc.contents.items;
    const versionIndex = _.findIndex(
      items,
      (pair) => pair.key?.value === 'version',
    );
    items.splice(
      versionIndex + 1,
      0,
      new Pair(new Scalar('parameters'), params),
    );
  },

  /**
   * Add the trusted-publish job:
   *
   * ```yaml
   * trusted-publish:
   *   <<: *defaults
   *   steps:
   *     - checkout
   *     - *restore_cache
   *     - *install_yarn
   *     - *install_dependencies
   *     - *save_cache
   *     - run: 'yarn run ci --trusted-publish "<< pipeline.parameters.packages >>"'
   * ```
   *
   * @param {object} doc - YAML document
   */
  addPublishJob(doc) {
    const jobs = doc.get('jobs');

    const steps = doc.createNode([]);
    steps.items = [
      new Scalar('checkout'),
      new Alias('restore_cache'),
      new Alias('install_yarn'),
      new Alias('install_dependencies'),
      new Alias('save_cache'),
      doc.createNode({
        run: 'yarn run ci --trusted-publish "<< pipeline.parameters.packages >>"',
      }),
    ];

    const job = doc.createNode({});
    job.items = [
      new Pair(new Scalar('<<'), new Alias('defaults')),
      new Pair(new Scalar('steps'), steps),
    ];

    jobs.items.push(new Pair(new Scalar('trusted-publish'), job));
  },

  /**
   * Add the trusted-publish workflow:
   *
   * ```yaml
   * trusted-publish:
   *   when: << pipeline.parameters.trusted_publish >>
   *   jobs:
   *     - trusted-publish
   * ```
   *
   * @param {object} doc - YAML document
   */
  addPublishWorkflow(doc) {
    const workflows = doc.get('workflows');

    const workflowNode = doc.createNode({
      when: '<< pipeline.parameters.trusted_publish >>',
      jobs: ['trusted-publish'],
    });

    workflows.items.push(new Pair(new Scalar('trusted-publish'), workflowNode));
  },

  /**
   * Add when-not guard to the commit workflow:
   *
   * ```yaml
   * commit:
   *   when: not << pipeline.parameters.trusted_publish >>
   *   jobs:
   *     - ci
   * ```
   *
   * @param {object} doc - YAML document
   */
  addCommitWorkflowGuard(doc) {
    const commitWorkflow = doc.getIn(['workflows', 'commit']);

    const whenPair = new Pair(
      new Scalar('when'),
      new Scalar('not << pipeline.parameters.trusted_publish >>'),
    );
    commitWorkflow.items.unshift(whenPair);
  },

  /**
   * Show diff between original and modified config, ask user to approve/edit/cancel
   * @param {string} originalContent - Original YAML content
   * @param {string} modifiedContent - Modified YAML content
   * @returns {string} Approved YAML content
   */
  async confirmOrEditConfig(originalContent, modifiedContent) {
    __.consoleInfo('CircleCI config changes:');

    const originalPath = hostGitPath('./tmp/config.original.yml');
    const modifiedPath = hostGitPath('./tmp/config.modified.yml');
    await __.write(originalContent, originalPath);
    await __.write(modifiedContent, modifiedPath);

    // firost's run() always throws on non-zero exit codes (no option to
    // suppress), and diff exits with 1 when files differ — try/catch required
    try {
      await __.run(`diff -u ${originalPath} ${modifiedPath}`);
    } catch {
      // Expected: files differ
    }

    let nextStep;
    try {
      nextStep = await __.select('What to do?', [
        { name: '✅ Approve', value: 'approve' },
        { name: '📝 Edit', value: 'edit' },
        { name: '⛔️ Cancel', value: 'cancel' },
      ]);
    } catch (err) {
      // Ctrl-C: clean up temp files before propagating
      await remove([originalPath, modifiedPath]);
      throw err;
    }

    if (nextStep === 'cancel') {
      await remove([originalPath, modifiedPath]);
      throw firostError(
        'ABERLAAS_RELEASE_CONFIG_CANCELLED',
        'Release cancelled by user',
      );
    }

    if (nextStep === 'approve') {
      await remove([originalPath, modifiedPath]);
      return modifiedContent;
    }

    // Edit: write modified to temp, open editor, re-read, loop
    await __.write(modifiedContent, modifiedPath);
    await __.run(`$EDITOR ${modifiedPath}`, { stdin: true, shell: true });
    const editedContent = await __.read(modifiedPath);
    return await __.confirmOrEditConfig(originalContent, editedContent);
  },

  /**
   * Commit the config changes
   */
  async commitConfig() {
    const repo = new Gilmore(hostGitRoot());
    await repo.commitAll('chore(ci): add trusted-publish workflow');
  },

  consoleInfo,
  read,
  run,
  select,
  write,
};
