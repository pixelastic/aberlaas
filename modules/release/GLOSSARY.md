# Release

The release module handles publishing packages to the npm registry. It supports two publishing modes: local with OTP authentication, or automated via CI with OIDC.

## Language

**Release**:
The complete process of shipping a new version: tests, lint, version bump, changelog, git tag, and **Publish**.
_Avoid_: Deploy, ship

**Publish**:
The specific step of pushing packages to the npm registry.
_Avoid_: Release (when referring only to the npm upload step)

**Direct Publish**:
A **Publish** mode where the user publishes from their local machine, authenticated with an **OTP**.
_Avoid_: Manual publish, local publish, OTP publish

**Trusted Publish**:
A **Publish** mode where the CI publishes via OIDC, with no secret and no **OTP**.
_Avoid_: CI publish, OIDC publish, automated publish

**First Publish**:
The first **Publish** of a package on npm, which requires a **Direct Publish** because **Trusted Publish** can only be configured for packages that already exist on the registry.
_Avoid_: Initial publish, bootstrap publish

**OTP**:
A One-Time Password from an authenticator app, required by npm for a **Direct Publish**.
_Avoid_: 2FA code, TOTP, one-time password

## Relationships

- A **Release** contains exactly one **Publish** step
- A **First Publish** is always a **Direct Publish**
- A **Direct Publish** requires exactly one **OTP** (re-prompted if expired)
- A **Trusted Publish** requires zero **OTP**

## Flagged ambiguities

- "release" was used interchangeably with "publish" — resolved: **Release** is the full process, **Publish** is the npm upload step within it.
- "local publish" was considered but rejected for **Direct Publish** — both modes start locally (`aberlaas release` runs on the user's machine), only the publish step differs.

## Example dialogue

> **Dev:** "Is this a **First Publish**?"
> **Domain expert:** "Check `isFirstPublish()` — if the package doesn't exist on npm yet, yes. Use **Direct Publish** with an **OTP**. Otherwise, `ensureTrustedPublishing()` and let the CI handle the **Publish**."
