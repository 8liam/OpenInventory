# Contributing

Thanks for helping out! Branch off `develop`, open the PR against `develop`; `main` is only updated by merging `develop`, and every merge to `main` publishes a release.

## Setup

Requires Node 24+ and pnpm 12. See the [Develop section](README.md#develop) of the README.

```sh
pnpm install
pnpm exec tsc -b && vp check && pnpm test
```

CI runs the same checks on every PR.

## Commits

Use [conventional commits](https://www.conventionalcommits.org): `feat(scope): ...`, `fix(scope): ...`, `chore`, `docs`, and so on. The release version is derived from them: `feat` bumps the minor version, `!` or a `BREAKING CHANGE:` footer bumps the major, everything else is a patch.

## Pull requests

Keep them small and focused, describe what you verified, and don't commit secrets, `.env` files or build output.

By contributing you agree your work is licensed under the project's [PolyForm Noncommercial 1.0.0](LICENSE) license.
