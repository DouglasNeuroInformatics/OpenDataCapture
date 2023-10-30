import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

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
  //jsx: monaco.languages.typescript.JsxEmit.Preserve,
  strict: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext
});

// extra libraries
const libSource = [
	"declare class Facts {",
	"    /**",
	"     * Returns the next fact",
	"     */",
	"    static next():string",
	"}",
].join("\n");

const libUri = "ts:filename/facts.d.ts";

monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);

// When resolving definitions and references, the editor will try to use created models.
// Creating a model for the library allows "peek definition/references" commands to work with the library.
monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));

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
