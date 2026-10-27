import { useState } from 'react';

import { useInterval, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { SaveIcon } from 'lucide-react';

import { useFilesRef } from '@/hooks/useFilesRef';
import { useAppStore } from '@/store';

import { ActionButton } from '../ActionButton';
import { isSaveDisabled } from './is-save-disabled';

export const SaveButton = () => {
  const [disabled, setDisabled] = useState(true);
  const editorFiles = useFilesRef();
  const selectedInstrument = useAppStore((store) => store.selectedInstrument);
  const updateSelectedInstrument = useAppStore((store) => store.updateSelectedInstrument);

  useInterval(() => {
    setDisabled(isSaveDisabled(selectedInstrument, editorFiles.current));
  }, 1000);

  const { t } = useTranslation();

  return (
    <ActionButton
      disabled={disabled}
      icon={<SaveIcon />}
      tooltip={t({ en: 'Save', fr: 'Enregistrer' })}
      onClick={() => {
        updateSelectedInstrument({ files: editorFiles.current });
      }}
    />
  );
};
