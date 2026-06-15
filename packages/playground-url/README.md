# @opendatacapture/playground-url

Generate shareable [Open Data Capture playground](https://playground.opendatacapture.org) links from instrument source files.

A playground link embeds a snapshot of an instrument's source files directly in the URL (lz-string compressed). Anyone who opens the link gets that instrument loaded into the playground — no server or account required.

## Library

```ts
import { generatePlaygroundURL } from '@opendatacapture/playground-url';

const url = generatePlaygroundURL({
  files: [{ name: 'index.ts', content: 'export default { /* ... */ };' }],
  label: 'My Instrument'
});
// => https://playground.opendatacapture.org/?files=...&label=...
```

| Export                           | Description                                                 |
| -------------------------------- | ----------------------------------------------------------- |
| `generatePlaygroundURL(options)` | Returns the share link as a string.                         |
| `encodeShareURL(options)`        | Returns a `URL` annotated with the encoded `size` in bytes. |
| `decodeShareURL(url)`            | Decodes an instrument from a share URL (or `null`).         |
| `isFullscreenShareURL(url)`      | Whether the link opens the read-only fullscreen preview.    |
| `DEFAULT_PLAYGROUND_URL`         | Origin of the hosted playground.                            |

Options: `files`, `label`, optional `fullscreen` (read-only preview) and `baseURL` (defaults to the hosted playground).

## CLI

Point it at a directory of instrument source files:

```sh
npx @opendatacapture/playground-url ./my-instrument
```

The status line is written to stderr and the link to stdout, so it pipes cleanly.

| Option                 | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `-l, --label <label>`  | Label for the shared instrument (defaults to the directory name). |
| `-f, --fullscreen`     | Share a read-only fullscreen preview instead of the editor.       |
| `-b, --base-url <url>` | Playground origin to link to (defaults to the hosted playground). |
| `-o, --open`           | Open the generated link in your default browser.                  |

Only text source files (`.css`, `.html`, `.js`, `.jsx`, `.json`, `.ts`, `.tsx`) are embedded; binary assets cannot be represented in a share URL and are skipped with a warning.
