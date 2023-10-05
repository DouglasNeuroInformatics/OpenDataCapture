import { useContext } from 'react';

import { StepperContext, useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { IdentificationForm, type IdentificationFormData } from '@/components';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

export const FormIdentification = () => {
  const notifications = useNotificationsStore();
  const { setActiveSubject } = useActiveSubjectStore();
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation();

  const handleSubmit = async (data: IdentificationFormData) => {
    const response = await axios.post('/v1/subjects/lookup', data, {
      validateStatus: (status) => status === 201 || status === 404
    });
    if (response.status === 404) {
      notifications.addNotification({ message: t('identificationForm.notFound'), type: 'error' });
      return;
    }
    setActiveSubject(data);
    updateIndex('increment');
  };

  return (
    <div>
      <IdentificationForm fillActiveSubject onSubmit={(data) => void handleSubmit(data)} />
    </div>
  );
};
