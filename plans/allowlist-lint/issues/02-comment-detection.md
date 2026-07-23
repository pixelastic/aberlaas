## TLDR

Add comment scanning to the `no-exclusionary-terms` rule with auto-fix.

## What to build

Extend the rule's `create` function to add a `Program` visitor that iterates over `context.sourceCode.getAllComments()`. For each comment containing `whitelist` or `blacklist` (case-insensitive), report an error and auto-fix by replacing the matched substring within the comment's range using `fixer.replaceTextRange`.

The same case-preserving replacement logic from issue 01 applies.

## Behavioral Tests

**Invalid — line comments:**
- Flags `// whitelist this` and fixes to `// allowlist this`
- Flags `// add to BLACKLIST` and fixes to `// add to BLOCKLIST`

**Invalid — block comments:**
- Flags `/* blacklisted */` and fixes to `/* blocklisted */`
- Flags `/* Whitelisted users */` and fixes to `/* Allowlisted users */`

## Acceptance criteria

- [ ] `Program` visitor scans all comments
- [ ] Detects `whitelist`/`blacklist` case-insensitively in comments
- [ ] Auto-fixes comments with case-preserving replacement
- [ ] Works for both line (`//`) and block (`/* */`) comments
- [ ] All behavioral tests pass
