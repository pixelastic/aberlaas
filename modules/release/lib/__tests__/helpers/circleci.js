import { read, remove, tmpDirectory, write } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import YAML from 'yaml';
import {
  __,
  addPublishWorkflow,
  hasPublishWorkflow,
} from '../../helpers/circleci.js';

describe('release/helpers/circleci', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  const configPath = `${testDirectory}/.circleci/config.yml`;

  beforeEach(() => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  // Minimal config WITHOUT publish workflow (existing project)
  const minimalConfig = [
    'version: 2.1',
    '',
    'aliases:',
    '  - &defaults',
    '    docker:',
    '      - image: cimg/node:22.14',
    '  - &restore_cache',
    '    restore_cache:',
    '      key: yarn-cache-{{ checksum "yarn.lock" }}',
    '  # Setup steps',
    '  - &install_yarn',
    '    run:',
    "      name: 'Installing correct yarn version'",
    '      command: |',
    '        corepack enable --install-directory="/home/circleci/bin"',
    '        yarn set version 4.7.0',
    '  - &install_dependencies',
    '    run:',
    "      name: 'Installing dependencies'",
    "      command: 'yarn install'",
    '  - &save_cache',
    '    save_cache:',
    '      key: yarn-cache-{{ checksum "yarn.lock" }}',
    '      paths:',
    '        - ~/.cache/yarn',
    '',
    'jobs:',
    '  ci:',
    '    <<: *defaults',
    '    steps:',
    '      - checkout',
    '      - *restore_cache',
    '      - *install_yarn',
    '      - *install_dependencies',
    '      - *save_cache',
    "      - run: 'yarn run ci'",
    '',
    'workflows:',
    '  version: 2',
    '  # On every commit',
    '  commit:',
    '    jobs:',
    '      - ci',
  ].join('\n');

  // Config WITH publish workflow already present
  const fullConfig = [
    'version: 2.1',
    '',
    'parameters:',
    '  trusted_publish:',
    '    type: boolean',
    '    default: false',
    '  packages:',
    '    type: string',
    "    default: ''",
    '',
    'aliases:',
    '  - &defaults',
    '    docker:',
    '      - image: cimg/node:22.14',
    '',
    'jobs:',
    '  ci:',
    '    <<: *defaults',
    '    steps:',
    '      - checkout',
    "      - run: 'yarn run ci'",
    '  trusted-publish:',
    '    <<: *defaults',
    '    steps:',
    '      - checkout',
    '      - run: \'yarn run ci --trusted-publish "<< pipeline.parameters.packages >>"\'',
    '',
    'workflows:',
    '  version: 2',
    '  commit:',
    '    when: not << pipeline.parameters.trusted_publish >>',
    '    jobs:',
    '      - ci',
    '  trusted-publish:',
    '    when: << pipeline.parameters.trusted_publish >>',
    '    jobs:',
    '      - trusted-publish',
  ].join('\n');

  describe('hasPublishWorkflow', () => {
    it.each([
      {
        title: 'should return true when trusted-publish workflow exists',
        input: fullConfig,
        expected: true,
      },
      {
        title: 'should return false when only commit workflow exists',
        input: minimalConfig,
        expected: false,
      },
    ])('$title', async ({ input, expected }) => {
      await write(input, configPath);

      const actual = await hasPublishWorkflow();

      expect(actual).toEqual(expected);
    });
  });

  describe('addPublishWorkflow', () => {
    let modifiedContent;

    beforeEach(async () => {
      await write(minimalConfig, configPath);
      vi.spyOn(__, 'confirmOrEditConfig').mockImplementation(
        (_original, modified) => modified,
      );
      vi.spyOn(__, 'commitConfig').mockReturnValue();

      await addPublishWorkflow();

      modifiedContent = __.confirmOrEditConfig.mock.calls[0][1];
    });

    it('should add parameters block to config', () => {
      const parsed = YAML.parse(modifiedContent);

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
      const parsed = YAML.parse(modifiedContent, { merge: true });
      const job = parsed.jobs['trusted-publish'];

      expect(job).toBeTruthy();
      expect(job).toHaveProperty('steps.0', 'checkout');

      const lastStep = job.steps[job.steps.length - 1];
      expect(lastStep.run).toContain('--trusted-publish');
      expect(lastStep.run).toContain('<< pipeline.parameters.packages >>');
    });

    it('should add trusted-publish workflow with when condition', () => {
      const parsed = YAML.parse(modifiedContent);
      const workflow = parsed.workflows['trusted-publish'];

      expect(workflow).toBeTruthy();
      expect(workflow).toHaveProperty(
        'when',
        '<< pipeline.parameters.trusted_publish >>',
      );
      expect(workflow.jobs).toContain('trusted-publish');
    });

    it('should add when-not condition to commit workflow', () => {
      const parsed = YAML.parse(modifiedContent);

      expect(parsed).toHaveProperty(
        'workflows.commit.when',
        'not << pipeline.parameters.trusted_publish >>',
      );
    });

    it('should preserve existing YAML comments and anchors', () => {
      expect(modifiedContent).toContain('# Setup steps');
      expect(modifiedContent).toContain('# On every commit');
      expect(modifiedContent).toContain('&defaults');
      expect(modifiedContent).toContain('*defaults');
    });

    it('should commit on approval', () => {
      expect(__.commitConfig).toHaveBeenCalled();
    });
  });

  describe('confirmOrEditConfig', () => {
    beforeEach(() => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();
    });

    it('should return modified content when user approves', async () => {
      vi.spyOn(__, 'select').mockReturnValue('approve');

      const actual = await __.confirmOrEditConfig('original', 'modified');

      expect(actual).toEqual('modified');
    });

    it('should handle the edit action', async () => {
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
  });
});
