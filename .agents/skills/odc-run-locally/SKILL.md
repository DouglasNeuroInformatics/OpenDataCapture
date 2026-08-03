---
name: odc-run-locally
description: Bring the Open Data Capture stack up on this machine — `pnpm dev` (api, gateway, web), a fresh clone from zero, the standalone playground, storybook or outreach dev servers, or a local instance with data in it. Use also when a dev server dies at startup, or the browser gets ECONNREFUSED from the api.
---

Four things have to be true before a dev server serves anything, and each one fails as a **decoy** —
the thing you are looking at is not the thing that is wrong. Check all four before debugging a
startup crash.

## The four prerequisites, in dependency order

**1. `.env` exists — and `pnpm generate:env` is a first-clone command only.** It rewrites `.env`
wholesale with fresh secrets, so on a clone that already works, hand-add the one line you need
instead (playbook step 3; a genuinely new variable is `.agents/docs/playbooks/add-env-var.md`). The
decoy is the logout you notice — the fresh `SECRET_KEY` also orphans every stored instrument-repo
credential, and those fail silently, later.

**2. `STORAGE_ENABLED=false`, unless an S3-compatible service really is listening.** A freshly
generated `.env` points it at `http://localhost:9000`, where nothing listens, and
`StorageService.onModuleInit` kills the api during boot (playbook step 4). The decoy is what turbo
prints: the api takes its two sibling dev servers down with it, so the run ends in
`ERROR run failed` over a nested `connect ECONNREFUSED ::1:9000` that never says the word storage.

**3. `pnpm build` has run at least once.** A dev server started before that build dies while its
Vite config is still resolving (playbook step 7). The crash does name the path — `ENOENT: no such
file or directory, scandir '<repo>/runtime/v1/dist'`, from `generateManifest` in
`packages/runtime-meta/src/index.js` — but it is raised inside a plugin factory, so the decoy is a
Vite configuration error. Confirm `runtime/v1/dist` exists before chasing one. Turbo repairs this
for you; anything started outside turbo does not.

**4. Development talks to a real Mongo replica set.** Only `NODE_ENV=test` gets an in-memory one
(`apps/api/src/core/prisma.ts`; playbook step 5 starts the real one and initiates it). The decoy is
a green `pnpm test:e2e`: it passes on a machine with no MongoDB installed at all, and proves nothing
about whether `pnpm dev` can connect.

## Then follow the playbook

`.agents/docs/playbooks/run-locally.md` is the ordered procedure — open it and work it end to end.
playground, storybook and outreach are each started on their own; its closing table carries the
command and port for each.

| Branch                    | Done when                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`, a fresh clone | every command in the playbook's `## Verify` block has run and returned the documented result — reading `rs.status().ok` through a host `mongosh` if Mongo is not in Docker |
| a standalone app          | the port it logged answers, and its first page renders                                                                                                                     |
| an instance with data     | `curl -s http://localhost:5500/v1/setup` reports `"isSetup":true`                                                                                                          |

## Getting data into a local instance

**There is no seed script.** The setup screen (`POST /v1/setup`) is the only way to get a populated
instance in one shot, and it drops the database first — so reaching for it to clear a stuck login on
a development instance takes every record with it. Everything else arrives one record at a time
through the api's ordinary create endpoints. Playbook step 9 has the mechanism and the
deliberate-reset commands.
