import pMap from 'golgoth/lib/pMap';
import read from 'firost/lib/read';
import write from 'firost/lib/write';
import exists from 'firost/lib/exists';
import helper from '../helper';

export default {
  async run() {
    await this.updateConfigFiles();
    // Remove babel config?
    // Rewrite tests to load module through a helper
    // Rewrite files to load firost/golgoth files independently
  },
  /**
   * Update paths to config to use ./lib/ instead of ./build/
   **/
  async updateConfigFiles() {
    const configFiles = [
      'babel.config.js',
      '.eslintrc.js',
      '.huskyrc.js',
      '.lintstagedrc.js',
      'jest.config.js',
      '.prettierrc.js',
      '.stylelintrc.js',
    ];

    await pMap(configFiles, async filename => {
      const filepath = helper.hostPath(filename);
      if (!(await exists(filepath))) {
        return;
      }
      const content = await read(filepath);
      const newContent = content.replace(
        'aberlaas/build/configs/',
        'aberlaas/lib/configs/'
      );
      await write(newContent, filepath);
    });
  },
};
