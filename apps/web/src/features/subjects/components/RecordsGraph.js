var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { LineGraph } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { VisualizationContext } from '../context/VisualizationContext';
import { InstrumentDropdown } from './InstrumentDropdown';
import { MeasuresDropdown } from './MeasuresDropdown';
import { TimeDropdown } from './TimeDropdown';
import { VisualizationHeader } from './VisualizationHeader';
var COLOR_PALETTE = ['#D81B60', '#1E88E5', '#FD08FA', '#A06771', '#353A9B', '#D90323', '#9C9218', '#CF0583', '#4075A3'];
export var RecordsGraph = function () {
  var ctx = useContext(VisualizationContext);
  var t = useTranslation().t;
  var _a = useState({}),
    predicted = _a[0],
    setPredicted = _a[1];
  var fetchPredicted = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            new URLSearchParams('');
            return [
              4 /*yield*/,
              axios.get(
                '/v1/instruments/records/forms/linear-regression?instrument='.concat(ctx.selectedInstrument.identifier)
              )
            ];
          case 1:
            response = _a.sent();
            setPredicted(response.data);
            return [2 /*return*/];
        }
      });
    });
  };
  var data = useMemo(
    function () {
      var arr = ctx.measurements.map(function (dataPoint) {
        for (var key in dataPoint) {
          var model = predicted[key];
          if (!model) {
            continue;
          }
          dataPoint[key + 'Group'] = Number((model.intercept + model.slope * dataPoint.time).toFixed(2));
        }
        return dataPoint;
      });
      return arr;
    },
    [ctx.measurements]
  );
  useEffect(
    function () {
      if (ctx.selectedInstrument) {
        void fetchPredicted();
      }
    },
    [ctx.selectedInstrument]
  );
  var lines = [];
  for (var i = 0; i < ctx.selectedMeasures.length; i++) {
    var measure = ctx.selectedMeasures[i];
    lines.push({
      name: measure.label,
      val: measure.key,
      stroke: COLOR_PALETTE[i]
    });
    lines.push({
      name: ''.concat(measure.label, ' (').concat(t('groupTrend'), ')'),
      val: measure.key + 'Group',
      strokeWidth: 0.5,
      stroke: COLOR_PALETTE[i],
      legendType: 'none',
      strokeDasharray: '5 5'
    });
  }
  return React.createElement(
    'div',
    { className: 'mx-auto max-w-3xl' },
    React.createElement(
      'div',
      { className: 'py-3' },
      React.createElement(VisualizationHeader, null),
      React.createElement(
        'div',
        { className: 'flex flex-col gap-2 lg:flex-row lg:justify-between' },
        React.createElement(
          'div',
          { className: 'flex flex-col gap-2 lg:flex-row' },
          React.createElement(InstrumentDropdown, null),
          React.createElement(MeasuresDropdown, null)
        ),
        React.createElement('div', null, React.createElement(TimeDropdown, null))
      )
    ),
    React.createElement(
      'div',
      null,
      React.createElement(LineGraph, {
        data: data,
        lines: lines,
        xAxis: {
          key: 'time',
          label: t('subjectPage.graph.xLabel')
        }
      })
    )
  );
};
