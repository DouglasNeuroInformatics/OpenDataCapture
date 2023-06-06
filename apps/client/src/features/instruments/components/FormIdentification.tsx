import React, { useContext } from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/react-components';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { IdentificationForm, type IdentificationFormData } from '@/components';
import { StepperContext } from '@/context/StepperContext';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const FormIdentification = () => {
  const notifications = useNotificationsStore();
  const { setActiveSubject } = useActiveSubjectStore();
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation('common');

  const handleSubmit = async (data: IdentificationFormData) => {
    const response = await axios.post('/v1/subjects/lookup', data, {
      validateStatus: (status) => status === 201 || status === 404
    });
    if (response.status === 404) {
      notifications.addNotification({ type: 'error', message: t('identificationForm.notFound') });
      return;
    }
    setActiveSubject(data);
    updateIndex('increment');
  };

  return (
    <div>
      <IdentificationForm fillActiveSubject onSubmit={handleSubmit} />
    </div>
  );
};
