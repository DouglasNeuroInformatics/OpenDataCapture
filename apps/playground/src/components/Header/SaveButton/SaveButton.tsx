import { useState } from 'react';

import { useInterval, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { isEqual } from 'lodash-es';
import { SaveIcon } from 'lucide-react';

import { useFilesRef } from '@/hooks/useFilesRef';
import { useAppStore } from '@/store';

import { ActionButton } from '../ActionButton';

export const SaveButton = () => {
  const [disabled, setDisabled] = useState(true);
  const editorFiles = useFilesRef();
  const selectedInstrument = useAppStore((store) => store.selectedInstrument);
  const updateSelectedInstrument = useAppStore((store) => store.updateSelectedInstrument);

  useInterval(() => {
    if (selectedInstrument.category === 'Saved') {
      setDisabled(isEqual(editorFiles.current, selectedInstrument.files));
    }
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
