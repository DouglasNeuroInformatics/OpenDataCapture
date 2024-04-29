import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import MonacoEditor from '@monaco-editor/react';
import { useStoreWithEqualityFn } from 'zustand/traditional';

import { useRuntime } from '@/hooks/useRuntime';
import { useEditorStore } from '@/store/editor.store';
import { inferFileType } from '@/utils/file';

import { EditorPanePlaceholder } from './EditorPanePlaceholder';

import type { MonacoEditorType, MonacoType } from './types';

export const EditorPane = () => {
  const selectedFile = useStoreWithEqualityFn(
    useEditorStore,
    (store) => store.selectedFile,
    (a, b) => a?.id === b?.id
  );
  const files = useEditorStore((store) => store.files);
  const setSelectedFileContent = useEditorStore((store) => store.setSelectedFileContent);

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
        monaco.editor.createModel(libs[filename], 'typescript', uri);
      }
    });
  }, [isMounted, libs]);

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!(monaco && isMounted)) {
      return;
    }
    for (const file of files) {
      const fileType = inferFileType(file.name);
      // if (!(fileType === 'javascript' || fileType === 'typescript')) {
      //   continue;
      // }
      if (fileType !== 'typescript') {
        continue;
      }
      const uri = monaco.Uri.parse(file.name);
      if (!monaco.editor.getModel(uri)) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(file.content, file.name);
        monaco.editor.createModel(file.content, 'typescript', uri);
      }
    }
  }, [isMounted, files]);

  const handleEditorDidMount = (editor: MonacoEditorType, monaco: MonacoType) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsMounted(true);
  };

  const fileType = selectedFile ? inferFileType(selectedFile.name) : null;
  if (!fileType) {
    return <EditorPanePlaceholder>{`Error: Invalid file type "${fileType}"`}</EditorPanePlaceholder>;
  } else if (fileType === 'asset') {
    return <EditorPanePlaceholder>Cannot Display Binary Asset</EditorPanePlaceholder>;
  }

  return (
    <MonacoEditor
      className="h-full min-h-[576px]"
      defaultLanguage={fileType satisfies 'css' | 'html' | 'javascript' | 'typescript'}
      defaultValue={selectedFile?.content}
      key={selectedFile?.id}
      options={{
        automaticLayout: true,
        codeLens: false,
        contextmenu: false,
        fixedOverflowWidgets: true,
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
        setSelectedFileContent(value ?? '');
      }}
      onMount={handleEditorDidMount}
    />
  );
};
