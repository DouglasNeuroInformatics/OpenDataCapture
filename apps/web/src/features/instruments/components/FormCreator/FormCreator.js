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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
import React, { useState } from 'react';
import { Stepper } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import { FieldsForm } from './FieldsForm';
import { InfoForm } from './InfoForm';
import { Review } from './Review';
export var FormCreator = function () {
  var _a = useState({
      kind: 'form',
      validationSchema: {
        type: 'object',
        required: []
      }
    }),
    state = _a[0],
    setState = _a[1];
  var t = useTranslation().t;
  var handleSubmitDetails = function (_a) {
    var name = _a.name,
      tags = _a.tags,
      version = _a.version,
      details = __rest(_a, ['name', 'tags', 'version']);
    setState(function (prevState) {
      return __assign(__assign({}, prevState), {
        details: details,
        name: name,
        tags: tags.split(',').map(function (s) {
          return s.trim();
        }),
        version: version
      });
    });
  };
  var handleSubmitFields = function (_a) {
    var fields = _a.fields;
    var content = Object.fromEntries(
      fields.map(function (_a) {
        var name = _a.name,
          rest = __rest(_a, ['name']);
        return [name, rest];
      })
    );
    setState(function (prevState) {
      return __assign(__assign({}, prevState), { content: content });
    });
  };
  return React.createElement(Stepper, {
    steps: [
      {
        label: t('instruments.createInstrument.steps.info'),
        icon: React.createElement(HiOutlineQuestionMarkCircle, null),
        element: React.createElement(InfoForm, { onSubmit: handleSubmitDetails })
      },
      {
        label: t('instruments.createInstrument.steps.fields'),
        icon: React.createElement(HiOutlineQuestionMarkCircle, null),
        element: React.createElement(FieldsForm, { onSubmit: handleSubmitFields })
      },
      {
        label: t('instruments.createInstrument.steps.review'),
        icon: React.createElement(HiOutlineQuestionMarkCircle, null),
        element: React.createElement(Review, { form: state })
      }
    ]
  });
};
