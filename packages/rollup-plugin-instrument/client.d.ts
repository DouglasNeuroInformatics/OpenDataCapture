/* eslint-disable @typescript-eslint/consistent-type-definitions */

declare type InstrumentLibraryItem = {
  bundle: string;
  source: string;
};

declare module '*?instrument' {
  const content: InstrumentLibraryItem;
  export default content;
}

interface ImportMeta {
  encode: (filepath: string) => string;
}
