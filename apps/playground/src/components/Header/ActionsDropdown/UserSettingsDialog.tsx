/* eslint-disable perfectionist/sort-objects */

import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { $Settings } from '@/models/settings.model';
import { useAppStore } from '@/store';

export type UserSettingsDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UserSettingsDialog = ({ isOpen, setIsOpen }: UserSettingsDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const settings = useAppStore((store) => store.settings);
  const updateSettings = useAppStore((store) => store.updateSettings);
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'User Settings', fr: 'Paramètres utilisateur' })}</Dialog.Title>
        </Dialog.Header>
        <Form
          className="py-4"
          content={[
            {
              title: t({ en: 'Default Instance Settings', fr: "Paramètres d'instance par défaut" }),
              fields: {
                apiBaseUrl: {
                  description: t({
                    en: 'The base path for your Open Data Capture REST API.',
                    fr: 'Le chemin de base de votre API REST Open Data Capture.'
                  }),
                  kind: 'string',
                  placeholder: 'e.g., https://demo.opendatacapture.org/api',
                  label: t({ en: 'API Base URL', fr: "URL de base de l'API" }),
                  variant: 'input'
                }
              }
            },
            {
              title: t({ en: 'Editor Settings', fr: "Paramètres de l'éditeur" }),
              fields: {
                enableVimMode: {
                  kind: 'boolean',
                  label: t({ en: 'Enable VIM Mode (Experimental)', fr: 'Activer le mode VIM (Expérimental)' }),
                  variant: 'radio'
                },
                refreshInterval: {
                  description: t({
                    en: 'The interval, in milliseconds, between builds, assuming the source code has changed',
                    fr: "L'intervalle, en millisecondes, entre les compilations, en supposant que le code source ait changé"
                  }),
                  kind: 'number',
                  label: t({ en: 'Refresh Interval', fr: "Intervalle d'actualisation" }),
                  variant: 'input'
                }
              }
            }
          ]}
          initialValues={settings}
          submitBtnLabel={t({ en: 'Save Changes', fr: 'Enregistrer les modifications' })}
          validationSchema={$Settings}
          onSubmit={(updatedSettings) => {
            updateSettings(updatedSettings);
            addNotification({ type: 'success' });
            setIsOpen(false);
          }}
        />
      </Dialog.Content>
    </Dialog>
  );
};
