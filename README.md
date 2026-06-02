# Antara — Bricks Child Theme

Child theme for the [Bricks](https://bricksbuilder.io/) builder. It combines a small PHP
layer with a [Laravel Mix](https://laravel-mix.com/) 6 frontend build that compiles SCSS and
JS into `assets/`.

- **Theme slug / parent:** `bricks-child`, `Template: bricks`
- **PHP namespace:** `Iwpdev\Antara\` → `src/php/`
- **Build inputs:** `src/scss/app.scss`, `src/js/app.js`
- **Build outputs:** `assets/css/app.css`, `assets/js/app.js` and source maps

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | **20.19+** | 24.x recommended. Needed by Dart Sass and by the ESM-based build config. |
| Yarn | **1.x / Classic** | This repo has a `yarn.lock` v1 file and is documented for Yarn Classic. |
| PHP | **8.1** | Composer platform target. |
| Composer | **2.x** | Required for the PHP autoloader and dev tooling. |

---

## Install

Use Yarn, not npm or pnpm, so you stay on the lockfile this project is documented against.

```bash
yarn install --frozen-lockfile
composer install
yarn prod
```

`yarn.lock` is the file that keeps the frontend dependency tree stable. Do not delete it or
reinstall without it unless you are intentionally updating dependencies.

---

## Build commands

| Command | What it does |
|---------|----------------|
| `yarn dev` | One-off development build, unminified. |
| `yarn prod` | Production build, minified. |
| `yarn watch` | Rebuild on file changes. |
| `yarn watch-prod` | Production build in watch mode. |
| `yarn icons` | Generates the icon font from `src/icons/` if that folder exists. |

Each script sets `MIX_FILE=webpack.mix.js` so Laravel Mix loads the correct config.

PHP linting:

```bash
composer phpcs
```

---

## Why the webpack pin matters

This project keeps `webpack` fixed to `5.105.4` because Laravel Mix 6 depends on internals
that changed in later 5.x releases. Newer versions break this build.

The lock is enforced in two places:

- `package.json` uses Yarn `resolutions`
- `package.json` also keeps the existing `pnpm.overrides` entry for completeness

Do not remove either unless you are also migrating away from Laravel Mix 6.

### The failure modes

- `webpack@5.106.0+` can fail with the `Progress Plugin ... does not match the API schema`
  error.
- `webpack@5.107.0+` can fail with `Cannot find module 'webpack/lib/SizeFormatHelpers'`.

`5.105.4` is the last release in the 5.105 line and still contains the behavior Mix 6 expects.

---

## Why the build config is ESM

`package.json` has `"type": "module"`, and `webpack.mix.js` plus `generate-icons.js` are
written as ES modules.

Laravel Mix loads the config through Node's `require()` behavior. That works on modern Node
versions where `require(ESM)` is supported, which is why the minimum Node version here is
important.

If you ever need to support an older Node version, the fallback is to convert those files to
CommonJS and drop `"type": "module"`. That is not needed for the current setup.

---

## Project structure

```
bricks-child/
├── functions.php          # Enqueues style.css on frontend; boots Iwpdev\Antara\Main
├── style.css              # Theme header (Template: bricks)
├── composer.json          # PSR-4 autoload, phpcs
├── package.json           # Build scripts + Yarn webpack pin
├── yarn.lock              # Frontend dependency lockfile
├── webpack.mix.js         # Laravel Mix config (ESM)
├── generate-icons.js      # SVG -> icon-font generator (ESM)
├── src/
│   ├── js/
│   │   ├── app.js         # JS entry point
│   │   └── layout/
│   ├── scss/
│   │   ├── app.scss
│   │   ├── layout/
│   │   └── components/
│   ├── php/               # PSR-4 classes: Elements/, Api/, Modules/, Main.php
│   └── icons/             # Optional SVGs for icon-font generation
└── assets/                # Build output: css/, js/, fonts/
```

### JavaScript

`src/js/app.js` is the single entry. It registers GSAP plugins, imports Bootstrap and Swiper,
and wires up the `src/js/layout/*` modules. `jQuery` is treated as a webpack external and is
provided by WordPress as the global `jQuery`.

### SCSS

`src/scss/app.scss` imports everything under `layout/` and `components/`.

### Icon fonts

If `src/icons/` exists and contains SVGs, the build generates an icon font into `assets/fonts/`
and a `src/scss/icon-font.scss` partial. With no `src/icons/` folder the build just skips that
step.

---

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `ERESOLVE ... stylelint` on install | Use Yarn Classic with `yarn install --frozen-lockfile`. Do not switch to npm for this repo. |
| `Cannot find module 'webpack/lib/SizeFormatHelpers'` | `webpack` drifted past the pinned version. Keep `resolutions` in place and reinstall. |
| `Progress Plugin ... does not match the API schema` | Same issue: `webpack` was allowed to float too far. |
| `ERR_REQUIRE_ESM` while building | Node is too old. Use Node 20.19+ or newer. |
| `SassError: ... is not a color` | Malformed CSS relative-color syntax in SCSS. |
| `bricks-child` styles missing on frontend | Run `composer install`; `functions.php` requires `vendor/autoload.php`. |
