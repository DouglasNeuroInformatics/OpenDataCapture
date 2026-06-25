/* eslint-disable @typescript-eslint/consistent-type-definitions */

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'cap-widget': {
        [key: string]: any;
        'data-cap-api-endpoint': string;
      };
    }
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    solve: CustomEvent<{ token: string }>;
  }
}

export {};
