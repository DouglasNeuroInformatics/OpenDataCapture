import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettier from 'prettier/standalone';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  }
};

loader.config({ monaco });

var libSource = [
  'declare class Facts {',
  '    /**',
  '     * Returns the next fact',
  '     */',
  '    static next():string',
  '}'
].join('\n');
var libUri = 'ts:filename/facts.d.ts';

void loader.init().then((monaco) => {
  /**
   * Setup the TypeScript compiler options as similarly as possible to
   * the  project setup. This is limited by an absence of modern options
   * (e.g., module resolution) in the monaco enum options.
   */
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    newLine: monaco.languages.typescript.NewLineKind.LineFeed,
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ES2020
  });

  /**
   * Add libraries
   */
  monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, libUri);
  monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));

  /**
   * Define custom light and dark themes for the editor
   */
  monaco.editor.defineTheme('odc-light', {
    base: 'vs',
    colors: {
      'editor.background': '#F8FAFC'
    },
    inherit: true,
    rules: []
  });

  monaco.editor.defineTheme('odc-dark', {
    base: 'vs-dark',
    colors: {
      'editor.background': '#1E313B'
    },
    inherit: true,
    rules: []
  });

  /**
   * Configure the monaco instance to use prettier as the document formatter.
   * The keyboard shortcut to format the document is set to Alt + F.
   */
  monaco.editor.addKeybindingRule({
    command: 'editor.action.formatDocument',
    keybinding: monaco.KeyMod.Alt | monaco.KeyCode.KeyF
  });
  monaco.languages.registerDocumentFormattingEditProvider('typescript', {
    async provideDocumentFormattingEdits(model) {
      const range = model.getFullModelRange();
      const value = model.getValue();
      const text = await prettier.format(value, {
        parser: 'babel-ts',
        plugins: [prettierPluginBabel, prettierPluginEstree],
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'none'
      });
      return [{ range, text }];
    }
  });

  // Other
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
});
