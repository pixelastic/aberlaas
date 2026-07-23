import { RuleTester } from 'eslint';
import rule from '../no-abbreviated-names.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/no-abbreviated-names', rule, {
  valid: [
    // Suffix Dir — false positives
    {
      name: 'Does not flag "directory" (no camelCase boundary)',
      code: 'const directory = "/tmp";',
    },
    {
      name: 'Does not flag "dirt" (no camelCase boundary)',
      code: 'const dirt = true;',
    },
    {
      name: 'Does not flag "Dir" alone (no lowercase letter before)',
      code: 'const Dir = "/tmp";',
    },
    {
      name: 'Does not flag SCREAMING_SNAKE_CASE "LAPTOP_DIR"',
      code: 'const LAPTOP_DIR = "/tmp";',
    },

    // Prefix abs — false positives
    {
      name: 'Does not flag "absorb" (no uppercase after)',
      code: 'const absorb = true;',
    },
    {
      name: 'Does not flag "abstract" (no uppercase after)',
      code: 'const abstract = true;',
    },
    {
      name: 'Does not flag "abs" alone (no uppercase after)',
      code: 'const abs = 42;',
    },
  ],
  invalid: [
    // Suffix Dir → Directory
    {
      name: 'Flags "laptopDir" and fixes to "laptopDirectory"',
      code: 'const laptopDir = "/tmp";',
      output: 'const laptopDirectory = "/tmp";',
      errors: [{ messageId: 'noAbbreviatedName' }],
    },
    {
      name: 'Flags "consoleDir" and fixes to "consoleDirectory"',
      code: 'const consoleDir = "/tmp";',
      output: 'const consoleDirectory = "/tmp";',
      errors: [{ messageId: 'noAbbreviatedName' }],
    },
    {
      name: 'Flags "laptopDirPath" mid-word and fixes to "laptopDirectoryPath"',
      code: 'const laptopDirPath = "/tmp";',
      output: 'const laptopDirectoryPath = "/tmp";',
      errors: [{ messageId: 'noAbbreviatedName' }],
    },

    // Prefix abs → absolute
    {
      name: 'Flags "absPath" and fixes to "absolutePath"',
      code: 'const absPath = "/tmp";',
      output: 'const absolutePath = "/tmp";',
      errors: [{ messageId: 'noAbbreviatedName' }],
    },

    // Identifier types
    {
      name: 'Flags function parameter names',
      code: 'function foo(laptopDir) {}',
      output: 'function foo(laptopDirectory) {}',
      errors: [{ messageId: 'noAbbreviatedName' }],
    },
    {
      name: 'Flags object property keys',
      code: 'const obj = { laptopDir: "/tmp" };',
      output: 'const obj = { laptopDirectory: "/tmp" };',
      errors: [{ messageId: 'noAbbreviatedName' }],
    },
    {
      name: 'Flags destructured names',
      code: 'const { laptopDir } = obj;',
      output: 'const { laptopDirectory } = obj;',
      errors: [
        { messageId: 'noAbbreviatedName' },
        { messageId: 'noAbbreviatedName' },
      ],
    },
  ],
});
