import React from 'react';
import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
var isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
var SetupForm = function (_a) {
  var onSubmit = _a.onSubmit;
  var t = useTranslation().t;
  return React.createElement(Form, {
    content: [
      {
        title: t('setup.admin.title'),
        description: t('setup.admin.description'),
        fields: {
          firstName: {
            kind: 'text',
            label: t('firstName'),
            variant: 'short'
          },
          lastName: {
            kind: 'text',
            label: t('lastName'),
            variant: 'short'
          },
          username: {
            kind: 'text',
            label: t('username'),
            variant: 'short'
          },
          password: {
            kind: 'text',
            label: t('password'),
            variant: 'password'
          }
        }
      },
      {
        title: t('setup.demo.title'),
        description: t('setup.demo.description'),
        fields: {
          initDemo: {
            kind: 'binary',
            label: t('setup.demo.init'),
            variant: 'radio',
            options: {
              t: t('yes'),
              f: t('no')
            }
          }
        }
      }
    ],
    submitBtnLabel: t('form.submit'),
    validationSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          minLength: 1
        },
        lastName: {
          type: 'string',
          minLength: 1
        },
        username: {
          type: 'string',
          minLength: 1
        },
        password: {
          type: 'string',
          pattern: isStrongPassword.source
        },
        initDemo: {
          type: 'boolean'
        }
      },
      required: ['firstName', 'lastName', 'username', 'password', 'initDemo']
    },
    onSubmit: onSubmit
  });
};
export { SetupForm };
