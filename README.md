# Antara — Bricks Child Theme

Child theme for the [Bricks](https://bricksbuilder.io/) builder. It pairs a small PHP
layer (PSR-4 autoloaded classes for custom elements, a geo-IP API, and modules) with a
[Laravel Mix](https://laravel-mix.com/) 6 frontend build that compiles SCSS and JS into
`assets/`.

- **Theme slug / parent:** `bricks-child`, `Template: bricks`
- **PHP namespace:** `Iwpdev\Antara\` → `src/php/`
- **Build inputs:** `src/scss/app.scss`, `src/js/app.js`
- **Build outputs:** `assets/css/app.css`, `assets/js/app.js` (+ source maps)

---

## Requirements

| Tool     | Version            | Notes |
|----------|--------------------|-------|
| Node.js  | **20.19+** (24.x recommended, tested on 24.4.1) | Node 20.19+ is required by Dart Sass; the build also relies on Node's built-in `require(ESM)` support (see [Why the config is ESM](#why-the-build-config-is-esm)). |
| pnpm     | **10.x** (tested on 10.10) | Package manager for the frontend build. |
| PHP      | **8.1** | Set as the Composer platform target. |
| Composer | 2.x | For the PHP autoloader and dev tooling. |

> **Why pnpm and not npm?** A plain `npm install` fails with an `ERESOLVE` peer-dependency
> conflict (`stylelint-config-prettier@9` wants `stylelint < 15`, the project pins
> `stylelint@^15`). pnpm (and Yarn 1) treat this as a *warning* and install fine. If you
> must use npm, run `npm install --legacy-peer-deps`. **No node version changes this** —
> it's the resolver, not the runtime.

---

## Setup

```bash
# 1. Frontend dependencies (creates/uses pnpm-lock.yaml)
pnpm install

# 2. PHP dependencies (required — functions.php loads vendor/autoload.php)
composer install

# 3. Build the assets
pnpm prod
```

> ⚠️ **Always commit `pnpm-lock.yaml`.** The original project `.gitignore`d all lockfiles,
> which is what caused the build to break: fresh installs pulled bleeding-edge transitive
> versions incompatible with Laravel Mix 6. The committed lockfile is what makes the build
> reproducible — don't ignore it.

---

## Build commands

| Command            | What it does |
|--------------------|--------------|
| `pnpm dev`         | One-off development build (unminified). |
| `pnpm prod`        | Production build (minified). |
| `pnpm watch`       | Rebuild on file changes. |
| `pnpm watch-prod`  | Production build in watch mode. |
| `pnpm icons`       | Icon-font generation entry point (see [Icon fonts](#icon-fonts)). |

Each script sets `MIX_FILE=webpack.mix.js` so Laravel Mix loads the project's mix config.

PHP linting (via Composer):

```bash
composer phpcs   # runs phpcs against phpcs.xml (WordPress coding standards)
```

---

## The webpack pin (important)

`package.json` pins webpack to an exact version. **Do not remove or bump this without
reading the following** — newer webpack releases break Laravel Mix 6.

```jsonc
"pnpm": {
  "overrides": {
    "webpack": "5.105.4"
  }
}
```

Laravel Mix 6 (`6.0.49`) is end-of-life and depends on webpack internals that recent
webpack 5.x releases changed or removed. Two independent breakages bracket the usable
range, so **5.105.4 is the most recent webpack that works**:

| Webpack version | Breakage |
|-----------------|----------|
| **5.106.0+** | `ProgressPlugin` moved its options validation to compile-time against `this.options`. Mix's progress bar (`webpackbar`) stores its own keys (`name`, `color`, `reporters`, `reporter`) there, so the build dies with *"Progress Plugin … does not match the API schema."* |
| **5.107.0+** | webpack removed `lib/SizeFormatHelpers.js`, which Mix's `BuildOutputPlugin` does `require('webpack/lib/SizeFormatHelpers')` — build dies with *"Cannot find module 'webpack/lib/SizeFormatHelpers'."* |

`5.105.4` is the newest 5.105.x: it still ships `SizeFormatHelpers` **and** still validates
`ProgressPlugin` in the constructor (the form `webpackbar` expects).

**Why `resolutions` works with pnpm:** `resolutions` is Yarn's field name, but pnpm reads
it and maps it to its own `overrides` (you can see `overrides: webpack: 5.105.4` recorded
in `pnpm-lock.yaml`). If you prefer the idiomatic pnpm form, this is equivalent:

```jsonc
"pnpm": { "overrides": { "webpack": "5.105.4" } }
```

> **Longer term:** the durable fix is migrating off Laravel Mix 6 (e.g. to `@wordpress/scripts`
> or plain webpack/Vite), which would lift the webpack ceiling entirely. Out of scope for
> now — the pinned build works.

---

## Why the build config is ESM

`package.json` has `"type": "module"`, and `webpack.mix.js` / `generate-icons.js` are
written as ES modules (`import` / `export default`). Laravel Mix loads the config via
`require()`, which only works on ESM files because **Node 20.19+/22+/24 enable `require(ESM)`
by default** (the config has no top-level `await`). This is the other reason a modern Node
version is required.

If you ever hit `ERR_REQUIRE_ESM` on an older Node, the fallback is to convert
`webpack.mix.js` and `generate-icons.js` to CommonJS (`require` / `module.exports`, renamed
`.cjs`) and drop `"type": "module"` — but on Node 24 this isn't necessary.

> Note: the npm scripts originally pointed at `webpack.mix.cjs` / `generate-icons.cjs`,
> files that never existed. They've been corrected to the real `.js` files.

---

## Project structure

```
bricks-child/
├── functions.php          # Enqueues style.css on frontend; boots Iwpdev\Antara\Main
├── style.css              # Theme header (Template: bricks)
├── composer.json          # PSR-4 autoload (Iwpdev\Antara\ -> src/php/), phpcs
├── package.json           # Build scripts + webpack pin
├── webpack.mix.js         # Laravel Mix config (ESM)
├── generate-icons.js      # SVG -> icon-font generator (ESM)
├── src/
│   ├── js/
│   │   ├── app.js         # JS entry point (GSAP, Bootstrap, Swiper, layout modules)
│   │   └── layout/        # Feature modules (Header, Modal, Scroll, Forms, …)
│   ├── scss/
│   │   ├── app.scss       # SCSS entry point (imports layout/ and components/)
│   │   ├── layout/
│   │   └── components/
│   ├── php/               # PSR-4 classes: Elements/, Api/, Modules/, Main.php
│   └── icons/             # (optional) SVGs for icon-font generation
└── assets/                # BUILD OUTPUT — css/, js/, fonts/ (do not edit by hand)
```

### JavaScript

`src/js/app.js` is the single entry. It registers GSAP plugins, pulls in Bootstrap and
Swiper, and wires up the `src/js/layout/*` feature modules. `jQuery` is treated as a
webpack external (provided by WordPress as the global `jQuery`).

The whole GSAP toolset — including `MorphSVGPlugin`, `SplitText`, `DrawSVGPlugin`, etc. —
is **free and bundled in the public `gsap` package** since GSAP 3.13 (following the Webflow
acquisition), so these plugins install from the standard npm registry with no Club
GreenSock membership or private token. The `try/catch` around `MorphSVGPlugin` registration
in `app.js` is therefore now redundant, but harmless.

### SCSS

`src/scss/app.scss` imports everything under `layout/` and `components/`.

### Icon fonts

If `src/icons/` exists and contains SVGs, the build (`generate-icons.js`, invoked from
`webpack.mix.js`) generates an icon font into `assets/fonts/` and a `src/scss/icon-font.scss`
partial (classes prefixed `ico-`, base selector `.ico`). With no `src/icons/` folder the
build simply logs a warning and skips this step.

---

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `ERESOLVE … stylelint` on install | Use `pnpm install` (or `npm install --legacy-peer-deps`). Not a Node-version issue. |
| `Cannot find module 'webpack/lib/SizeFormatHelpers'` | webpack drifted to 5.107+. Ensure the `webpack` pin (5.105.4) is in place and reinstall. |
| `Progress Plugin … does not match the API schema` | webpack drifted to 5.106+. Same fix — keep the 5.105.4 pin. |
| `ERR_REQUIRE_ESM` running a build | Node too old. Use Node 20.19+/24. |
| `SassError: … is not a color` | Malformed CSS relative-color syntax in SCSS — use `rgb(from var(--name) r g b / .25)` (space-separated, `var()` wrapped). |
| `bricks-child` styles missing on frontend | Run `composer install` — `functions.php` requires `vendor/autoload.php`. |
