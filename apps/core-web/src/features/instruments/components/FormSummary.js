var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import React from 'react';
import { Button } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components';
import { useDownload } from '@/hooks/useDownload';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
import { formatDataAsString } from '@/utils/form-utils';
var FormSummaryItem = function (_a) {
  var label = _a.label,
    value = _a.value;
  return React.createElement(
    'div',
    { className: 'my-1' },
    React.createElement('span', { className: 'font-semibold' }, label, ': '),
    React.createElement('span', null, String(value))
  );
};
export var FormSummary = function (_a) {
  var timeCollected = _a.timeCollected,
    instrument = _a.instrument,
    result = _a.result;
  var activeSubject = useActiveSubjectStore().activeSubject;
  var download = useDownload();
  var _b = useTranslation(),
    i18n = _b.i18n,
    t = _b.t;
  if (!result) {
    return React.createElement(Spinner, null);
  }
  var downloadResult = function () {
    var filename = ''
      .concat(instrument.name, '_v')
      .concat(instrument.version, '_')
      .concat(new Date(timeCollected).toISOString(), '.txt');
    download(filename, function () {
      return Promise.resolve(formatDataAsString(result));
    });
  };
  return React.createElement(
    'div',
    null,
    React.createElement('h3', { className: 'my-3 text-xl font-semibold' }, t('instruments.formPage.summary.subject')),
    React.createElement(FormSummaryItem, {
      label: t('instruments.formPage.summary.name'),
      value: ''.concat(activeSubject.firstName, ' ').concat(activeSubject.lastName)
    }),
    React.createElement(FormSummaryItem, {
      label: t('instruments.formPage.summary.dateOfBirth'),
      value: activeSubject === null || activeSubject === void 0 ? void 0 : activeSubject.dateOfBirth
    }),
    React.createElement(FormSummaryItem, {
      label: t('instruments.formPage.summary.sex'),
      value: activeSubject === null || activeSubject === void 0 ? void 0 : activeSubject.sex
    }),
    React.createElement('h3', { className: 'my-3 text-xl font-semibold' }, t('instruments.formPage.summary.metadata')),
    React.createElement(FormSummaryItem, {
      label: t('instruments.formPage.summary.instrumentTitle'),
      value: instrument.details.title
    }),
    React.createElement(FormSummaryItem, {
      label: t('instruments.formPage.summary.instrumentVersion'),
      value: instrument.version
    }),
    React.createElement(FormSummaryItem, {
      label: t('instruments.formPage.summary.timeCollected'),
      value: new Date(timeCollected).toLocaleString(i18n.resolvedLanguage)
    }),
    React.createElement('h3', { className: 'my-3 text-xl font-semibold' }, t('instruments.formPage.summary.results')),
    React.createElement(
      'div',
      { className: 'mb-3' },
      Object.keys(result).map(function (fieldName) {
        var field;
        if (instrument.content instanceof Array) {
          field = instrument.content
            .map(function (group) {
              return group.fields;
            })
            .reduce(function (prev, current) {
              return __assign(__assign({}, prev), current);
            })[fieldName];
        } else {
          field = instrument.content[fieldName];
        }
        return React.createElement(FormSummaryItem, { key: fieldName, label: field.label, value: result[fieldName] });
      })
    ),
    React.createElement(
      'div',
      { className: 'flex gap-3 print:hidden' },
      React.createElement(Button, {
        label: t('instruments.formPage.summary.print'),
        onClick: function () {
          print();
        }
      }),
      React.createElement(Button, { label: t('instruments.formPage.summary.download'), onClick: downloadResult })
    )
  );
};
