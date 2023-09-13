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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
import React, { useContext, useMemo } from 'react';
import { ClientTable, Dropdown, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/utils';
import { useTranslation } from 'react-i18next';
import { VisualizationContext } from '../context/VisualizationContext';
import { InstrumentDropdown } from './InstrumentDropdown';
import { TimeDropdown } from './TimeDropdown';
import { VisualizationHeader } from './VisualizationHeader';
import { useDownload } from '@/hooks/useDownload';
import { useAuthStore } from '@/stores/auth-store';
export var RecordsTable = function () {
  var _a = useContext(VisualizationContext),
    selectedInstrument = _a.selectedInstrument,
    records = _a.records;
  var t = useTranslation().t;
  var currentUser = useAuthStore().currentUser;
  var download = useDownload();
  var notifications = useNotificationsStore();
  var data = useMemo(
    function () {
      if (!selectedInstrument) {
        return [];
      }
      var data = [];
      for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
        var record = records_1[_i];
        data.push(__assign(__assign({ time: record.time }, record.computedMeasures), record.data));
      }
      return data;
    },
    [records]
  );
  var handleDownload = function (option) {
    if (!selectedInstrument) {
      notifications.addNotification({ type: 'info', message: t('selectInstrument') });
      return;
    }
    var baseFilename = ''
      .concat(currentUser.username, '_')
      .concat(selectedInstrument.name, '_')
      .concat(selectedInstrument.version, '_')
      .concat(new Date().toISOString());
    switch (option) {
      case 'JSON':
        download(''.concat(baseFilename, '.json'), function () {
          return Promise.resolve(JSON.stringify(data, null, 2));
        });
        break;
      case 'CSV':
        download(''.concat(baseFilename, '.csv'), function () {
          var columnNames = Object.keys(data[0]);
          var rows = data
            .map(function (item) {
              return Object.values(item).join(',');
            })
            .join('\n');
          return Promise.resolve(columnNames + '\n' + rows);
        });
    }
  };
  var fields = [];
  for (var subItem in data[0]) {
    if (subItem !== 'time') {
      fields.push({
        label: camelToSnakeCase(subItem).toUpperCase(),
        field: subItem
      });
    }
  }
  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'my-2' },
      React.createElement(VisualizationHeader, null),
      React.createElement(
        'div',
        { className: 'flex flex-col gap-2 lg:flex-row lg:justify-between' },
        React.createElement(
          'div',
          { className: 'flex flex-col gap-2 lg:flex-row' },
          React.createElement(InstrumentDropdown, null)
        ),
        React.createElement(
          'div',
          { className: 'flex flex-col gap-2 lg:flex-row' },
          React.createElement(TimeDropdown, null),
          React.createElement(Dropdown, {
            className: 'text-sm',
            options: ['CSV', 'JSON'],
            title: t('download'),
            variant: 'secondary',
            onSelection: handleDownload
          })
        )
      )
    ),
    React.createElement(ClientTable, {
      columns: __spreadArray(
        [
          {
            label: 'DATE_COLLECTED',
            field: 'time',
            formatter: function (value) {
              return toBasicISOString(new Date(value));
            }
          }
        ],
        fields,
        true
      ),
      data: data
    })
  );
};
