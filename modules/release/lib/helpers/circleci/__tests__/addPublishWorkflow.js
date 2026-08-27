import { firostError, read, remove, tmpDirectory, write } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import YAML from 'yaml';
import { __, addPublishWorkflow } from '../addPublishWorkflow.js';

describe('addPublishWorkflow', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);

  const minimalConfig = dedent`
    version: 2.1

    aliases:
      - &defaults
        docker: []
      - &restore_cache
        run: noop
      # Shared setup
      - &install_yarn
        run: noop
      - &install_dependencies
        run: noop
      - &save_cache
        run: noop

    jobs:
      ci:
        <<: *defaults
        steps:
          - checkout

    workflows:
      # Main workflow
      commit:
        jobs:
          - ci
  `;

  beforeEach(() => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('addPublishWorkflow', () => {
    const configPath = `${testDirectory}/.circleci/config.yml`;

    beforeEach(async () => {
      await write('original content', configPath);
      vi.spyOn(__, 'buildPublishConfig').mockReturnValue('modified content');
      vi.spyOn(__, 'confirmOrEditConfig').mockReturnValue('approved content');
      vi.spyOn(__, 'commitConfig').mockReturnValue();
    });

    it('should read config, transform, confirm, write, and commit', async () => {
      await addPublishWorkflow();

      expect(__.buildPublishConfig).toHaveBeenCalledWith('original content');
      expect(__.confirmOrEditConfig).toHaveBeenCalledWith(
        'original content',
        'modified content',
      );
      const actual = await read(configPath);
      expect(actual).toEqual('approved content');
      expect(__.commitConfig).toHaveBeenCalled();
    });
  });

  describe('buildPublishConfig', () => {
    it('should add parameters block to config', () => {
      const actual = __.buildPublishConfig(minimalConfig);
      const parsed = YAML.parse(actual);

      expect(parsed).toHaveProperty('parameters.trusted_publish', {
        type: 'boolean',
        default: false,
      });
      expect(parsed).toHaveProperty('parameters.packages', {
        type: 'string',
        default: '',
      });
    });

    it('should add trusted-publish job with correct steps', () => {
      const actual = __.buildPublishConfig(minimalConfig);
      const parsed = YAML.parse(actual, { merge: true });
      const job = parsed.jobs['trusted-publish'];

      expect(job).toHaveProperty('steps.0', 'checkout');

      const lastStep = job.steps[job.steps.length - 1];
      expect(lastStep).toHaveProperty(
        'run',
        'yarn run ci --trusted-publish "<< pipeline.parameters.packages >>"',
      );
    });

    it('should add trusted-publish workflow with when condition', () => {
      const actual = __.buildPublishConfig(minimalConfig);
      const parsed = YAML.parse(actual);
      const workflow = parsed.workflows['trusted-publish'];

      expect(workflow).toHaveProperty(
        'when',
        '<< pipeline.parameters.trusted_publish >>',
      );
      expect(workflow).toHaveProperty('jobs', ['trusted-publish']);
    });

    it('should add when-not condition to commit workflow', () => {
      const actual = __.buildPublishConfig(minimalConfig);
      const parsed = YAML.parse(actual);

      expect(parsed).toHaveProperty(
        'workflows.commit.when',
        'not << pipeline.parameters.trusted_publish >>',
      );
    });

    it('should preserve existing YAML comments and anchors', () => {
      const actual = __.buildPublishConfig(minimalConfig);

      expect(actual).toContain('# Shared setup');
      expect(actual).toContain('# Main workflow');
      expect(actual).toContain('&defaults');
      expect(actual).toContain('*defaults');
    });
  });

  describe('confirmOrEditConfig', () => {
    beforeEach(() => {
      vi.spyOn(__, 'showColoredDiff').mockReturnValue();
      vi.spyOn(__, 'write').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();
    });

    it('should show diff between original and modified', async () => {
      vi.spyOn(__, 'select').mockReturnValue('approve');

      await __.confirmOrEditConfig('original', 'modified');

      expect(__.showColoredDiff).toHaveBeenCalledWith('original', 'modified');
    });

    it('should return modified content when user approves', async () => {
      vi.spyOn(__, 'select').mockReturnValue('approve');

      const actual = await __.confirmOrEditConfig('original', 'modified');

      expect(actual).toEqual('modified');
    });

    it('should handle the edit action', async () => {
      // Use real write for this test (edit branch needs files on disk)
      __.write.mockImplementation(write);

      vi.spyOn(__, 'select')
        .mockReturnValueOnce('edit')
        .mockReturnValueOnce('approve');

      const modifiedPath = `${testDirectory}/tmp/config.modified.yml`;

      // Simulate $EDITOR: read the temp file, write new content
      let fileContentBefore = null;
      vi.spyOn(__, 'run').mockImplementation(async (cmd) => {
        if (cmd.includes('$EDITOR')) {
          fileContentBefore = await read(modifiedPath);
          await write('edited content', modifiedPath);
        }
      });

      const actual = await __.confirmOrEditConfig('original', 'modified');

      expect(actual).toEqual('edited content');
      expect(fileContentBefore).toEqual('modified');
      expect(__.run).toHaveBeenCalledWith(expect.stringContaining('$EDITOR'), {
        stdin: true,
        shell: true,
      });
    });

    it('should throw error when user cancels', async () => {
      vi.spyOn(__, 'select').mockReturnValue('cancel');

      let actual = null;
      try {
        await __.confirmOrEditConfig('original', 'modified');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_CONFIG_CANCELLED',
      );
    });

    it('should throw error on Ctrl-C', async () => {
      vi.spyOn(__, 'select').mockImplementation(() => {
        throw firostError('FIROST_SELECT_CTRL_C', 'Ctrl-C');
      });

      let actual = null;
      try {
        await __.confirmOrEditConfig('original', 'modified');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'FIROST_SELECT_CTRL_C');
    });
  });

  describe('commitConfig', () => {
    it('should commit all changes with the correct message', async () => {
      const mockRepo = { commitAll: vi.fn() };
      vi.spyOn(__, 'createRepo').mockReturnValue(mockRepo);

      await __.commitConfig();

      expect(mockRepo.commitAll).toHaveBeenCalledWith(
        'chore(ci): add trusted-publish workflow',
      );
    });
  });

  describe('showColoredDiff', () => {
    beforeEach(() => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'consoleLog').mockReturnValue();
    });

    it('should color added lines in green and removed lines in red', () => {
      __.showColoredDiff('line one\nline two\n', 'line one\nline THREE\n');

      const allOutput = __.consoleLog.mock.calls.map((c) => c[0]).join('\n');
      // Added lines should use green
      expect(allOutput).toContain('\u001b[32m');
      // Removed lines should use red
      expect(allOutput).toContain('\u001b[31m');
    });

    it('should dim context lines', () => {
      __.showColoredDiff('context\nold line\n', 'context\nnew line\n');

      const allOutput = __.consoleLog.mock.calls.map((c) => c[0]).join('\n');
      // Context lines should use dim
      expect(allOutput).toContain('\u001b[2m');
    });

    it('should show separator lines around the diff', () => {
      __.showColoredDiff('a\n', 'b\n');

      const calls = __.consoleLog.mock.calls.map((c) => c[0]);
      const separator = '━'.repeat(60);
      expect(calls).toHaveProperty('0', separator);
      expect(calls[calls.length - 1]).toEqual(separator);
    });

    it('should show header via consoleInfo', () => {
      __.showColoredDiff('a\n', 'b\n');

      expect(__.consoleInfo).toHaveBeenCalledWith('CircleCI config changes:');
    });

    it('should do nothing when strings are identical', () => {
      __.showColoredDiff('same\n', 'same\n');

      expect(__.consoleInfo).not.toHaveBeenCalled();
      expect(__.consoleLog).not.toHaveBeenCalled();
    });
  });
});
