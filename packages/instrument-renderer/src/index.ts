import type { Theme } from '@douglasneuroinformatics/libui/hooks';
import type { Json, Language } from '@opendatacapture/runtime-core';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface GlobalEventHandlersEventMap {
    changeLanguage: CustomEvent<Language>;
    changeTheme: CustomEvent<Theme>;
    done: CustomEvent<Json>;
  }
}

export { InstrumentRenderer, type InstrumentRendererProps } from './components/InstrumentRenderer';
