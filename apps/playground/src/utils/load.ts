import type JSZip from 'jszip';

import type { EditorFile } from '@/models/editor-file.model';

import { isBase64EncodedFileType } from './file';

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return reject(
          new Error(`Failed to load blob: unexpected type of FileReader result '${typeof result}', expected 'string'`)
        );
      }
      resolve(result.replace('data:', '').replace(/^.+,/, ''));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function loadAssetAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return blobToBase64(blob);
}

export async function loadNativeFileContent(file: File): Promise<string> {
  let content: string;
  if (isBase64EncodedFileType(file.name)) {
    content = await blobToBase64(file);
  } else {
    content = await file.text();
  }
  return content;
}

export async function loadEditorFilesFromNative(files: File[]) {
  const editorFiles: EditorFile[] = [];
  for (const file of files) {
    editorFiles.push({
      content: await loadNativeFileContent(file),
      name: file.name
    });
  }
  return editorFiles;
}

export async function loadEditorFilesFromZip(zip: JSZip) {
  const editorFiles: EditorFile[] = [];
  for (const file of Object.values(zip.files)) {
    let content: string;
    const isBase64 = isBase64EncodedFileType(file.name);
    if (isBase64) {
      content = await file.async('base64');
    } else {
      content = await file.async('string');
    }
    editorFiles.push({
      content,
      name: file.name
    });
  }
  return editorFiles;
}
