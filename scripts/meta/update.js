/**
 * Update a specific dependency to the latest version, for all modules that uses
 * it
 **/
import path from 'path';
import { _, pMap } from 'golgoth';
import { gitRoot, glob, readJson, run } from 'firost';

const dependenciesToUpdate = process.argv.slice(2);
// const modules = await glob(['./package.json', './modules/*/package.json']);
const root = await gitRoot();
const modules = await glob(`${root}/modules/*/package.json`);
const concurrency = 3;

await pMap(
  modules,
  async (module) => {
    const thisModulePackageJson = await readJson(module);
    const thisModuleDependencies = _.keys(thisModulePackageJson.dependencies);

    await pMap(
      dependenciesToUpdate,
      async (dependencyToUpdate) => {
        const thisModuleName = thisModulePackageJson.name;
        const thisModulePath = path.dirname(module);

        if (_.includes(thisModuleDependencies, dependencyToUpdate)) {
          console.info(`Upgrading ${dependencyToUpdate} in ${thisModuleName}`);
          await run(`yarn up --exact ${dependencyToUpdate}`, {
            cwd: thisModulePath,
            stdout: false,
          });
        }
      },
      { concurrency },
    );
  },
  { concurrency },
);
