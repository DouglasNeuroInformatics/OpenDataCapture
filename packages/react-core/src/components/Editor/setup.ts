import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import types from '../../../../instruments/dist/lib.d.ts?raw';
import { MonacoConfigurer } from './config';

self.MonacoEnvironment = {
  getWorker(_, label) {
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

loader.config({ monaco });

void loader.init().then((monaco) => {
  const configurer = new MonacoConfigurer(monaco);
  configurer.configure({
    libraries: [
      {
        content: types,
        path: 'index.d.ts'
      },
      {
        content: `
          declare module 'foo' {
            export const foo: string;
          }
        `,
        path: 'typings/lib.d.ts'
      }
    ]
  });
});
