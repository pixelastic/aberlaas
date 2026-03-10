import { _ } from 'golgoth';
import pluginVue from 'eslint-plugin-vue';

const fullConfig = pluginVue.configs['flat/strongly-recommended'];
const rules = _.assign({}, ..._.map(fullConfig, 'rules'));
const languageOptions = _.chain(fullConfig)
  .find({ name: 'vue/base/setup-for-vue' })
  .get('languageOptions')
  .value();

export default [
  {
    name: 'aberlaas/vue',
    files: ['**/*.vue'],
    plugins: {
      vue: pluginVue,
    },
    languageOptions,
    processor: 'vue/vue',
    rules: {
      ...rules,
      'vue/attribute-hyphenation': ['error', 'never'],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': ['error'],
      'vue/no-undef-components': ['error'],

      // Rules that conflict with Pretttier
      'vue/html-indent': ['off'],
      'vue/html-closing-bracket-newline': ['off'],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always', // <img />, <input />
            normal: 'never', // <div></div>
            component: 'any', // <MyComponent /> or <MyComponent></MyComponent>
          },
        },
      ],
      'vue/max-attributes-per-line': ['off'],
      'vue/singleline-html-element-content-newline': ['off'],
    },
  },
];
