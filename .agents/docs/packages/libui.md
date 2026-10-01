# libui

Generic UI components for DNP projects, built with React and Tailwind CSS.

**Status in Open Data Capture:** used extensively — ~194 files, concentrated in `apps/web` (105) and `apps/playground` (52), plus `packages/react-core` (31), `apps/gateway`, `apps/outreach`, and `packages/serve-instrument`. It is the primary source of UI components, hooks, i18n, and theming for every frontend surface. (`storybook` declares it as a dependency but imports it only through the components it renders.)

There is no root `.` export — always import from a subpath.

## When to reach for this

- Need a common UI primitive (button, dialog, table, form field, dropdown) — use a `libui` component instead of building one or adding another component library.
- Need a common frontend hook (translation, theme, media query, storage, event listener) — check `./hooks` before writing one.
- Need to merge Tailwind class names conditionally — use `cn()` from `./utils` instead of a custom classnames helper.
- Need to render a declarative form — use `Form` from `./components`, typed via [libui-form-types](libui-form-types.md).

## Subpath exports

| Subpath                  | Purpose                            | Most-used here                                                                                                                                                                                                                                                                |
| ------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `./hooks`                | 13 hooks                           | `useTranslation` (by far the most), `useNotificationsStore`, `useDownload`, `useTheme` + `Theme`, `useInterval`, `useOnClickOutside`, `useMediaQuery`, `useWindowSize`, `useEventListener`                                                                                    |
| `./components`           | 40 UI components                   | `Button`, `Heading`, `Dialog`, `Card`, `Form`, `Label`, `Spinner`, `Select`, `ThemeToggle`, `LanguageToggle`, `Input`, `Tooltip`, `DataTable`, `Sheet`, `Separator`, `Checkbox`, `ListboxDropdown`, `DropdownMenu`, `Tabs`, `Table`, `SearchBar`, `Popover`, `ActionDropdown` |
| `./utils`                | Small helpers                      | `cn()` — the only one used here                                                                                                                                                                                                                                               |
| `./i18n`                 | Translator instance and i18n types | `i18n`, `Language`                                                                                                                                                                                                                                                            |
| `./providers`            | App-level context providers        | `CoreProvider`                                                                                                                                                                                                                                                                |
| `./tailwind/globals.css` | Base Tailwind stylesheet           | imported once per app-level stylesheet                                                                                                                                                                                                                                        |

30 of the 40 components are in use. Available but currently unused: components `Badge`, `ComboBox`, `CopyButton`, `DatePicker`, `DropdownButton`, `InputGroup`, `OneTimePasswordInput`, `ScrollArea`, `Slider`; hooks `useStorage`, `useDestructiveAction`, `useEventCallback`, `useIsomorphicLayoutEffect`. Reach for one of these before building an equivalent.

## Common patterns in this repo

### Translation — this is a hard rule

Every user-facing string must go through `useTranslation`. Prefer an inline `t({ en, es, fr })` unless the string is used in more than one place, in which case add it to a namespaced translation JSON file:

```tsx
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

const { t } = useTranslation(); // inline strings
const { t } = useTranslation('datahub'); // scoped to a translation namespace

<Button>{t({ en: 'Accept', es: 'Aceptar', fr: 'Accepter' })}</Button>;
```

**Every interface language needs an entry.** A missing one resolves to English silently, so
`requireCompleteTranslations` is declared for `apps/web`, `apps/gateway` and `packages/react-core`
(`packages/react-core/src/complete-translations.d.ts` and each app's `src/services/i18n.ts`), which
makes an incomplete `t({ … })` a type error caught by `pnpm lint`. `apps/playground` is deliberately
outside that opt-in — its language selector offers only English and French.

`useTranslation` also returns `resolvedLanguage` when you need the active locale.

### Typing i18n to this app (`apps/web/src/services/i18n.ts`)

Languages and translation namespaces are declared by augmenting the `UserConfig` namespace. Add a namespace here when you add a translation JSON file:

```ts
import { i18n } from '@douglasneuroinformatics/libui/i18n';

declare module '@douglasneuroinformatics/libui/i18n' {
  export namespace UserConfig {
    export interface LanguageOptions {
      en: true;
      fr: true;
    }
    export interface Translations {
      common: typeof common; /* ... */
    }
  }
}
```

### Provider and stylesheet

`CoreProvider` wraps each app root — `apps/web/src/routes/__root.tsx`, `apps/gateway/src/Root.tsx`, `apps/playground/src/App.tsx`. The base stylesheet is imported by `packages/react-core/src/globals.css` and `apps/outreach/src/styles/main.css`:

```css
@import '@douglasneuroinformatics/libui/tailwind/globals.css';
```

### Components and class merging

```tsx
import { Button } from '@douglasneuroinformatics/libui/components';
import type { ButtonProps } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
```

`packages/react-core` builds shared components on top of libui primitives — its own `CopyButton` wraps libui's `Button`, and `Branding` uses `cn()`. Check there before wrapping a primitive again in an app.

### Notifications

`useNotificationsStore()` is the app-wide notification channel (~40 call sites); use it instead of a local toast state.

## Reading the source

Publishes `src` alongside `dist` — 218 `.tsx` and 46 `.ts` files of original source, one directory per component. Read it for exact prop types and variants, since the Storybook site does not cover everything:

```sh
ls  apps/web/node_modules/@douglasneuroinformatics/libui/src/components          # one dir per component
cat apps/web/node_modules/@douglasneuroinformatics/libui/src/components/Button/Button.tsx
ls  apps/web/node_modules/@douglasneuroinformatics/libui/src/hooks              # full hook list
cat apps/web/node_modules/@douglasneuroinformatics/libui/src/utils/index.ts
```

Also resolvable from `apps/gateway`, `apps/playground`, `apps/outreach`, `packages/react-core`, `packages/serve-instrument`, and `storybook`.

## Docs

https://douglasneuroinformatics.github.io/libui (Storybook — component docs are published there, not via typedoc)
