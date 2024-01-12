import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';

import { ContactForm, type ContactFormData } from '../components/ContactForm';

export const ContactPage = () => {
  const { t } = useTranslation('contact');

  const handleSubmit = ({ contactReason, message }: ContactFormData) => {
    const subject = encodeURIComponent(t(`reasons.${contactReason}`).toUpperCase());
    const body = encodeURIComponent(message);
    const emailTemplate = `mailto:${config.meta.contactEmail}?subject=${subject}&body=${body}`;
    window.open(emailTemplate, '_blank');
  };

  return (
    <div>
      <PageHeader title={t('pageTitle')} />
      <ContactForm onSubmit={handleSubmit} />
    </div>
  );
};
