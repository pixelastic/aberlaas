import pluginJson from '@eslint/json';
import packageJson from 'eslint-plugin-package-json';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  {
    name: 'aberlaas/json',
    files: ['**/*.json'],
    ignores: ['**/package.json'],
    plugins: {
      json: pluginJson,
    },
    language: 'json/json',
    rules: {
      'json/no-duplicate-keys': ['error'],
      'json/no-empty-keys': ['error'],
      'json/no-unnormalized-keys': ['error'],
      'json/no-unsafe-values': ['error'],
      'json/top-level-interop': ['error'],
      'json/sort-keys': ['off'],
    },
  },
  {
    name: 'aberlaas/packageJson',
    files: ['**/package.json'],
    plugins: {
      'package-json': packageJson,
    },
    languageOptions: {
      parser: jsoncParser,
    },
    rules: {
      'package-json/bin-name-casing': ['error'],
      'package-json/exports-subpaths-style': ['error'],
      'package-json/no-empty-fields': ['error'],
      'package-json/no-redundant-files': ['error'],
      'package-json/no-redundant-publishConfig': ['error'],
      'package-json/order-properties': [
        'error',
        {
          // See: https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/order-properties.md
          order: [
            // Name
            'name',
            'version',
            // Dev info
            'private',
            'type',
            'workspaces',
            // Metadata
            'description',
            'author',
            'homepage',
            'keywords',
            'repository',
            // Compatibility
            'sideEffects',
            'license',
            'engines',
            'packageManager',
            // Exports
            'files',
            'exports',
            'main',
            // Dependencies
            'devDependencies',
            'dependencies',
            'peerDependencies',
            // Scripts
            'scripts',
          ],
        },
      ],
      'package-json/repository-shorthand': ['error'],
      'package-json/require-description': ['error'],
      'package-json/require-license': ['error'],
      'package-json/require-name': ['error'],
      'package-json/require-type': ['error'],
      'package-json/require-version': ['error'],
      'package-json/scripts-name-casing': ['error'],
      'package-json/sort-collections': ['error'],
      'package-json/specify-peers-locally': ['error'],
      'package-json/unique-dependencies': ['error'],
      'package-json/valid-author': ['error'],
      'package-json/valid-bin': ['error'],
      'package-json/valid-bundleDependencies': ['error'],
      'package-json/valid-config': ['error'],
      'package-json/valid-contributors': ['error'],
      'package-json/valid-cpu': ['error'],
      'package-json/valid-dependencies': ['error'],
      'package-json/valid-description': ['error'],
      'package-json/valid-devDependencies': ['error'],
      'package-json/valid-directories': ['error'],
      'package-json/valid-engines': ['error'],
      'package-json/valid-exports': ['error'],
      'package-json/valid-files': ['error'],
      'package-json/valid-homepage': ['error'],
      'package-json/valid-keywords': ['error'],
      'package-json/valid-license': ['error'],
      'package-json/valid-main': ['error'],
      'package-json/valid-man': ['error'],
      'package-json/valid-module': ['error'],
      'package-json/valid-name': ['error'],
      'package-json/valid-optionalDependencies': ['error'],
      'package-json/valid-os': ['error'],
      'package-json/valid-peerDependencies': ['error'],
      'package-json/valid-private': ['error'],
    },
  },
  {
    name: 'aberlaas/packageJsonPublishable',
    files: [
      '**/lib/package.json',
      '**/modules/*/package.json',
      '!**/docs/package.json',
    ],
    plugins: {
      'package-json': packageJson,
    },
    languageOptions: {
      parser: jsoncParser,
    },
    rules: {
      'package-json/require-attribution': ['error'],
      'package-json/require-exports': ['error'],
      'package-json/require-files': ['error'],
      'package-json/require-repository': ['error'],
      'package-json/require-sideEffects': ['error'],
    },
  },
];
