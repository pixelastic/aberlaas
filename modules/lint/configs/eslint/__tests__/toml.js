import { ESLint } from 'eslint';
import configToml from '../toml.js';

/**
 * Lint TOML text and return rule IDs of all errors
 * @param {string} input - TOML content to lint
 * @returns {string[]} Array of rule IDs that triggered
 */
async function lintToml(input) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: configToml,
  });
  const results = await eslint.lintText(input, { filePath: 'test.toml' });
  return results[0].messages.map((message) => message.ruleId);
}

describe('toml eslint config', () => {
  it('should pass valid TOML without errors', async () => {
    const input = `[package]
name = "foo"
version = "1.0.0"
`;
    const actual = await lintToml(input);

    expect(actual).toEqual([]);
  });

  it.each([
    {
      title: 'bad key spacing',
      input: '[package]\nname="foo"\n',
      expected: 'toml/key-spacing',
    },
    {
      title: 'unnecessarily quoted keys',
      input: '["package"]\n"name" = "foo"\n',
      expected: 'toml/quoted-keys',
    },
    {
      title: 'bad indentation',
      input: '[package]\n    name = "foo"\n',
      expected: 'toml/indent',
    },
    {
      title: 'missing padding between tables',
      input: '[alpha]\nname = "a"\n[beta]\nname = "b"\n',
      expected: 'toml/padding-line-between-tables',
    },
  ])('should report $title', async ({ input, expected }) => {
    const actual = await lintToml(input);

    expect(actual).toContain(expected);
  });
});
