/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />
/// <reference types="@opendatacapture/i18next/client" />

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface GlobalEventHandlersEventMap {
    done: CustomEvent;
  }
}

export * from './components/InstrumentRenderer';
export * from './hooks/useInterpretedInstrument';
