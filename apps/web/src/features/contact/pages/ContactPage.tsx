import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';

import { ContactForm, type ContactFormData } from '../components/ContactForm';

const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL;

export const ContactPage = () => {
  const { t } = useTranslation('contact');

  const handleSubmit = ({ contactReason, message }: ContactFormData) => {
    const subject = encodeURIComponent(t(`reasons.${contactReason}`).toUpperCase());
    const body = encodeURIComponent(message);
    const emailTemplate = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    window.open(emailTemplate, '_blank');
  };

  return (
    <div>
      <PageHeader title={t('pageTitle')} />
      <ContactForm onSubmit={handleSubmit} />
    </div>
  );
};

