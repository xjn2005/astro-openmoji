# npm GitHub Actions Publishing Design

**Date:** 2026-10-31

## Goal

Publish `astro-openmoji` from GitHub Actions while keeping the long-term release path free of stored npm credentials.

## Constraints

- The npm package does not exist yet, so npm Trusted Publishing cannot be configured before the first publish.
- The first publish therefore needs a short-lived npm token.
- Later publishes should use npm Trusted Publishing (OIDC), GitHub-hosted runners, and package provenance.
- A release must never publish a package version that does not match its Git tag.
- The project must still pass its tests, build, and package dry run before publishing.

## Design

### First publish

`.github/workflows/bootstrap-publish.yml` is a manually triggered, one-time workflow. It installs dependencies, runs all verification commands, and publishes the initial public package with provenance using the `NPM_TOKEN` repository secret.

After it succeeds, the maintainer configures npm Trusted Publishing, removes the secret, and disables or deletes this bootstrap workflow.

### Subsequent publishes

`.github/workflows/publish.yml` runs when a GitHub Release is published. It checks out the release tag and requires that tag to equal `v` followed by `package.json`'s version. It then installs, tests, builds, checks the package contents, and runs `npm publish`.

The workflow grants `id-token: write` and deliberately does not provide `NODE_AUTH_TOKEN`; npm authenticates through GitHub Actions OIDC. npm attaches provenance automatically for Trusted Publishing.

### Package metadata

`package.json` declares the exact public GitHub repository, issue tracker, homepage, npm registry, and public access. The repository URL must match the Trusted Publisher repository identity.

### Maintainer experience

The README documents:

1. creating a short-lived npm token and GitHub secret;
2. running the bootstrap workflow once;
3. configuring npm Trusted Publishing for `xjn2005/astro-openmoji` and `publish.yml`;
4. deleting the token and retiring the bootstrap workflow;
5. publishing future versions through matching `vX.Y.Z` GitHub Releases.

## Safety

- Neither workflow runs on ordinary pushes.
- Publishing is serialized per package/release.
- Every publish runs tests, build, and `npm pack --dry-run` first.
- The regular workflow fails before publishing when the release tag and package version differ.
- The initial token is documented as temporary and is not written to the repository.

