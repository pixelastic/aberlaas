import { absolute } from 'firost';

export const scriptsTestHelperContent = `
import helper from '${absolute('../main.js')}';

console.log(
  JSON.stringify(
    {
      hostWorkingDirectory: helper.hostWorkingDirectory(),
      hostPackageRoot: helper.hostPackageRoot(),
      hostGitRoot: helper.hostGitRoot(),
    },
    null,
    2,
  ),
);`;

export const yarnRcYmlContent = `
nodeLinker: node-modules
`;

export const modulePackageJson = {
  scripts: {
    'test-helper': 'node ../scripts/test-helper.js',
  },
};
