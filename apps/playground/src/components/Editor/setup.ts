import { loader } from '@monaco-editor/react';
import envTypes from '@opendatacapture/instrument-runtime-env/lib/index.d.ts?raw';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import TypeScriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { SuggestAdapter } from 'monaco-editor/esm/vs/language/typescript/tsMode';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettier from 'prettier/standalone';

import type { CompletionItemProvider } from './types';

class TypeScriptSuggestAdapter extends SuggestAdapter implements CompletionItemProvider {
  triggerCharacters = ['.', '"', "'"];
}

console.log(envTypes);

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new TypeScriptWorker();
    } else if (label === 'css' || label === 'scss' || label === 'less') {
      return new CssWorker();
    }
    return new EditorWorker();
  }
};

loader.config({ monaco });

{
  const monaco = await loader.init();

  monaco.languages.typescript.typescriptDefaults.setModeConfiguration({
    codeActions: true,
    completionItems: false,
    definitions: true,
    diagnostics: true,
    documentHighlights: true,
    documentRangeFormattingEdits: true,
    documentSymbols: true,
    hovers: true,
    inlayHints: true,
    onTypeFormattingEdits: true,
    references: true,
    rename: true,
    signatureHelp: true
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  monaco.languages.onLanguage('typescript', async () => {
    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    monaco.languages.registerCompletionItemProvider('typescript', new TypeScriptSuggestAdapter(worker));
  });

  /**
   * Setup the TypeScript compiler options as similarly as possible to
   * the  project setup. This is limited by an absence of modern options
   * (e.g., module resolution) in the monaco enum options.
   */
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowSyntheticDefaultImports: false,
    jsx: monaco.languages.typescript.JsxEmit.React,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    newLine: monaco.languages.typescript.NewLineKind.LineFeed,
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ES2020
  });

  /**
   * Define custom light and dark themes for the editor
   */
  monaco.editor.defineTheme('odc-light', {
    base: 'vs',
    colors: {
      // slate-50
      'editor.background': '#F8FAFC'
    },
    inherit: true,
    rules: []
  });

  monaco.editor.defineTheme('odc-dark', {
    base: 'vs-dark',
    colors: {
      // slate-800
      'editor.background': '#1E293B'
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

  const uri = monaco.Uri.parse('globals.d.ts');
  monaco.languages.typescript.typescriptDefaults.addExtraLib(envTypes, 'globals.d.ts');
  monaco.editor.createModel(envTypes, 'typescript', uri);
}
