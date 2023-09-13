import React, { useContext } from 'react';
import { Dropdown } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { VisualizationContext } from '../context/VisualizationContext';
export var InstrumentDropdown = function () {
  var t = useTranslation().t;
  var ctx = useContext(VisualizationContext);
  return React.createElement(Dropdown, {
    className: 'text-sm',
    options: ctx.instrumentOptions,
    title: t('subjectPage.graph.instrument'),
    variant: 'secondary',
    onSelection: function (selection) {
      var _a, _b;
      ctx.setSelectedMeasures([]);
      ctx.setSelectedInstrument(
        (_b =
          (_a = ctx.data.find(function (_a) {
            var instrument = _a.instrument;
            return instrument.identifier === selection;
          })) === null || _a === void 0
            ? void 0
            : _a.instrument) !== null && _b !== void 0
          ? _b
          : null
      );
    }
  });
};
