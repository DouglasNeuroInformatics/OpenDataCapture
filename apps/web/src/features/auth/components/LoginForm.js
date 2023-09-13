import React from 'react';
import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
export var LoginForm = function (_a) {
  var onSubmit = _a.onSubmit;
  var t = useTranslation().t;
  return React.createElement(Form, {
    content: {
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
    },
    submitBtnLabel: t('login'),
    validationSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          minLength: 1
        },
        password: {
          type: 'string',
          minLength: 1
        }
      },
      additionalProperties: false,
      required: ['username', 'password'],
      errorMessage: {
        properties: {
          username: t('form.errors.required'),
          password: t('form.errors.required')
        }
      }
    },
    onSubmit: onSubmit
  });
};
