# Branch protection setup (maintainers)

Use this checklist when making the repository public on GitHub.

## 1) Repository visibility and permissions

- [ ] Set repository visibility to **Public**
- [ ] Keep **default branch** as `main`
- [ ] Do **not** grant write access broadly
- [ ] Add trusted maintainers only as collaborators when needed

> Public visibility does **not** allow random users to push to `main`.
> Only collaborators with write access can push directly.

## 2) Enable branch protection on `main`

Go to: **Settings → Branches → Add branch protection rule**

Recommended settings:

- [ ] Branch name pattern: `main`
- [ ] **Require a pull request before merging**
  - [ ] Require approvals: **1**
  - [ ] Dismiss stale pull request approvals when new commits are pushed
- [ ] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date before merging
  - [ ] Required check: `CI` (from `.github/workflows/ci.yml`)
- [ ] **Require conversation resolution before merging**
- [ ] **Do not allow bypassing the above settings** (including admins, recommended)
- [ ] **Restrict who can push to matching branches** (optional, strict mode)
- [ ] **Block force pushes**
- [ ] **Block deletions**

## 3) Recommended repository settings

- [ ] Enable **Issues**
- [ ] Enable **Discussions** (for Q&A)
- [ ] Enable **Security advisories**
- [ ] Add topic tags (e.g. `cli`, `knowledge-graph`, `typescript`, `git`)
- [ ] Add repository description and homepage/link

## 4) Labels to create

- `bug`
- `enhancement`
- `documentation`
- `good first issue`
- `help wanted`
- `triage`
- `blocked`
- `needs tests`

## 5) Maintainer merge policy

- All changes land via pull request (including maintainer changes)
- Prefer **Squash and merge** for clean history
- Delete branch after merge
- Tag releases (`v0.1.0`, `v0.2.0`) and update `CHANGELOG.md`

## 6) First release checklist

- [ ] Replace placeholder URLs/emails in docs:
  - `CONTRIBUTING.md`
  - `CHANGELOG.md`
  - `.github/ISSUE_TEMPLATE/config.yml`
  - `CODE_OF_CONDUCT.md` (`contact@acefolio.dev`)
  - `SECURITY.md` (`contact@acefolio.dev`)
- [ ] Confirm `.gitignore` excludes `dist/`, `build/`, `.evolution/`
- [ ] Push `main` with docs/templates/CI
- [ ] Verify CI passes on a test PR
- [ ] Create GitHub release `v0.1.0`

## 7) Optional hardening

- [ ] Require signed commits
- [ ] Enable Dependabot alerts/updates
- [ ] Add `CODEOWNERS` for auto-review routing
- [ ] Add release workflow for tagged builds

## Quick answer: can anyone push code?

No.

- Anyone can **fork**, **clone**, and open **pull requests**
- Only users with **write/collaborator access** can push branches to your repo
- With branch protection, even collaborators should merge only through reviewed PRs
