export type Monaco = typeof import('monaco-editor');

export type EditorModel = import('monaco-editor').editor.IModel;

/**
 * A TypeScript source file to be displayed in the editor
 *
 * @example
 * ```
 * const file: EditorFile = {
 *   content: 'console.log("hello world")',
 *   filename: 'hello.ts'
 * };
 * ```
 */
export type EditorFile = {
  content: string;
  filename: string;
};
