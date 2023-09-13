import React, { useContext } from 'react';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import { useTranslation } from 'react-i18next';
import { VisualizationContext } from '../context/VisualizationContext';
export var VisualizationHeader = function () {
  var _a, _b;
  var ctx = useContext(VisualizationContext);
  var t = useTranslation().t;
  return React.createElement(
    'div',
    { className: 'mb-5' },
    React.createElement(
      'h3',
      { className: 'text-center text-xl font-medium' },
      (_b = (_a = ctx.selectedInstrument) === null || _a === void 0 ? void 0 : _a.details.title) !== null &&
        _b !== void 0
        ? _b
        : t('subjectPage.graph.defaultTitle')
    ),
    ctx.minTime &&
      React.createElement(
        'p',
        { className: 'text-center' },
        toBasicISOString(new Date(ctx.minTime)),
        ' - ',
        toBasicISOString(new Date())
      )
  );
};
