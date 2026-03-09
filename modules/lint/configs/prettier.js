import { fileURLToPath } from 'node:url';

// We use the full absolute path to the plugin so it can be used even from
// outside of aberlaas, for example when calling Prettier directly.
const tailwindcssPlugin = fileURLToPath(
  import.meta.resolve('prettier-plugin-tailwindcss'),
);

export default {
  bracketSameLine: true,
  plugins: [tailwindcssPlugin],
  printWidth: 80,
  singleQuote: true,
};
