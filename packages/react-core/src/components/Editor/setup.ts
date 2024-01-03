import { loader } from '@monaco-editor/react';
import coreTypes from '@open-data-capture/runtime-v0.0.1/dist/core.d.ts?raw';
import reactTypes from '@open-data-capture/runtime-v0.0.1/dist/react.d.ts?raw';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

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
        content: coreTypes,
        path: 'core.d.ts'
      },
      {
        content: reactTypes,
        path: '@types/react.d.ts'
      }
    ]
  });
});
