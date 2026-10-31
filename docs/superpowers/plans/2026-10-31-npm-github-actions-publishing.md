# npm GitHub Actions Publishing Implementation Plan

> Execute this plan in the current `astro-openmoji` workspace. Do not publish, commit, or push as part of the implementation.

**Goal:** Add a safe one-time bootstrap publish and a long-term npm Trusted Publishing workflow.

**Architecture:** A manual token-authenticated workflow creates the package on npm. A separate release-triggered OIDC workflow handles all later versions after Trusted Publishing is configured.

**Tech Stack:** GitHub Actions, Node.js 24, npm, npm Trusted Publishing/OIDC.

---

### Task 1: Add publication workflows

**Files:**

- Create: `.github/workflows/bootstrap-publish.yml`
- Create: `.github/workflows/publish.yml`

1. Add a manual bootstrap workflow using the `NPM_TOKEN` secret.
2. Run install, tests, build, and package dry run before the first publish.
3. Add a GitHub Release workflow with OIDC permissions and no npm token.
4. Validate `v${package.version}` against the release tag before publishing.

### Task 2: Add npm and repository metadata

**Files:**

- Modify: `package.json`

1. Add the exact GitHub repository, homepage, and issue tracker.
2. Add npm public-access and registry publication settings.
3. Confirm the lockfile remains valid without dependency changes.

### Task 3: Document maintainer setup and releases

**Files:**

- Modify: `README.md`

1. Explain the one-time token bootstrap.
2. Provide the exact npm Trusted Publisher values.
3. Explain token removal and bootstrap workflow retirement.
4. Document the matching package version, Git tag, and GitHub Release flow.

### Task 4: Verify

**Files:**

- Verify: `.github/workflows/*.yml`
- Verify: `package.json`

1. Parse both workflow YAML files.
2. Run `npm test`.
3. Run `npm run build`.
4. Run `npm pack --dry-run`.
5. Inspect `git status --short` and confirm no publication occurred.

