import { remove, tmpDirectory, write } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import { hasPublishWorkflow } from '../hasPublishWorkflow.js';

describe('hasPublishWorkflow', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  const configPath = `${testDirectory}/.circleci/config.yml`;

  beforeEach(() => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  const minimalConfig = dedent`
    version: 2.1

    workflows:
      commit:
        jobs:
          - ci
  `;

  const fullConfig = dedent`
    version: 2.1

    workflows:
      commit:
        jobs:
          - ci
      trusted-publish:
        when: << pipeline.parameters.trusted_publish >>
        jobs:
          - trusted-publish
  `;

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
