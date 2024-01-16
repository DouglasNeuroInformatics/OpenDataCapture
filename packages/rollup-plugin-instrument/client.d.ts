declare type InstrumentLibraryItem = {
  bundle: string;
  source: string;
};

declare module '*?instrument' {
  const content: InstrumentLibraryItem;
  export default content;
}
