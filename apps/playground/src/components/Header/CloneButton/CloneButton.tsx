import React, { useState } from 'react';

import { Button, Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { CopyPlusIcon } from 'lucide-react';
import { z } from 'zod';

import { useEditorFilesRef } from '@/hooks/useEditorFilesRef';
import { type InstrumentStoreItem, useInstrumentStore } from '@/store/instrument.store';

export const CloneButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const instruments = useInstrumentStore((store) => store.instruments);
  const addInstrument = useInstrumentStore((store) => store.addInstrument);
  const setSelectedInstrument = useInstrumentStore((store) => store.setSelectedInstrument);
  const editorFilesRef = useEditorFilesRef();

  const handleSubmit = ({ label }: { label: string }) => {
    const files = editorFilesRef.current;
    const item: InstrumentStoreItem = {
      category: 'Saved',
      files,
      id: crypto.randomUUID(),
      kind: 'UNKNOWN',
      label
    };
    addInstrument(item);
    setSelectedInstrument(item.id);
    setIsDialogOpen(false);
    addNotification({ type: 'success' });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger asChild>
        <Button className="h-9 w-9" size="icon" variant="outline">
          <CopyPlusIcon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-[475px]">
        <Dialog.Header>
          <Dialog.Title>Clone New Instrument</Dialog.Title>
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
  );
};
