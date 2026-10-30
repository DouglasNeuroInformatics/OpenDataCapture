# cli

`cli/odc-cli` is a single executable Python script — that one file is the entire directory. It is an
administrator's tool for driving an already-deployed Open Data Capture instance over its REST API.

Read the root `AGENTS.md` first for the rules that apply everywhere.

## It is outside the JavaScript build entirely

`cli` is **not a pnpm workspace** — `pnpm-workspace.yaml` lists `apps/*`, `packages/*`, `runtime/*`,
`storybook`, `testing` and `vendor/**/*`, and there is no `package.json` here. `pnpm lint`,
`pnpm format`, `pnpm test` and CI never touch this file; nothing checks it on a pull request. Run it
directly: `./cli/odc-cli --help`.

**Standard library only** — `argparse`, `urllib.request`, `json`, `base64`, `datetime`. Do not add a
third-party import; the whole point is that an admin can copy one file onto a server and run it. It
targets **Python 3.8** and hard-exits below that, so no `match`, and runtime `X | Y` unions are safe
only in annotations (the file relies on `from __future__ import annotations`).

State is a JSON file at `~/.odc-cli.json` holding the base URL and the JWT from `login`.

## Nothing links it to the API

Every URL is a hand-written f-string against `config.base_url` and every payload a hand-built dict.
There is **no generated client and no compile-time relationship to `packages/schemas`**, so an API
change breaks this file silently — no test, type error or lint rule in this repo will notice.

Some values are hand copies too. The `choices` of `odc-cli instruments list --kind` copy
`$InstrumentKind` in `packages/schemas/src/instrument/instrument.base.ts`, and the API does not
validate `kind`, so this argparse check is the only thing that rejects a bad one.

## When to touch it

Only when one of the endpoints below changes shape, when a new instrument kind is added, or when
asked for a new command. If you change
the request or response of any of these in `apps/api`, update this file in the same change — nothing
else will remind you.

| Command group                          | Endpoints called                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `auth login`                           | `POST /v1/auth/login`                                                            |
| `auth logout`, `auth status`, `config` | none — purely local, `auth status` just decodes the stored JWT                   |
| `instrument-records`                   | `GET`, `PATCH /v1/instrument-records[/:id]`, `DELETE /v1/instrument-records/:id` |
| `subjects`                             | `GET /v1/subjects[/:id]`, `DELETE /v1/subjects/:id?force=True`                   |
| `instruments list`                     | `GET /v1/instruments/list?kind=`                                                 |
| `setup`                                | `GET /v1/setup`, `POST /v1/setup`                                                |

`subjects find --min-date` filters client-side after fetching every subject; the API has no such
parameter. Do not "fix" that by inventing a query string.
