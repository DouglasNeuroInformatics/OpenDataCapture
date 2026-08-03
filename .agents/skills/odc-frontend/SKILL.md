---
name: odc-frontend
description: Write or change React UI in apps/web, apps/gateway or packages/react-core — a component (not the route file that renders it), its user-facing strings, its Storybook story, or moving it into react-core so a second frontend can use it. Use also when eslint reports jsx-no-literals, a required-field validation message renders in English, or a story never appears in Storybook. vercel-react-best-practices covers render performance; this covers the registries it never touches.
---

`packages/react-core` has no build of its own — `exports['.']` points at `./src/index.ts` — so five
workspaces compile it themselves: `apps/web` (the clinician SPA), `apps/gateway` (server-rendered,
read by patients), `apps/playground`, `packages/serve-instrument` and `storybook`. They share
`useTranslation` and one component style. They do not share the machinery that checks either.

Two kinds of trap follow. eslint's frontend rules are scoped by file glob, so they do not run on
three of the five at all. And every shared resource — translation namespaces, zod error maps, story
directories, the react-core barrel — has a hand-maintained **registry** whose missing entry costs a
browser console line at most: eslint passes, and the story you wrote renders green in a Storybook
that never loads it. `tsc` catches exactly one registry, the `declare module` member that registers
a namespace in `apps/web`.

## Copy reaches the user through `t`, and eslint sees only part of it

Root `AGENTS.md` requires every user-facing string to go through `t`. What follows is the part
eslint cannot enforce.

`react/jsx-no-literals` is an **error** on `apps/web/src/**/*.tsx` and
`packages/react-core/src/**/*.tsx` — and nowhere else (`eslint.config.js`). Three blind spots follow
from that configuration, and you are the only check standing in front of them:

- **It reads JSX children, not attributes.** The rule is configured `ignoreProps: true`, so
  `placeholder`, `aria-label`, `title` and every other string prop lints clean while reading to a
  user exactly like copy. Pass those through `t` too.
- **It does not run on `apps/gateway`, `apps/playground` or `packages/serve-instrument`.** Those
  three sit outside the eslint blocks carrying `jsx-no-literals`, `import/no-default-export` and the
  bare-`clsx` ban (`apps/gateway/AGENTS.md`) — and gateway is the app a patient reads.
- **Not everything it flags is copy.** Stack-frame syntax and the like belong in a named constant
  outside the JSX with a comment saying why — not in a `t` call, and not in the `eslint.config.js`
  allowlist (`apps/web/AGENTS.md`).

**Done when** every string a user reads in your diff passes through `t` — attribute values and
`apps/gateway` files included, since nothing else will ask.

## A keyed namespace resolves only where its program registered it

`t('namespace.key')` resolves against whatever the _rendering_ program registered at startup, and
react-core code runs inside all five.

| Program                                                        | `t('ns.key')`                          | What decides it                                                                                                                                                                                |
| -------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`                                                     | Legal once the namespace is registered | The namespace registry is `src/services/i18n.ts`, and registering one is not a single edit (`apps/web/AGENTS.md`)                                                                              |
| `apps/gateway`, `apps/playground`, `packages/serve-instrument` | Renders **nothing**                    | All three call `i18n.init({ translations: {} })`, and libui's `t()` logs `Failed to extract translation` and returns `''` — the patient sees a blank label, not a dotted key                   |
| `storybook`                                                    | Renders correctly, proves nothing      | Its preview imports `apps/web/src/services/i18n` for the side effect (`storybook/AGENTS.md`), so every story boots with web's resources — react-core's included, where at runtime they are not |
| `packages/react-core`                                          | Never — inline `t({ en, fr })`         | It compiles inside all five programs above, so a namespace `apps/web` registered is simply absent; host-owned copy arrives as a prop instead (`packages/react-core/AGENTS.md`)                 |

The one keyed family safe everywhere is libui's own registered namespace — `t('libui.yes')`,
`t('libui.no')` (`packages/react-core/AGENTS.md`).

**Done when** every keyed `t('…')` in your diff names a namespace registered by each program that
renders the component — read the diff for `t('`, since a green story proves nothing.

## Instrument validation messages have four registries, all in `apps/web`

`apps/web/src/services/zod.ts` is the only place a required-field message is localized, and it
configures **four** separate zod registries; a `setErrorMap` or `z.config` call anywhere else in the
SPA reaches one of them and leaves three on zod's English defaults. Open `apps/web/AGENTS.md` before
editing it — it names the four — and keep the `new Function` indirection hiding the runtime import
from Vite.

`apps/gateway` renders `InstrumentRenderer` and registers no error map at all, so a patient's
validation errors are zod's English defaults today. Localizing them is new work in gateway, not an
edit to web's `zod.ts`.

**Done when** every error-map configuration in your diff lives in `apps/web/src/services/zod.ts` and
covers all four instances — bundled v3, bundled v4, runtime v3, runtime v4.

## A story appears only if its directory is scanned

The story registry is `storybook/config/main.ts`, which enumerates exactly three directories:
`packages/react-core/src/components` and `apps/playground/src/components`, plus all of
`apps/web/src`. A `*.stories.tsx` outside them never appears in the sidebar — no warning, no error
(`storybook/AGENTS.md`).

**Done when** each story you added sits under a scanned directory, or your reply states the component
has none.

## Working in `packages/react-core`

The barrel is the registry here: a folder under `src/components/` publishes nothing until
`export * from './components/X';` lands in `src/index.ts`, and there are no deep import paths to fall
back on (`packages/react-core/AGENTS.md`).

A component earns a place there when a second frontend **renders** it, so name the consumer file
before you move anything. The move has an order in which every skipped step still compiles:
`.agents/docs/playbooks/promote-to-react-core.md`. Open it before the first `git mv`.

**Done when** the file that renders it in the second frontend is named in your reply, the component
is exported from `src/index.ts`, and every `data-testid` it carried survived the move.

## Where the conventions live

| Open                                    | When                                                                                                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/AGENTS.md`                    | Anything in the SPA: layer folders, the Zustand store, data fetching, styling, `data-testid` selectors, registering a translation namespace, the unit-test environment |
| `packages/react-core/AGENTS.md`         | The components deliberately left off the barrel, and injecting host-specific behaviour as a prop                                                                       |
| `apps/gateway/AGENTS.md`                | Writing anything gateway server-renders — its module-scope and `RootProps` serialization constraints                                                                   |
| `apps/playground/AGENTS.md`             | UI in the instrument editor — its load-bearing top-level `await`s and the example-catalog directory convention                                                         |
| `storybook/AGENTS.md`                   | Writing a story, or running the one Storybook instance                                                                                                                 |
| `.agents/skills/odc-web-route/SKILL.md` | The change is a page under `src/routes`, its loader, or the query hook it prefetches                                                                                   |
| `.agents/skills/odc-testing/SKILL.md`   | Placing the test — `packages/react-core` and `apps/gateway` contribute no vitest project, so a test file beside the component runs nowhere                             |
