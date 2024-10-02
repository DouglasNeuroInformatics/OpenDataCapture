import { useState } from 'react';

import { Dialog, Form, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { CopyPlusIcon } from 'lucide-react';
import { z } from 'zod';

import { useFilesRef } from '@/hooks/useFilesRef';
import type { InstrumentRepository } from '@/models/instrument-repository.model';
import { useAppStore } from '@/store';

export const CloneButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const instruments = useAppStore((store) => store.instruments);
  const addInstrument = useAppStore((store) => store.addInstrument);
  const setSelectedInstrument = useAppStore((store) => store.setSelectedInstrument);
  const editorFilesRef = useFilesRef();

  const handleSubmit = ({ label }: { label: string }) => {
    const files = editorFilesRef.current;
    const item: InstrumentRepository = {
      category: 'Saved',
      files,
      id: crypto.randomUUID(),
      kind: null,
      label
    };
    addInstrument(item);
    setSelectedInstrument(item.id);
    setIsDialogOpen(false);
    addNotification({ type: 'success' });
  };

  return (
    <Tooltip>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Trigger asChild>
          <Tooltip.Trigger className="h-9 w-9" size="icon" variant="outline">
            <CopyPlusIcon />
          </Tooltip.Trigger>
        </Dialog.Trigger>
        <Dialog.Content className="sm:max-w-[475px]">
          <Dialog.Header>
            <Dialog.Title>Create New Instrument</Dialog.Title>
            <Dialog.Description>
              This will save the current playground state in local storage as a new instrument.
            </Dialog.Description>
          </Dialog.Header>
          <Form
            className="[&_button]:max-w-32"
            content={{
              label: {
                kind: 'string',
                label: 'Label',
                variant: 'input'
              }
            }}
            submitBtnLabel="Save"
            validationSchema={z.object({
              label: z
                .string()
                .min(1)
                .refine(
                  (arg) => !instruments.find((instrument) => instrument.label === arg),
                  'An instrument with this label already exists'
                )
            })}
            onSubmit={(data) => void handleSubmit(data)}
          />
        </Dialog.Content>
      </Dialog>
      <Tooltip.Content side="bottom">
        <p>Create New Instrument</p>
      </Tooltip.Content>
    </Tooltip>
  );
};
