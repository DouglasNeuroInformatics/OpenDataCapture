# eslint-config

ESLint flat-config factory for DNP TypeScript/JavaScript projects.

**Type:** config only — no runtime import in application code.

## Where it's used

`eslint.config.js` (repo root) is the only consumer; every workspace's `lint` script (`tsc && eslint --fix src`) runs against it:

```js
import { config } from '@douglasneuroinformatics/eslint-config';

export default config(
  {
    astro: { enabled: true },
    env: { browser: true, es2021: true, node: true },
    react: { enabled: true, version: '18' },
    typescript: { enabled: true }
  },
  {
    ignores: [
      /* generated files, vendored code, ... */
    ]
  }
);
```

The `config()` factory conditionally assembles flat-config blocks (base, import, react, typescript, jsdoc, json, perfectionist, astro, svelte) from the options object, then merges any additional flat-config objects passed as later arguments. Finer-grained composition is available via the `./configs/*` subpath exports and the `Config`/`ConfigDef`/`Options` types — prefer overriding or extending a specific rule set over writing new ESLint config from scratch.

## Reading the source

Published as `dist` only, but the output is unbundled and unminified, so it reads fine:

```sh
ls  node_modules/@douglasneuroinformatics/eslint-config/dist          # index, types, utils
ls  node_modules/@douglasneuroinformatics/eslint-config/dist/configs  # one file per rule block
cat node_modules/@douglasneuroinformatics/eslint-config/dist/index.d.ts
```

No hosted docs site — this package has no runtime API beyond the config factory.
