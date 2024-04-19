import type { EditorFile } from '@/models/editor-file.model';

export function resolveIndexFile(files: EditorFile[]): EditorFile {
  const extensions = ['.tsx', '.jsx', '.ts', '.js'];
  for (const extension of extensions) {
    const match = files.find((file) => file.name === `index` + extension);
    if (match) {
      return match;
    }
  }
  throw new Error(`Failed to resolve index from files: ${files.map((file) => `'${file.name}'`).join(', ')}`);
}
