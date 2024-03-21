import React, { useImperativeHandle, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/ui/hooks';
import { cn } from '@douglasneuroinformatics/ui/utils';
import MonacoEditor from '@monaco-editor/react';

import type { EditorFile, MonacoEditorType, MonacoType } from '../types';

import '../setup';

export type EditorPaneRef = {
  editor: MonacoEditorType | null;
  monaco: MonacoType | null;
};

export type EditorPaneProps = {
  className?: string;
  defaultValue: string;
  onMount?: () => void;
  onSave?: (file: EditorFile) => void;
  path: string;
};

export const EditorPane = React.forwardRef<EditorPaneRef, EditorPaneProps>(function EditorPane(
  { className, defaultValue, onMount, path },
  ref
) {
  const [theme] = useTheme();
  const [isEditorMounted, setIsEditorMounted] = useState(false);

  const editorRef = useRef<MonacoEditorType | null>(null);
  const monacoRef = useRef<MonacoType | null>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        editor: editorRef.current,
        monaco: monacoRef.current
      };
    },
    [isEditorMounted]
  );

  const handleEditorDidMount = (editor: MonacoEditorType, monaco: MonacoType) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsEditorMounted(true);
    onMount?.();
  };

  return (
    <MonacoEditor
      className={cn('h-full min-h-[576px]', className)}
      defaultLanguage="typescript"
      defaultValue={defaultValue}
      options={{
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        scrollBeyondLastLine: false,
        tabSize: 2
      }}
      path={path}
      theme={`odc-${theme}`}
      onMount={handleEditorDidMount}
    />
  );
});
