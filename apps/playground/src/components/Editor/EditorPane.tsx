import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import MonacoEditor from '@monaco-editor/react';
import { useStoreWithEqualityFn } from 'zustand/traditional';

import { useRuntime } from '@/hooks/useRuntime';
import { useEditorStore } from '@/store/editor.store';

import type { MonacoEditorType, MonacoType } from './types';

export const EditorPane = () => {
  const { selectedFile, setSelectedFileValue } = useStoreWithEqualityFn(
    useEditorStore,
    ({ selectedFile, setSelectedFileValue }) => {
      return { selectedFile, setSelectedFileValue };
    },
    (a, b) => a.setSelectedFileValue === b.setSelectedFileValue && a.selectedFile?.id === b.selectedFile?.id
  );

  const [theme] = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { libs } = useRuntime('v1');

  const editorRef = useRef<MonacoEditorType | null>(null);
  const monacoRef = useRef<MonacoType | null>(null);

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!(monaco && isMounted)) {
      return;
    }
    Object.keys(libs).forEach((filename) => {
      const uri = monaco.Uri.parse(filename);
      if (!monaco.editor.getModel(uri)) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(libs[filename], filename);
        monaco.editor.createModel(libs[filename], 'typescript', monaco.Uri.parse(filename));
      }
    });
  }, [isMounted, libs]);

  const handleEditorDidMount = (editor: MonacoEditorType, monaco: MonacoType) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsMounted(true);
  };

  return (
    <MonacoEditor
      className="h-full min-h-[576px]"
      defaultLanguage={selectedFile?.language}
      defaultValue={selectedFile?.value}
      key={selectedFile?.id}
      options={{
        automaticLayout: true,
        codeLens: false,
        minimap: {
          enabled: false
        },
        quickSuggestions: true,
        quickSuggestionsDelay: 10,
        scrollBeyondLastLine: false,
        stickyScroll: {
          enabled: false
        },
        suggestOnTriggerCharacters: true,
        tabCompletion: 'on',
        tabSize: 2
      }}
      path={selectedFile?.name}
      theme={`odc-${theme}`}
      onChange={(value) => {
        setSelectedFileValue(value ?? '');
      }}
      onMount={handleEditorDidMount}
    />
  );
};
