import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettier from 'prettier/standalone';

import reactDeclarations from '../../../../node_modules/@types/react/index.d.ts?raw';
import zodTypes from '../../../../node_modules/zod/index.d.ts?raw';

self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  }
};

function setCompilerOptions() {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext
  });
}

function addLibraries(libraries: { content: string; path: string }[]) {
  for (const lib of libraries) {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(lib.content, lib.path);
    monaco.editor.createModel(lib.content, 'typescript', monaco.Uri.parse(lib.path));
  }
}

function defineThemes() {
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
}

function setupESLint() {
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true
  });
}

setCompilerOptions();
defineThemes();
setupESLint();
addLibraries([
  {
    content: reactDeclarations,
    path: 'ts:filename/react.d.ts'
  },
  {
    content: 'declare const foo: string;',
    path: 'index.d.ts'
  },
  {
    content: zodTypes,
    path: 'ts:filename/node_modules/zod/zod.d.ts'
  }
]);

monaco.editor.addKeybindingRule({
  command: 'editor.action.formatDocument',
  keybinding: monaco.KeyMod.Alt | monaco.KeyCode.KeyF
});

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

monaco.languages.registerDocumentFormattingEditProvider('typescript', {
  async provideDocumentFormattingEdits(model) {
    const range = model.getFullModelRange();
    const value = model.getValue();
    console.log('Will format', value);

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
