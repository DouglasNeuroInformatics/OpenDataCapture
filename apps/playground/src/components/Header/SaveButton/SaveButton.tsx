import React, { useState } from 'react';

import { useInterval } from '@douglasneuroinformatics/libui/hooks';
import { isEqual } from 'lodash-es';
import { SaveIcon } from 'lucide-react';

import { useEditorFilesRef } from '@/hooks/useEditorFilesRef';
import { useAppStore } from '@/store';

import { ActionButton } from '../ActionButton';

export const SaveButton = () => {
  const [disabled, setDisabled] = useState(true);
  const editorFiles = useEditorFilesRef();
  const selectedInstrument = useAppStore((store) => store.selectedInstrument);
  const updateSelectedInstrument = useAppStore((store) => store.updateSelectedInstrument);

  useInterval(() => {
    if (selectedInstrument.category === 'Saved') {
      setDisabled(isEqual(editorFiles.current, selectedInstrument.files));
    }
  }, 1000);

  return (
    <ActionButton
      disabled={disabled}
      icon={<SaveIcon />}
      tooltip="Save"
      onClick={() => {
        updateSelectedInstrument({ files: editorFiles.current });
      }}
    />
  );
};
