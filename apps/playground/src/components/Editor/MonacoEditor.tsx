import { useEffect, useRef } from 'react';

import * as monaco from 'monaco-editor';

import type { MonacoEditorType, MonacoType } from './types';

const viewStates = new WeakMap<monaco.editor.ITextModel, monaco.editor.ICodeEditorViewState | null>();

const saveViewState = (editor: MonacoEditorType) => {
  const model = editor.getModel();
  if (model) {
    viewStates.set(model, editor.saveViewState());
  }
};

const getOrCreateModel = (path: string, defaultValue: string, defaultLanguage: string) => {
  const uri = monaco.Uri.parse(path);
  return monaco.editor.getModel(uri) ?? monaco.editor.createModel(defaultValue, defaultLanguage, uri);
};

export type MonacoEditorProps = {
  className?: string;
  defaultLanguage: string;
  defaultValue: string;
  onChange: (value: string) => void;
  onMount: (editor: MonacoEditorType, monaco: MonacoType) => void;
  options: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions;
  path: string;
  theme: string;
};

/**
 * Shows the model of `path`, creating it from `defaultValue` the first time. Models are never disposed
 * here, so a file keeps its content and undo history when the editor switches away or unmounts.
 */
export const MonacoEditor = ({
  className,
  defaultLanguage,
  defaultValue,
  onChange,
  onMount,
  options,
  path,
  theme
}: MonacoEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoEditorType | null>(null);

  useEffect(() => {
    const editor = monaco.editor.create(containerRef.current!, { ...options, model: null });
    editorRef.current = editor;
    return () => {
      saveViewState(editor);
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current!;
    saveViewState(editor);
    const model = getOrCreateModel(path, defaultValue, defaultLanguage);
    editor.setModel(model);
    editor.restoreViewState(viewStates.get(model) ?? null);
  }, [path]);

  useEffect(() => {
    onMount(editorRef.current!, monaco);
  }, []);

  useEffect(() => {
    editorRef.current!.updateOptions(options);
  }, [options]);

  useEffect(() => {
    monaco.editor.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    const editor = editorRef.current!;
    const subscription = editor.onDidChangeModelContent(() => onChange(editor.getValue()));
    return () => subscription.dispose();
  }, [onChange]);

  return <div className={className} ref={containerRef} />;
};
