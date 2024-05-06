import React, { useState } from 'react';

import { isPlainObject } from '@douglasneuroinformatics/libjs';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import JSZip from 'jszip';
import { UploadIcon } from 'lucide-react';

import { FileUploadDialog } from '@/components/FileUploadDialog';
import type { InstrumentRepository } from '@/models/instrument-repository.model';
import { useAppStore } from '@/store';
import { loadEditorFilesFromZip } from '@/utils/load';

import { ActionButton } from '../ActionButton';

export const UploadButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const addInstrument = useAppStore((store) => store.addInstrument);
  const setSelectedInstrument = useAppStore((store) => store.setSelectedInstrument);
  const instruments = useAppStore((store) => store.instruments);

  const handleSubmit = async (files: File[]) => {
    const zip = new JSZip() as { comment?: unknown } & JSZip;
    await zip.loadAsync(files[0]);
    let label: string;
    try {
      const comment = JSON.parse(String(zip.comment)) as unknown;
      if (isPlainObject(comment) && typeof comment.label === 'string') {
        label = comment.label;
      } else {
        label = 'Unlabeled';
      }
    } catch {
      label = 'Unlabeled';
    }
    let suffixNumber = 1;
    let uniqueLabel = label;
    while (instruments.find((instrument) => instrument.label === uniqueLabel)) {
      uniqueLabel = `${label} (${suffixNumber})`;
      suffixNumber++;
    }
    const item: InstrumentRepository = {
      category: 'Saved',
      files: await loadEditorFilesFromZip(zip),
      id: crypto.randomUUID(),
      kind: 'UNKNOWN',
      label: uniqueLabel
    };
    addInstrument(item);
    setSelectedInstrument(item.id);
    setIsDialogOpen(false);
    addNotification({ type: 'success' });
  };

  return (
    <React.Fragment>
      <ActionButton icon={<UploadIcon />} tooltip="Upload Archive" onClick={() => setIsDialogOpen(true)} />
      <FileUploadDialog
        accept={{ 'application/zip': ['.zip'] }}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        title="Upload Archive"
        onSubmit={handleSubmit}
        onValidate={() => {
          return { result: 'success' };
        }}
      />
    </React.Fragment>
  );
};
