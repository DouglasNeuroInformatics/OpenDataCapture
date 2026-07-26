# libui-form-types

Type declarations for a declarative form system. No runtime code — the package is a single `.d.ts`.

**Status in Open Data Capture:** a direct dependency of `packages/runtime-core`, which builds the `FormInstrument` type family on top of it (`src/types/instrument.form.ts`, `src/types/instrument.base.ts`). It also arrives transitively via `libui`, since `libui`'s `Form` component is typed against it.

Two versions coexist in the tree: the catalog pins `^0.15.0` for `runtime-core`, while `libui` depends on `^1.0.0`. The export names are identical apart from `FormBlock`, which only `1.0.0` has.

## When to reach for this

- **Authoring or changing an instrument's form schema:** don't import this directly. Use `@opendatacapture/runtime-core`'s `FormInstrument` types, which wrap these with instrument-specific concerns (multilingual fields, measures, UI options).
- **Working inside `runtime-core` itself,** or typing a component against `libui`'s `Form`: use these types instead of hand-writing ad hoc form field types.

## Key exports

Everything lives in a `FormTypes` namespace, available as a default import or as flattened named re-exports:

```ts
import type FormTypes from '@douglasneuroinformatics/libui-form-types';
import type { RecordArrayFieldValue } from '@douglasneuroinformatics/libui-form-types';
```

Namespace members (named aliases in parentheses where they differ):

- Field kinds: `StaticFieldKind`, `StaticScalarFieldKind`, `StaticCompositeFieldKind`
- Field values: `ScalarFieldValue`, `FieldsetValue`, `RecordArrayFieldValue`, `NumberRecordFieldValue`, `CompositeFieldValue`, `FieldValue` (`FormFieldValue`), `RequiredFieldValue`, `OptionalFieldValue`
- Field types: `BaseField` (`BaseFormField`), `FieldMixin` (`FormFieldMixin`), `StringField`, `NumberField`, `DateField`, `BooleanField`, `SetField`, `RecordArrayField`, `NumberRecordField`, `ScalarField`, `CompositeField`, `StaticField`, `DynamicField`, `UnknownField`
- Aggregates: `Fields` (`FormFields`), `StaticFields`, `FieldsGroup` (`FormFieldsGroup`), `Block` (`FormBlock`, 1.0.0 only), `Content` (`FormContent`), `Fieldset`
- Data shapes: `Data` (`FormDataType`), `RequiredData` (`RequiredFormDataType`), `PartialData` (`PartialFormDataType`), `PartialNullableData`

Illustrative, not exhaustive.

## Reading the source

The published file _is_ the source — one ~11 KB declaration file with no build step between it and you. Read it in full rather than guessing at a member name:

```sh
cat packages/runtime-core/node_modules/@douglasneuroinformatics/libui-form-types/lib/index.d.ts
```

## Docs

https://douglasneuroinformatics.github.io/libui-form-types — see also [libui.md](libui.md), whose `Form` component these types underpin.
