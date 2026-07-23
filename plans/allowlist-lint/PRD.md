## Problem Statement

The codebase has no automated guardrail against exclusionary terminology (`whitelist`/`blacklist`). Developers may introduce these terms in identifiers, comments, or strings without realizing inclusive alternatives exist (`allowlist`/`blocklist`).

## Solution

Add a custom ESLint rule `aberlaas/no-exclusionary-terms` that detects `whitelist` and `blacklist` (case-insensitive, including compound forms like `whitelisted`, `blacklisting`) and suggests `allowlist`/`blocklist` replacements. The rule auto-fixes identifiers and comments; strings and template literals are reported but require manual intervention to avoid breaking runtime values.

## User Stories

1. As a developer, I want ESLint to flag `whitelist` in my variable names, so that I use `allowlist` instead.
2. As a developer, I want ESLint to flag `blacklist` in my variable names, so that I use `blocklist` instead.
3. As a developer, I want compound forms like `whitelisted` and `blacklisting` caught, so that no variant slips through.
4. As a developer, I want case-insensitive matching (`WhiteList`, `BLACKLIST`, `Whitelist`), so that all naming conventions are covered.
5. As a developer, I want identifiers auto-fixed with `--fix`, so that I don't have to rename them manually.
6. As a developer, I want comments auto-fixed with `--fix`, so that documentation stays consistent.
7. As a developer, I want strings flagged but NOT auto-fixed, so that runtime values like API routes aren't silently broken.
8. As a developer, I want template literals flagged but NOT auto-fixed, so that interpolated strings aren't silently broken.
9. As a developer, I want the replacement to preserve my case convention (`whitelist`→`allowlist`, `Whitelist`→`Allowlist`, `WHITELIST`→`ALLOWLIST`), so that the fix respects my naming style.
10. As a developer, I want the rule activated at `error` severity, so that CI catches violations before merge.

## Implementation Decisions

- **Rule name:** `no-exclusionary-terms`
- **Terms are hardcoded**, not configurable via ESLint schema options. Consistent with all other aberlaas custom rules which use `schema: []`.
- **Matching:** Case-insensitive substring match. No word-boundary logic needed — `whitelist`/`blacklist` have no English false positives.
- **Case-preserving replacement** uses 3 variants: lowercase (`whitelist`→`allowlist`), title-case (`Whitelist`→`Allowlist`), all-caps (`WHITELIST`→`ALLOWLIST`). Detected by inspecting the first two characters of the matched substring.
- **AST visitors:**
  - `Identifier` — fixable via `fixer.replaceText`
  - `Program` — iterates `context.sourceCode.getAllComments()`, fixable via `fixer.replaceTextRange`
  - `Literal` (string nodes) — report-only, no fix
  - `TemplateLiteral` — report-only on `TemplateElement` quasis, no fix
- **Meta:** `type: 'suggestion'`, `fixable: 'code'`, single `messageId`.
- **Registration:** Import in `js.js`, add to `aberlaas` plugin `rules` object, enable as `['error']`.

## Testing Decisions

- Tests use `RuleTester` wired to vitest, following the `no-abbreviated-names` test file pattern.
- Only Module 1 (the rule) is tested. Registration (Module 2) is trivial wiring tested implicitly.
- Good tests exercise external behavior: given input code, assert expected errors and output. No AST internals tested.
- **Valid cases** (no error): words that contain `list` but not `whitelist`/`blacklist`, standalone `white` or `black`.
- **Invalid cases** (error + fix): `whitelist`, `Whitelist`, `WHITELIST`, `whitelisted`, `addToBlacklist`, `blacklisting` — in identifiers, comments, strings, and template literals. Verify fix output for identifiers and comments; verify no fix for strings/templates.

## Out of Scope

- Configurable term lists via ESLint rule options.
- Auto-fixing strings or template literals (risk of breaking runtime values).
- Per-character case mirroring (exotic forms like `WhItElIsT`).
- Scanning non-JS files (markdown, YAML, etc.) — that's a separate tool's job.

## Further Notes

The existing `no-abbreviated-names` rule is the closest prior art and should be used as the structural reference for file layout, test patterns, and registration.
