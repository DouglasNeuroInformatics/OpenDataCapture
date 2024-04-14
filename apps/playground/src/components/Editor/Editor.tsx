import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import MonacoEditor from '@monaco-editor/react';

import { useRuntime } from '@/hooks/useRuntime';
import { useSourceRef } from '@/hooks/useSourceRef';
import { useInstrumentStore } from '@/store/instrument.store';

import type { MonacoEditorType, MonacoType } from './types';

import './setup';

export type EditorProps = {
  className?: string;
};

export const Editor = ({ className }: EditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [theme] = useTheme();
  const { libs } = useRuntime('v1');
  const { selectedInstrument } = useInstrumentStore();

  const editorRef = useRef<MonacoEditorType | null>(null);
  const monacoRef = useRef<MonacoType | null>(null);
  const sourceRef = useSourceRef();

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

  useEffect(() => {
    if (editorRef.current && selectedInstrument) {
      editorRef.current.setValue(selectedInstrument.source);
    }
  }, [selectedInstrument]);

  const handleEditorDidMount = (editor: MonacoEditorType, monaco: MonacoType) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsMounted(true);
  };

  return (
    <MonacoEditor
      className={cn('border', className)}
      defaultLanguage="typescript"
      defaultValue={selectedInstrument?.source ?? ''}
      options={{
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        scrollBeyondLastLine: false,
        tabSize: 2
      }}
      path={'index.ts'}
      theme={`odc-${theme}`}
      onChange={(value) => {
        sourceRef.current = value ?? '';
      }}
      onMount={handleEditorDidMount}
    />
  );
};
