declare module 'monaco-editor/esm/vs/language/typescript/tsMode' {
  export class SuggestAdapter {
    triggerCharacters?: string[];
    constructor(worker: any): void;
    provideCompletionItems(...args: any[]): any;
    resolveCompletionItem?(...args: any[]): any;
  }
}
