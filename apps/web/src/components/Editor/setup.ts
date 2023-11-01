import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import reactDeclarations from '../../../../../node_modules/@types/react/index.d.ts?raw';
import zodTypes from '../../../../../node_modules/zod/index.d.ts?raw';
import commonDeclarations from '../../../../../packages/common/dist/index.d.ts?raw';
import { MonacoConfigurer } from './config';

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

const configurer = new MonacoConfigurer(monaco);
configurer.configure({
  libraries: [
    {
      content: reactDeclarations,
      path: 'ts:filename/react.d.ts'
    },
    {
      content: commonDeclarations,
      path: 'ts:filename/common.d.ts'
    },
    {
      content: zodTypes,
      path: 'ts:filename/node_modules/zod/zod.d.ts'
    }
  ]
});
