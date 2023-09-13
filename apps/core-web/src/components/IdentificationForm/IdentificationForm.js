import React from 'react';
import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
export var IdentificationForm = function (_a) {
  var fillActiveSubject = _a.fillActiveSubject,
    submitBtnLabel = _a.submitBtnLabel,
    onSubmit = _a.onSubmit;
  var activeSubject = useActiveSubjectStore().activeSubject;
  var t = useTranslation().t;
  return React.createElement(Form, {
    content: {
      firstName: {
        kind: 'text',
        label: t('identificationForm.firstName.label'),
        variant: 'short',
        description: t('identificationForm.firstName.description')
      },
      lastName: {
        kind: 'text',
        label: t('identificationForm.lastName.label'),
        variant: 'short',
        description: t('identificationForm.lastName.description')
      },
      dateOfBirth: {
        kind: 'date',
        label: t('identificationForm.dateOfBirth.label')
      },
      sex: {
        kind: 'options',
        label: t('identificationForm.sex.label'),
        options: {
          male: t('sex.male'),
          female: t('sex.female')
        },
        description: t('identificationForm.sex.description')
      }
    },
    initialValues: fillActiveSubject ? activeSubject : undefined,
    resetBtn: fillActiveSubject,
    submitBtnLabel:
      submitBtnLabel !== null && submitBtnLabel !== void 0 ? submitBtnLabel : t('identificationForm.submit'),
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
        dateOfBirth: {
          type: 'string',
          format: 'date'
        },
        sex: {
          type: 'string',
          enum: ['male', 'female']
        }
      },
      additionalProperties: false,
      required: ['firstName', 'lastName', 'sex', 'dateOfBirth'],
      errorMessage: {
        properties: {
          firstName: t('form.errors.required'),
          lastName: t('form.errors.required'),
          sex: t('form.errors.required'),
          dateOfBirth: t('form.errors.required')
        }
      }
    },
    onSubmit: onSubmit
  });
};
