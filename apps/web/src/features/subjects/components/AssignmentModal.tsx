import { useMemo } from 'react';

import { Form, Modal, useNotificationsStore } from '@douglasneuroinformatics/ui';
import type { CreateAssignmentData, FormInstrumentSummary } from '@open-data-capture/types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { useFetch } from '@/hooks/useFetch';

type AssignmentFormData = Omit<CreateAssignmentData, 'subjectIdentifier'>;

export type AssignmentModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  subjectIdentifier: string;
};

/** Component for creating a new assignment */
export const AssignmentModal = ({ isOpen, setIsOpen, subjectIdentifier }: AssignmentModalProps) => {
  const { data } = useFetch<FormInstrumentSummary[]>('/v1/instruments/forms/available');
  const { i18n } = useTranslation();
  const notifications = useNotificationsStore();

  const instrumentOptions = useMemo(() => {
    const options: Record<string, string> = {};
    if (data) {
      for (const instrument of data) {
        if (!(instrument.identifier in options)) {
          options[instrument.identifier] = instrument.details.title;
        } else if (instrument.details.language === i18n.resolvedLanguage) {
          options[instrument.identifier] = instrument.details.title;
        }
      }
    }
    return options;
  }, [data]);

  if (!data) {
    return null;
  }

  const handleSubmit = async ({ instrumentIdentifier }: AssignmentFormData) => {
    await axios.post('/v1/assignments', {
      instrumentIdentifier,
      subjectIdentifier
    });
    notifications.addNotification({ type: 'success' });
    setIsOpen(false);
  };

  return (
    <Modal open={isOpen} title="Assignment" onClose={() => setIsOpen(false)}>
      <Form<Omit<CreateAssignmentData, 'subjectIdentifier'>>
        content={{
          instrumentIdentifier: {
            kind: 'options',
            label: 'Instrument',
            options: instrumentOptions
          }
        }}
        validationSchema={{
          properties: {
            instrumentIdentifier: {
              minLength: 1,
              type: 'string'
            }
          },
          required: ['instrumentIdentifier'],
          type: 'object'
        }}
        onSubmit={(data) => void handleSubmit(data)}
      />
    </Modal>
  );
};
