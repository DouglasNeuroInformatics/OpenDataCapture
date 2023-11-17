import { useRef } from 'react';

import { cn, useTheme } from '@douglasneuroinformatics/ui';
import MonacoEditor from '@monaco-editor/react';

import './setup';

import type { EditorFile, MonacoEditorType, MonacoType } from './types';

export type EditorPaneProps = {
  className?: string;
  defaultValue: string;
  onSave?: (file: EditorFile) => void;
  path: string;
};

export const EditorPane = ({ className, defaultValue, path }: EditorPaneProps) => {
  const [theme] = useTheme();

  const editorRef = useRef<MonacoEditorType | null>(null);
  const monacoRef = useRef<MonacoType | null>(null);

  const handleEditorDidMount = (editor: MonacoEditorType, monaco: MonacoType) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
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
};
