# @opendatacapture/instrument-guidelines

Guidelines for authoring [Open Data Capture](https://opendatacapture.org) instruments,
written to be read by an AI agent (e.g. Claude Code). Install this package and link the
guidelines into your project, then point your agent at the resulting file — it will read
the full instrument specification and author instruments accordingly.

## Usage

Install as a dev dependency:

```bash
pnpm add -D @opendatacapture/instrument-guidelines
```

Link the guidelines into your project root:

```bash
pnpm instrument-guidelines
```

This creates an `AGENTS.md` symlink pointing at the installed guidelines, so it always
reflects the version you have installed — updating the package updates the guidelines.

### Options

| Option          | Description                                                   |
| --------------- | ------------------------------------------------------------- |
| `--file <name>` | Target filename to create (default: `AGENTS.md`). Repeatable. |
| `--copy`        | Copy the guidelines instead of symlinking them.               |
| `--force`       | Overwrite existing target file(s).                            |
| `-h`, `--help`  | Show help.                                                    |

Create both `AGENTS.md` and a `CLAUDE.md` (which Claude Code auto-loads):

```bash
pnpm instrument-guidelines --file AGENTS.md --file CLAUDE.md
```

> **Note:** Install the package first (as above) so the symlink targets the stable copy
> in `node_modules`. For a one-off run via `pnpm dlx` without installing, use `--copy`,
> since the ephemeral install location would otherwise leave a dangling link.

## Pointing your agent at it

Once a `CLAUDE.md` (or `AGENTS.md`) exists at your project root, start Claude Code in that
directory — it reads the guidelines automatically. No further setup is required to begin
authoring instruments.
