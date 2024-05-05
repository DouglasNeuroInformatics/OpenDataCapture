import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import MonacoEditor from '@monaco-editor/react';

import { useFilesRef } from '@/hooks/useFilesRef';
import { useRuntime } from '@/hooks/useRuntime';
import type { EditorFile } from '@/models/editor-file.model';
import { useAppStore } from '@/store';
import { getImageMIMEType, inferFileType, isBase64EncodedFileType } from '@/utils/file';

import { EditorPanePlaceholder } from './EditorPanePlaceholder';

import type { MonacoEditorType, MonacoType } from './types';

export const EditorPane = () => {
  const selectedFilename = useAppStore((store) => store.selectedFilename);
  const setSelectedFileContent = useAppStore((store) => store.setSelectedFileContent);
  const selectedInstrumentId = useAppStore((store) => store.selectedInstrument.id);

  const [theme] = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { libs } = useRuntime('v1');

  const editorRef = useRef<MonacoEditorType | null>(null);
  const monacoRef = useRef<MonacoType | null>(null);

  const [defaultFile, setDefaultFile] = useState<({ id: string } & EditorFile) | null>(null);
  const filesRef = useFilesRef();

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
    const selectedFile = filesRef.current.find((file) => file.name === selectedFilename);
    if (!selectedFilename) {
      return;
    } else if (!selectedFile) {
      console.error(
        `Failed to find selected filename '${selectedFilename}' from files: ${filesRef.current.map((file) => `'${file.name}'`).join(', ')}`
      );
      return;
    }
    setDefaultFile({
      content: selectedFile.content,
      id: `${selectedInstrumentId}-${selectedFilename}`,
      name: selectedFilename
    });
  }, [selectedFilename, selectedInstrumentId]);

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) {
      return;
    }
    const files = filesRef.current;
    for (const file of files) {
      const fileType = inferFileType(file.name);
      if (!(fileType === 'javascript' || fileType === 'typescript')) {
        continue;
      }
      const uri = monaco.Uri.parse(file.name);
      if (monaco.editor.getModel(uri)) {
        continue;
      } else if (fileType === 'typescript') {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(file.content, file.name);
        monaco.editor.createModel(file.content, 'typescript', uri);
      } else if (fileType === 'javascript') {
        monaco.editor.createModel(file.content, 'javascript', uri);
      }
    }
    return () => {
      monaco.editor.getModels().forEach((model) => model.dispose());
    };
  }, [isMounted, selectedInstrumentId]);

  const handleEditorDidMount = (editor: MonacoEditorType, monaco: MonacoType) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsMounted(true);
  };

  if (!defaultFile) {
    return <EditorPanePlaceholder>No File Selected</EditorPanePlaceholder>;
  }

  const fileType = inferFileType(defaultFile.name);
  if (!fileType) {
    return <EditorPanePlaceholder>{`Error: Invalid file type "${fileType}"`}</EditorPanePlaceholder>;
  } else if (fileType === 'asset') {
    if (isBase64EncodedFileType(defaultFile.name)) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <img
            alt={`Rendering of ${defaultFile.name}`}
            className="h-auto max-w-96"
            src={`data:${getImageMIMEType(defaultFile.name)};base64,${defaultFile.content}`}
          />
        </div>
      );
    }
    return <EditorPanePlaceholder>Cannot Display Binary Asset</EditorPanePlaceholder>;
  }

  return (
    <MonacoEditor
      className="h-full min-h-[576px]"
      defaultLanguage={fileType satisfies 'css' | 'html' | 'javascript' | 'typescript'}
      defaultValue={defaultFile.content}
      keepCurrentModel={true}
      key={defaultFile.id}
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
      path={defaultFile.name}
      theme={`odc-${theme}`}
      onChange={(value) => {
        setSelectedFileContent(value ?? '');
      }}
      onMount={handleEditorDidMount}
    />
  );
};
