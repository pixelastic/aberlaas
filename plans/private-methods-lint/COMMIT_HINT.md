## Goal

Lint the 3 recurring mistakes in `__ = { ... }` private methods: verbose wrappers, wrong ordering, and renamed keys.

## Done

- Wrote PRD covering 3 custom ESLint rules (`private-methods-no-wrapper`, `private-methods-ordering`, `private-methods-no-rename`) plus a codebase re-lint pass.

## Key files
- `plans/private-methods-lint/PRD.md` — full PRD with problem, solution, user stories, implementation and testing decisions

## Suggested type(scope)
`plan(private-methods-lint)`
