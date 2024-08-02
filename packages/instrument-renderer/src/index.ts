declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface GlobalEventHandlersEventMap {
    done: CustomEvent;
  }
}

export { InstrumentRenderer, type InstrumentRendererProps } from './components/InstrumentRenderer';
