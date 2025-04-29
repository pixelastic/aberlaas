---
title: Setup GitHub
---

The `aberlaas setup` will configure your GitHub repo with the following
settings:

- Pull Requests can only be **rebased** or **squashed** (no merge commit)
- Branches are automatically deleted when their Pull Request is merged

You will need a `ABERLAAS_GITHUB_TOKEN` environment variable for this command to
work. If no such token is available, the URL to the repository settings page
will be displayed, so you can perform those actions automatically.
