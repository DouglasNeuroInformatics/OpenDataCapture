# tsconfig

Shared `tsconfig.json` base for DNP TypeScript projects.

**Type:** config only — no runtime import, no source code; consumed via `extends`.

## Where it's used

`tsconfig.base.json` (repo root) extends it and layers on the repo-wide compiler options. Every workspace package's `tsconfig.json` then extends `tsconfig.base.json` rather than this package directly:

```json
// tsconfig.base.json
{
  "extends": ["@douglasneuroinformatics/tsconfig"],
  "compilerOptions": {
    "allowJs": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

```json
// packages/schemas/tsconfig.json
{
  "extends": "../../tsconfig.base.json"
}
```

Put anything that should apply repo-wide in `tsconfig.base.json`; only per-package concerns (`lib`, `paths`, `include`) belong in a package's own `tsconfig.json`.

## Reading the source

The package is a single file, and that file is the whole API:

```sh
cat node_modules/@douglasneuroinformatics/tsconfig/tsconfig.json
```

No hosted docs site — there is nothing to generate docs from.
