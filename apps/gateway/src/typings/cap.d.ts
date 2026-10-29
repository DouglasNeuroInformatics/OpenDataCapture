/* eslint-disable @typescript-eslint/consistent-type-definitions -- these augment React's JSX interfaces by declaration merging, which a type alias cannot do */

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
