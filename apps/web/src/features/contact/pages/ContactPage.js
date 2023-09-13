import React from 'react';
import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components';
var CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
export var ContactPage = function () {
  var t = useTranslation().t;
  var handleSubmit = function (_a) {
    var contactReason = _a.contactReason,
      message = _a.message;
    var subject = encodeURIComponent(t('contact.reasons.'.concat(contactReason)).toUpperCase());
    var body = encodeURIComponent(message);
    var emailTemplate = 'mailto:'.concat(CONTACT_EMAIL, '?subject=').concat(subject, '&body=').concat(body);
    window.open(emailTemplate, '_blank');
  };
  return React.createElement(
    'div',
    null,
    React.createElement(PageHeader, { title: t('contact.pageTitle') }),
    React.createElement(Form, {
      content: {
        contactReason: {
          kind: 'options',
          label: 'Reason',
          options: {
            bug: t('contact.reasons.bug'),
            feedback: t('contact.reasons.feedback'),
            request: t('contact.reasons.request'),
            other: t('contact.reasons.other')
          }
        },
        message: {
          kind: 'text',
          label: t('contact.message'),
          variant: 'long'
        }
      },
      validationSchema: {
        type: 'object',
        properties: {
          contactReason: {
            type: 'string',
            enum: ['bug', 'feedback', 'other', 'request']
          },
          message: {
            type: 'string',
            minLength: 1
          }
        },
        required: ['contactReason'],
        errorMessage: {
          properties: {
            reason: t('form.errors.required')
          }
        }
      },
      onSubmit: handleSubmit
    })
  );
};
export default ContactPage;
