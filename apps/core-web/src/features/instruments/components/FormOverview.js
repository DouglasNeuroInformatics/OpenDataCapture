import React, { useContext } from 'react';
import { Button, StepperContext } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
var FormOverviewItem = function (_a) {
  var heading = _a.heading,
    text = _a.text;
  return React.createElement(
    'div',
    { className: 'my-5' },
    React.createElement('h5', { className: 'mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100' }, heading),
    Array.isArray(text)
      ? React.createElement(
          'ul',
          null,
          text.map(function (s, i) {
            return React.createElement('li', { className: 'my-3', key: i }, s);
          })
        )
      : React.createElement('p', { className: 'text-slate-600 dark:text-slate-300' }, text)
  );
};
export var FormOverview = function (_a) {
  var _b = _a.details,
    description = _b.description,
    language = _b.language,
    estimatedDuration = _b.estimatedDuration,
    instructions = _b.instructions;
  var updateIndex = useContext(StepperContext).updateIndex;
  var t = useTranslation().t;
  return React.createElement(
    'div',
    { className: 'mb-2' },
    React.createElement(
      'div',
      { className: 'mb-5' },
      React.createElement(FormOverviewItem, {
        heading: t('instruments.formPage.overview.description'),
        text: description
      }),
      React.createElement(FormOverviewItem, {
        heading: t('instruments.formPage.overview.language'),
        text: t('languages.'.concat(language))
      }),
      React.createElement(FormOverviewItem, {
        heading: t('instruments.formPage.overview.estimated Duration'),
        text: ''.concat(estimatedDuration, ' Minutes')
      }),
      React.createElement(FormOverviewItem, {
        heading: t('instruments.formPage.overview.instructions'),
        text: instructions
      })
    ),
    React.createElement(Button, {
      label: t('instruments.formPage.overview.begin'),
      onClick: function () {
        updateIndex('increment');
      }
    })
  );
};
