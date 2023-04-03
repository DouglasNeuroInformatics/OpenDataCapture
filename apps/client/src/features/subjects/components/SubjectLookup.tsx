import React from 'react';

import { useTranslation } from 'react-i18next';

import { IdentificationForm, Modal } from '@/components';

interface SubjectLookupProps {
  show: boolean;
  onClose: () => void;
}

export const SubjectLookup = ({ show, onClose }: SubjectLookupProps) => {
  const { t } = useTranslation('subjects');

  const lookupSubject = (data: any) => alert(JSON.stringify(data));

  return (
    <Modal open={show} title={t('viewSubjects.lookup.title')} onClose={onClose}>
      <IdentificationForm onSubmit={lookupSubject} />
    </Modal>
  );
};
