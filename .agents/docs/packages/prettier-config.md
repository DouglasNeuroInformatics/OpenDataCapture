# prettier-config

Prettier config factory for DNP projects, plus a pre-commit formatting script.

**Type:** config only — no runtime import in application code.

## Where it's used

`prettier.config.js` (repo root) is the only consumer. Every workspace's `format` script (`prettier --write src`) resolves to it:

```js
import { createConfig } from '@douglasneuroinformatics/prettier-config';

export default createConfig({
  astro: true,
  tailwindcss: true
});
```

`createConfig(options)` returns a Prettier config with the DNP house style baked in — `printWidth: 120`, `singleQuote: true`, `trailingComma: 'none'` — and conditionally registers the `astro`, `svelte`, and `tailwindcss` plugins. Any other Prettier option passed through `options` overrides the defaults. Change formatting here rather than adding per-package Prettier configs.

Repo-local exclusions live in `.prettierignore`, not in this config.

## Pre-commit hook

The package ships a `prettier-pre-commit` binary that formats staged files with `prettier --ignore-unknown --write` and re-stages them. `.husky/pre-commit` delegates to it:

```sh
prettier-pre-commit
```

Husky's runner puts `node_modules/.bin` on `PATH`, so no `pnpm exec` prefix is needed. Change the hook's behaviour upstream in this package rather than inlining a replacement script.

## Reading the source

Authored as JSDoc-typed JavaScript with a hand-written declaration file; `src` is the real source, not build output. The whole package is two small files:

```sh
cat node_modules/@douglasneuroinformatics/prettier-config/src/index.js    # the defaults and plugin wiring
cat node_modules/@douglasneuroinformatics/prettier-config/src/index.d.ts  # createConfig / Options / PrettierConfig
cat node_modules/@douglasneuroinformatics/prettier-config/bin/prettier-pre-commit
```

No hosted docs site.
