import { useEffect, useRef, useState } from 'react';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const InstrumentEditor = () => {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl) {
      setEditor((editor) => {
        if (editor) return editor;

        return monaco.editor.create(monacoEl.current!, {
          language: 'typescript',
          value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n')
        });
      });
    }

    return () => editor?.dispose();
  }, [monacoEl.current]);

  return <div className="h-full w-full" ref={monacoEl}></div>;
};
