import { useState } from 'react';

import { Dialog, Form, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CopyPlusIcon } from 'lucide-react';
import { z } from 'zod/v4';

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
  const { t } = useTranslation();

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
            <Dialog.Title>{t({ en: 'Create New Instrument', fr: 'Créer un nouvel instrument' })}</Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'This will save the current playground state in local storage as a new instrument.',
                fr: "Ceci enregistrera l'état actuel du terrain de jeu dans le stockage local en tant que nouvel instrument."
              })}
            </Dialog.Description>
          </Dialog.Header>
          <Form
            className="[&_button]:max-w-32"
            content={{
              label: {
                kind: 'string',
                label: t({ en: 'Label', fr: 'Nom' }),
                variant: 'input'
              }
            }}
            submitBtnLabel={t({ en: 'Save', fr: 'Enregistrer' })}
            validationSchema={z.object({
              label: z
                .string()
                .min(1)
                .refine(
                  (arg) => !instruments.find((instrument) => instrument.label === arg),
                  t({ en: 'An instrument with this label already exists', fr: 'Un instrument avec ce nom existe déjà' })
                )
            })}
            onSubmit={(data) => void handleSubmit(data)}
          />
        </Dialog.Content>
      </Dialog>
      <Tooltip.Content side="bottom">
        <p>{t({ en: 'Create New Instrument', fr: 'Créer un nouvel instrument' })}</p>
      </Tooltip.Content>
    </Tooltip>
  );
};
