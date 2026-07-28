# esbuild-plugin-prisma

An esbuild plugin that copies the Prisma query engine binary into a build output directory.

**Type:** build tooling — never imported by application code.

## Status in Open Data Capture

One consumer: `apps/gateway/scripts/build.ts`. The gateway is bundled to a single ESM file with esbuild, and Prisma's query engine is a platform-specific `.node` binary that a bundler cannot inline — the plugin copies it next to the output so the bundled gateway can find it at runtime.

`apps/api` does not use it; it builds through the `libnest` CLI, which handles the engine itself.

## When to reach for this

- Bundling a Node service that talks to Prisma with esbuild. Use this instead of hand-rolling a copy step, since resolving the correct engine filename requires querying `@prisma/engines` and `@prisma/get-platform` for the current binary target.

## Key exports

- `prismaPlugin(options: { outdir: string }): esbuild.Plugin` — the only export.

It registers an `onEnd` hook that resolves the current platform's binary target, locates the matching `libquery_engine-<target>*.node` in the Prisma engines directory, creates `outdir` if needed, and copies the binary in. It throws if no matching engine is found, so a misconfigured build fails loudly rather than producing a broken bundle.

## Usage in this repo

```ts
import { prismaPlugin } from '@douglasneuroinformatics/esbuild-plugin-prisma';

await esbuild.build({
  bundle: true,
  format: 'esm',
  loader: { '.node': 'copy' },
  outfile: path.resolve(outdir, 'main.js'),
  platform: 'node',
  plugins: [prismaPlugin({ outdir: path.join(outdir, 'prisma/client') })]
});
```

## Reading the source

Authored as JSDoc-typed JavaScript with a hand-written declaration file; `src` is the real source, not build output. It is a single ~38-line file — read it before assuming anything about its behaviour:

```sh
cat apps/gateway/node_modules/@douglasneuroinformatics/esbuild-plugin-prisma/src/index.js
cat apps/gateway/node_modules/@douglasneuroinformatics/esbuild-plugin-prisma/src/index.d.ts
```

No hosted docs site.
