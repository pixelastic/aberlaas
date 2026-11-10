import { _ } from 'golgoth';
import {
  absolute,
  emptyDirectory,
  gitRoot,
  newFile,
  read,
  write,
  writeJson,
} from 'firost';
import { __ as helper, hostGitPath, hostPackagePath } from 'aberlaas-helper';
import { __, fix, run } from '../js.js';

describe('lint/js', () => {
  // IMPORTANT: This test MUST use a directory inside the repository (not /tmp system)
  // because ESLint refuses to lint files outside of its base directory.
  // This is an ESLint technical constraint, not a choice.
  const testDirectory = absolute(gitRoot(), '/tmp/lint/js');
  beforeEach(async () => {
    await emptyDirectory(testDirectory);

    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
    vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(`${testDirectory}/lib`);
    vi.spyOn(helper, 'hostWorkingDirectory').mockReturnValue(
      `${testDirectory}/lib/src`,
    );
  });
  describe('getInputFiles', () => {
    it.each([
      // Default find
      { filepath: 'script.js', expected: true, userPatterns: null },
      { filepath: 'eslint.config.js', expected: true, userPatterns: null },
      {
        filepath: '__meta_tests__/subfolder/test.js',
        expected: true,
        userPatterns: null,
      },
      { filepath: 'src/script.js', expected: true, userPatterns: null },
      {
        filepath: 'src/theme/component.js',
        expected: true,
        userPatterns: null,
      },
      { filepath: 'src/App.jsx', expected: true, userPatterns: null },
      { filepath: 'src/App.vue', expected: true, userPatterns: null },
      // Default exclude
      { filepath: 'src/index.json', expected: false, userPatterns: null },
      { filepath: 'dist/script.js', expected: false, userPatterns: null },
      // Focused folder
      {
        filepath: 'script.js',
        expected: false,
        userPatterns: './src/**/*',
      },
      {
        filepath: 'lib/src/script.js',
        expected: false,
        userPatterns: './src/**/*',
      },
    ])('$filepath', async ({ filepath, expected, userPatterns }) => {
      const absolutePath = hostGitPath(filepath);
      await newFile(absolutePath);

      const actual = await __.getInputFiles(userPatterns);
      const hasFile = _.includes(actual, absolutePath);
      expect(hasFile).toEqual(expected);
    });
  });
  describe.slow('run', () => {
    it('should throw if a file errors', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        hostPackagePath('good.js'),
      );
      await write('  const foo = "bar"', hostPackagePath('bad.js'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_JS');
      expect(actual).toHaveProperty('message');
    });
    it('should test all .js files and return true if all passes', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        hostPackagePath('foo.js'),
      );

      const actual = await run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await run();
      expect(actual).toBe(true);
    });
    it('should throw all error messages of all failed files', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        hostPackagePath('good.js'),
      );
      await write('  const foo = "bar"', hostPackagePath('foo.js'));
      await write('  const foo = "bar"', hostPackagePath('deep/bar.js'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('foo.js'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bar.js'),
      );
    });
    it('should lint files defined in .bin key in package.json', async () => {
      const packageFilepath = hostPackagePath('package.json');
      const binFilepath = hostPackagePath('./bin/foo.js');

      await writeJson(
        {
          bin: {
            foo: './bin/foo.js',
          },
        },
        packageFilepath,
      );
      await write('#!/usr/bin/env node\nconst foo = "bar"', binFilepath);

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_JS');
      expect(actual).toHaveProperty('message');
    });
    it.each([
      {
        title: 'vitest',
        input: "import { it } from 'vitest';\n\nit('works', () => {});\n",
        expected: 'vitest/no-importing-vitest-globals',
      },
      {
        title: 'custom vitest',
        input:
          "it('works', () => {\n  const mock = vi.fn();\n  mock.mockResolvedValue(1);\n  expect(mock).toHaveBeenCalled();\n});\n",
        expected: 'aberlaas-test/prefer-mock-return-value',
      },
    ])(
      'should report $title rule violations in test files',
      async ({ input, expected }) => {
        await write(input, hostPackagePath('__tests__/foo.js'));

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_JS');
        expect(actual).toHaveProperty(
          'message',
          expect.stringContaining(expected),
        );
      },
    );
    it('should pass on a valid test file', async () => {
      await write(
        "it('works', () => {\n  expect(true).toBe(true);\n});\n",
        hostPackagePath('__tests__/foo.js'),
      );

      const actual = await run();

      expect(actual).toBe(true);
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('  const foo = "bar"; alert(foo)', hostPackagePath('foo.js'));

      await fix();

      const actual = await read(hostPackagePath('foo.js'));

      expect(actual).toBe("const foo = 'bar';\nalert(foo);");
    });
    it('stop early if no file found', async () => {
      const actual = await fix();

      expect(actual).toBe(true);
    });
  });
  describe('vue', () => {
    describe('run', () => {
      it('should pass with valid Vue component', async () => {
        await write(
          `<script setup>
const message = 'Hello Vue';
</script>

<template>
  <div>{{ message }}</div>
</template>
`,
          hostPackagePath('App.vue'),
        );

        const actual = await run();

        expect(actual).toBe(true);
      });
      it('should fail with invalid Vue component', async () => {
        await write(
          `<script setup>
const message = 'Hello Vue';
</script>

<template>
  <div>{{ missingVariable }}</div>
</template>
`,
          hostPackagePath('App.vue'),
        );

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_JS');
      });
    });
    describe('fix', () => {
      it('should fix Vue component', async () => {
        await write(
          `<script setup>
const message = "bad quotes";
</script>

<template> <div>{{ message }}</div> </template>
`,
          hostPackagePath('App.vue'),
        );

        await fix();

        const actual = await read(hostPackagePath('App.vue'));
        expect(actual).toEqual(`<script setup>
const message = 'bad quotes';
</script>

<template>
  <div>{{ message }}</div>
</template>`);
      });
    });
  });
  describe.slow('react', () => {
    const buttonSource = 'export const Button = () => <button />;\n';
    it('should not report a component only used in JSX', async () => {
      await write(buttonSource, hostPackagePath('Button.jsx'));
      await write(
        "import { Button } from './Button.jsx';\n\nexport const App = () => <Button />;\n",
        hostPackagePath('App.jsx'),
      );

      const actual = await run();

      expect(actual).toBe(true);
    });
    it.each([
      {
        title: 'unused imported component',
        input:
          "import { Button } from './Button.jsx';\n\nexport const App = () => <div />;\n",
        expected: 'no-unused-vars',
      },
      {
        title: 'undefined component',
        input: 'export const App = () => <Button />;\n',
        expected: 'no-undef',
      },
      {
        title: 'relative import without extension',
        input:
          "import { Button } from './Button';\n\nexport const App = () => <Button />;\n",
        expected: 'import-x/extensions',
      },
    ])('should report $title', async ({ input, expected }) => {
      await write(buttonSource, hostPackagePath('Button.jsx'));
      await write(input, hostPackagePath('App.jsx'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_JS');
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining(expected),
      );
    });
  });
});
