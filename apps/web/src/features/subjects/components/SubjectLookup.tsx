import { Modal } from '@douglasneuroinformatics/ui';
import type { Subject, SubjectIdentificationData } from '@open-data-capture/types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { IdentificationForm } from '@/components/IdentificationForm';

type SubjectLookupProps = {
  onClose: () => void;
  show: boolean;
};

export const SubjectLookup = ({ onClose, show }: SubjectLookupProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const lookupSubject = (formData: SubjectIdentificationData) => {
    axios
      .post<Subject>('/v1/subjects/lookup', formData)
      .then(({ data: { identifier } }) => {
        navigate(identifier);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Modal open={show} title={t('viewSubjects.lookup.title')} onClose={onClose}>
      <div>
        <IdentificationForm fillActiveSubject onSubmit={lookupSubject} />
      </div>
    </Modal>
  );
};
