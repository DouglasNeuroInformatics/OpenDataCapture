/* eslint-disable @typescript-eslint/consistent-type-definitions -- Window is augmented by declaration merging, which needs an interface */

declare global {
  interface Window {
    message: string;
  }
}

export {};
