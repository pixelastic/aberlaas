import { _ } from 'golgoth';
import pluginMarkdown from '@eslint/markdown';
import { ESLint } from 'eslint';
import configIndex from '../index.js';
import configMarkdown from '../markdown.js';

/**
 * Lint Markdown text and return rule IDs of all errors
 * @param {string} input - Markdown content to lint
 * @returns {string[]} Array of rule IDs that triggered
 */
async function lintMarkdown(input) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: configMarkdown,
  });
  const results = await eslint.lintText(input, { filePath: 'test.md' });
  return results[0].messages.map((message) => message.ruleId);
}

describe('markdown eslint config', () => {
  it('should be included in the main config', () => {
    const markdownNames = configMarkdown.map((config) => config.name);

    const actual = configIndex.filter((config) =>
      markdownNames.includes(config.name),
    );

    expect(actual).toEqual(configMarkdown);
  });

  it('should list every plugin rule, alphabetically, as error or off', () => {
    const pluginRules = _.chain(pluginMarkdown.rules).keys().sort().value();
    const rules = configMarkdown.find(
      (config) => config.name === 'aberlaas/markdown',
    ).rules;

    const actual = _.keys(rules);

    expect(actual).toEqual(pluginRules.map((name) => `markdown/${name}`));
    _.each(rules, (value) => {
      expect(['error', 'off']).toContain(value[0]);
    });
  });

  it.each([
    {
      title: 'valid Markdown',
      input: '# Title\n\nSome text.\n',
      expected: [],
    },
    {
      title: 'YAML front matter',
      input: '---\ntitle: Hello\n---\n\nSome text.\n',
      expected: [],
    },
    {
      title: 'heading-increment',
      input: '# Title\n\n### Skipped\n',
      expected: ['markdown/heading-increment'],
    },
    {
      title: 'fenced-code-language',
      input: '# Title\n\n```\ncode\n```\n',
      expected: ['markdown/fenced-code-language'],
    },
  ])('should lint $title', async ({ input, expected }) => {
    const actual = await lintMarkdown(input);

    expect(actual).toEqual(expected);
  });
});
