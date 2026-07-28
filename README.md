# OrangeHRM Playwright Tests

End-to-end test project for the public OrangeHRM demo. It uses Playwright,
TypeScript, Page Objects, fixtures, API helpers and GitHub Actions.
Chromium is the supported browser for local and CI runs.

## Setup

Requirements: Node.js 22 and npm.

```bash
npm ci
npx playwright install chromium
```

Copy `.env.example` to `.env` and provide:

```dotenv
USERNAME_LOGIN=your_username
PASSWORD_LOGIN=your_password
BASE_URL=https://opensource-demo.orangehrmlive.com/web/index.php
```

Do not commit `.env`.

## Commands

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:smoke
npm run test:readonly
npm run test:mutation
npm run test:chromium
npm run report
```

- `typecheck` checks TypeScript without creating JavaScript files.
- `lint` finds suspicious or unsafe code patterns.
- `format:check` verifies consistent formatting.
- `test:smoke` runs the fast critical-path suite.
- `test:readonly` runs tests that do not change shared demo data.
- `test:mutation` runs `@mutation` tests sequentially with one worker.

## Test groups and workers

Tests that create, update or delete shared data use the `@mutation` tag.
Read-only tests run with up to four workers in CI. Mutation tests always use one
worker to prevent conflicts on the shared OrangeHRM demo.

`CI_WORKERS` can override the read-only worker count:

```bash
CI_WORKERS=3 npm run test:readonly
```

## Project structure

```text
src/pages/          Page Objects, UI components and API helpers
tests/              Playwright specifications
tests/fixtures/     Authentication and feature fixtures
tests/helpers/      Test data and cleanup helpers
.github/workflows/  CI configuration
```

## CI

Pushes and pull requests run TypeScript checks, test discovery and the Chromium
smoke suite. Manual workflow runs can select all, smoke, read-only, mutation,
My Info or Admin tests. Full runs execute read-only tests first and mutation
tests second. A scheduled nightly workflow runs the complete Chromium suite
daily at 02:00 UTC.
