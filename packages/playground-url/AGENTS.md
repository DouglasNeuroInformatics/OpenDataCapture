# packages/playground-url

Encodes an instrument's editor files into a shareable playground link and decodes them back, plus a
`playground-url` CLI that does the same for a directory. Used by `apps/playground` (`ShareButton`,
`IndexPage`). `README.md` documents the public API — keep it current with any change.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## Traps

**This is one of five packages published to npm.** `scripts/list-publishable.sh` picks it up from
its `publishConfig`, so a change here is a change to a public API, and `version` is bumped for it by
`scripts/increment-version.ts` — never hand-edit it.

**The `.` export is raw TypeScript** (`./src/index.ts`), in the published tarball as well as in the
workspace. `pnpm build` runs `scripts/build.js`, which esbuilds `src/cli.ts` into `dist/cli.js` and
nothing else — `dist` exists only for the `bin`. A library change needs no build; a CLI change does.

**A share URL can carry UTF-8 text and nothing else.** Files are `JSON.stringify`d and lz-string
compressed into the URL fragment, so images, audio and video cannot be represented at all. The CLI
skips them with a warning; `TEXT_FILE_EXT_REGEX` and `BINARY_FILE_EXT_REGEX` in `src/cli.ts` are the
allowlist and the known-skip list, and both must track what the playground editor accepts.

The encoding is a wire format for links people have already shared. Changing what `encodeFiles`
writes invalidates every existing link, so `decodeShareURL` has to keep reading the old shape.

**The payload lives in the fragment (`#files=…&label=…&fullscreen=1`), never the query string.** A
query string is sent to the server, and a large instrument pushes the request line past
`http-server`'s header limit (HTTP 431). Links created before the switch used `?files=…`, so
`getShareParams` in `src/share-url.ts` falls back to the query string when the fragment has no
`files` — keep that fallback.

## Tests

`pnpm exec vitest --project playground-url`. The one test file, `src/share-url.test.ts`, sits beside
the source rather than in a `__tests__/` folder and is round-trip based: encode, decode, assert
equality. Follow that shape.
