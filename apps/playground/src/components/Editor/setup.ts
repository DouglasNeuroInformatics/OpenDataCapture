import envTypes from '@opendatacapture/runtime-v1/env?raw';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/languages/features/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/languages/features/html/html.worker?worker';
import JsonWorker from 'monaco-editor/languages/features/json/json.worker?worker';
import TypeScriptWorker from 'monaco-editor/languages/features/typescript/ts.worker?worker';
import { SuggestAdapter } from 'monaco-editor/languages/features/typescript/tsMode';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettier from 'prettier/standalone';

import type { CompletionItemProvider } from './types';

class TypeScriptSuggestAdapter extends SuggestAdapter implements CompletionItemProvider {
  override triggerCharacters = ['.', '"', "'"];
}

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new TypeScriptWorker();
    } else if (label === 'css') {
      return new CssWorker();
    } else if (label === 'json') {
      return new JsonWorker();
    } else if (label === 'html') {
      return new HtmlWorker();
    }
    return new EditorWorker();
  }
};

const defaults: monaco.typescript.ModeConfiguration = {
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
};

monaco.typescript.javascriptDefaults.setModeConfiguration(defaults);
monaco.typescript.typescriptDefaults.setModeConfiguration(defaults);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
monaco.languages.onLanguage('typescript', async () => {
  const worker = await monaco.typescript.getTypeScriptWorker();
  monaco.languages.registerCompletionItemProvider('typescript', new TypeScriptSuggestAdapter(worker));
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
monaco.languages.onLanguage('javascript', async () => {
  const worker = await monaco.typescript.getJavaScriptWorker();
  monaco.languages.registerCompletionItemProvider('javascript', new TypeScriptSuggestAdapter(worker));
});

/**
 * Setup the TypeScript compiler options as similarly as possible to
 * the  project setup. This is limited by an absence of modern options
 * (e.g., module resolution) in the monaco enum options.
 */

const baseTypeScriptOptions: monaco.typescript.CompilerOptions = {
  allowJs: true,
  allowSyntheticDefaultImports: false,
  checkJs: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
  jsx: monaco.typescript.JsxEmit.ReactJSX,
  jsxImportSource: '/runtime/v1/react@19.x',
  module: monaco.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
  newLine: monaco.typescript.NewLineKind.LineFeed,
  strict: false,
  target: monaco.typescript.ScriptTarget.ES2020
};

monaco.typescript.javascriptDefaults.setCompilerOptions(baseTypeScriptOptions);
monaco.typescript.typescriptDefaults.setCompilerOptions({
  ...baseTypeScriptOptions,
  allowImportingTsExtensions: true,
  strict: true
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

const documentFormattingEditProvider: monaco.languages.DocumentFormattingEditProvider = {
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
};

monaco.languages.registerDocumentFormattingEditProvider('javascript', documentFormattingEditProvider);
monaco.languages.registerDocumentFormattingEditProvider('typescript', documentFormattingEditProvider);

// Other
monaco.typescript.typescriptDefaults.setEagerModelSync(true);

const uri = monaco.Uri.parse('globals.d.ts');

monaco.typescript.typescriptDefaults.addExtraLib(envTypes, 'globals.d.ts');
monaco.editor.createModel(envTypes, 'typescript', uri);
