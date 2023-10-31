import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import reactDeclarations from '../../../../node_modules/@types/react/index.d.ts?raw';

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

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  //moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  strict: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext
});

const reactPath = 'ts:filename/react.d.ts';

monaco.languages.typescript.javascriptDefaults.addExtraLib(reactDeclarations, reactPath);
monaco.editor.createModel(reactDeclarations, 'typescript', monaco.Uri.parse(reactPath));

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

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

monaco.languages.registerDocumentFormattingEditProvider('typescript', {
  provideDocumentFormattingEdits(model, options, token) {
    const range = model.getFullModelRange();
    const text = model.getValue();
    console.log(text);
    return [
      {
        range,
        text
      }
    ];
  }
});
