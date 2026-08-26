## Commands

- **Testing:** Run `yarn run test <filepath>`
- **Linting:** Run `yarn run lint:fix <filepath>`

## Project structure

- Yarn workspaces monorepo, modules in `modules/*`

## Testing conventions

- Use `mockHelperPaths(testDirectory)` from `aberlaas-helper` to mock all path helpers at once — never mock `hostGitRoot`/`hostGitPath`/`hostPackageRoot` individually
- See `modules/helper/lib/test-helper.js` for available test helpers
