/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { Form, LegacyModal } from '@douglasneuroinformatics/libui/components';
import type { CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const ONE_YEAR = 31556952000;

export type AssignmentModalProps = {
  instrumentOptions: { [key: string]: string };
  isOpen: boolean;
  onSubmit: (data: Omit<CreateAssignmentData, 'subjectId'>) => void;
  setIsOpen: (isOpen: boolean) => void;
};

/** Component for creating a new assignment */
export const AssignmentModal = ({ instrumentOptions, isOpen, onSubmit, setIsOpen }: AssignmentModalProps) => {
  const { t } = useTranslation(['datahub', 'core']);

  return (
    <LegacyModal open={isOpen} title="Assignment" onClose={() => setIsOpen(false)}>
      <Form
        content={{
          instrumentId: {
            kind: 'string',
            label: t('core:instrument'),
            options: instrumentOptions,
            variant: 'select'
          },
          expiresAt: {
            kind: 'date',
            label: t('assignments.expiresAt')
          }
        }}
        initialValues={{
          expiresAt: new Date(Date.now() + ONE_YEAR)
        }}
        validationSchema={
          z.object({
            expiresAt: z.coerce.date().min(new Date(), { message: t('errors.expiryMustBeInFuture') }),
            instrumentId: z.string()
          }) satisfies z.ZodType<Omit<CreateAssignmentData, 'subjectId'>>
        }
        onSubmit={onSubmit}
      />
    </LegacyModal>
  );
};
