import React from 'react';

import { LegacyModal } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { Subject, SubjectIdentificationData } from '@opendatacapture/schemas/subject';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { IdentificationForm } from '@/components/IdentificationForm';

type SubjectLookupProps = {
  onClose: () => void;
  show: boolean;
};

export const SubjectLookup = ({ onClose, show }: SubjectLookupProps) => {
  const { t } = useTranslation(['subjects', 'core']);
  const notifications = useNotificationsStore();
  const navigate = useNavigate();

  const lookupSubject = async (data: SubjectIdentificationData) => {
    const response = await axios.post<Subject>('/v1/subjects/lookup', data, {
      validateStatus: (status) => status === 200 || status === 404
    });
    if (response.status === 404) {
      notifications.addNotification({ message: t('core:notFound'), type: 'warning' });
      return;
    }
    notifications.addNotification({ type: 'success' });
    navigate(`${response.data.id}/assignments`);
  };

  return (
    <LegacyModal open={show} title={t('index.lookup.title')} onClose={onClose}>
      <div>
        <IdentificationForm fillActiveSubject onSubmit={(data) => void lookupSubject(data)} />
      </div>
    </LegacyModal>
  );
};
