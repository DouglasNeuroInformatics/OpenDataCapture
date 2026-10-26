// @vitest-environment happy-dom

import { cleanup, render } from '@testing-library/react';
import * as monaco from 'monaco-editor';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MonacoEditor } from '../MonacoEditor';

import type { MonacoEditorProps } from '../MonacoEditor';
import type { MonacoEditorType } from '../types';

type FakeModel = { dispose: () => void; language: string; uri: string; value: string };

const fakeMonaco = vi.hoisted(() => {
  const models = new Map<string, FakeModel>();

  const createFakeEditor = () => {
    let model: FakeModel | null = null;
    const contentListeners = new Set<() => void>();
    return {
      dispose: vi.fn(),
      getModel: () => model,
      getValue: () => model!.value,
      onDidChangeModelContent: (listener: () => void) => {
        contentListeners.add(listener);
        return { dispose: () => contentListeners.delete(listener) };
      },
      restoreViewState: vi.fn(),
      saveViewState: () => ({ savedFrom: model!.uri }),
      setModel: vi.fn((nextModel: FakeModel) => {
        model = nextModel;
      }),
      type: (value: string) => {
        model!.value = value;
        contentListeners.forEach((listener) => listener());
      },
      updateOptions: vi.fn()
    };
  };

  return {
    createFakeEditor,
    editor: {
      create: vi.fn((_container: HTMLElement, _options: object) => createFakeEditor()),
      createModel: vi.fn((value: string, language: string, uri: string): FakeModel => {
        const model = { dispose: vi.fn(), language, uri, value };
        models.set(uri, model);
        return model;
      }),
      getModel: (uri: string) => models.get(uri) ?? null,
      setTheme: vi.fn()
    },
    models,
    Uri: { parse: (path: string) => path }
  };
});

vi.mock('monaco-editor', () => ({ editor: fakeMonaco.editor, Uri: fakeMonaco.Uri }));

type FakeEditor = ReturnType<typeof fakeMonaco.createFakeEditor>;

const defaultProps: MonacoEditorProps = {
  defaultLanguage: 'typescript',
  defaultValue: 'export {};',
  onChange: vi.fn(),
  onMount: vi.fn(),
  options: { tabSize: 2 },
  path: 'index.ts',
  theme: 'odc-light'
};

const renderEditor = (props: Partial<MonacoEditorProps> = {}) => {
  const view = render(<MonacoEditor {...defaultProps} {...props} />);
  const editor = fakeMonaco.editor.create.mock.results.at(-1)!.value as FakeEditor;
  const rerender = (nextProps: Partial<MonacoEditorProps>) => {
    view.rerender(<MonacoEditor {...defaultProps} {...props} {...nextProps} />);
  };
  return { editor, rerender, unmount: view.unmount };
};

describe('MonacoEditor', () => {
  beforeEach(() => {
    fakeMonaco.models.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should create the model of a new path from the default value, in the default language', () => {
    const { editor } = renderEditor();
    expect(fakeMonaco.editor.createModel).toHaveBeenCalledExactlyOnceWith('export {};', 'typescript', 'index.ts');
    expect(editor.getModel()).toBe(fakeMonaco.models.get('index.ts'));
  });

  it('should reuse the model a path already has, so the file keeps its content and undo history', () => {
    const existingModel = fakeMonaco.editor.createModel('const x = 1;', 'typescript', 'index.ts');
    fakeMonaco.editor.createModel.mockClear();
    const { editor } = renderEditor();
    expect(fakeMonaco.editor.createModel).not.toHaveBeenCalled();
    expect(editor.getModel()).toBe(existingModel);
  });

  it('should swap the editor to the model of the new path when the path changes', () => {
    const { editor, rerender } = renderEditor();
    rerender({ defaultLanguage: 'css', defaultValue: 'body {}', path: 'styles.css' });
    expect(fakeMonaco.editor.create).toHaveBeenCalledOnce();
    expect(editor.getModel()).toMatchObject({ language: 'css', uri: 'styles.css', value: 'body {}' });
  });

  it('should restore the view state a model had when its file was last shown', () => {
    const { editor, rerender } = renderEditor();
    rerender({ path: 'other.ts' });
    rerender({ path: 'index.ts' });
    expect(editor.restoreViewState).toHaveBeenLastCalledWith({ savedFrom: 'index.ts' });
  });

  it('should never dispose a model, neither on a path change nor on unmount', () => {
    const { rerender, unmount } = renderEditor();
    rerender({ path: 'other.ts' });
    unmount();
    fakeMonaco.models.forEach((model) => expect(model.dispose).not.toHaveBeenCalled());
  });

  it('should create the editor with the options and update it when they change', () => {
    const { editor, rerender } = renderEditor();
    expect(fakeMonaco.editor.create).toHaveBeenCalledWith(expect.any(HTMLDivElement), { model: null, tabSize: 2 });
    rerender({ options: { tabSize: 4 } });
    expect(editor.updateOptions).toHaveBeenLastCalledWith({ tabSize: 4 });
  });

  it('should set the theme, and set it again when it changes', () => {
    const { rerender } = renderEditor();
    expect(fakeMonaco.editor.setTheme).toHaveBeenLastCalledWith('odc-light');
    rerender({ theme: 'odc-dark' });
    expect(fakeMonaco.editor.setTheme).toHaveBeenLastCalledWith('odc-dark');
  });

  it('should call onMount once, with the editor already showing its model', () => {
    const onMount = vi.fn((editor: MonacoEditorType) => expect(editor.getModel()).not.toBeNull());
    const { editor, rerender } = renderEditor({ onMount });
    rerender({ options: { tabSize: 4 }, path: 'other.ts' });
    expect(onMount).toHaveBeenCalledExactlyOnceWith(editor, monaco);
  });

  it('should pass the content to the latest onChange on every edit', () => {
    const onChange = vi.fn();
    const { editor, rerender } = renderEditor();
    rerender({ onChange });
    editor.type('export const x = 1;');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('export const x = 1;');
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('should dispose the editor on unmount', () => {
    const { editor, unmount } = renderEditor();
    unmount();
    expect(editor.dispose).toHaveBeenCalledOnce();
  });
});
