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
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import i18n from '@/services/i18n';
/** Apply a callback function to filter items from object */
function filterObj(obj, fn) {
  var result = {};
  for (var key in obj) {
    if (fn({ key: key, value: obj[key] })) {
      result[key] = obj[key];
    }
  }
  return result;
}
export var VisualizationContext = createContext(null);
export var VisualizationContextProvider = function (_a) {
  var children = _a.children,
    _b = _a.instrumentOptionsFilter,
    instrumentOptionsFilter =
      _b === void 0
        ? function () {
            return true;
          }
        : _b;
  var params = useParams();
  var data = useFetch('/v1/instruments/records/forms', [], {
    queryParams: {
      subject: params.subjectIdentifier,
      lang: i18n.resolvedLanguage
    }
  }).data;
  var _c = useState(null),
    minTime = _c[0],
    setMinTime = _c[1];
  var _d = useState(null),
    selectedInstrument = _d[0],
    setSelectedInstrument = _d[1];
  var _e = useState([]),
    selectedMeasures = _e[0],
    setSelectedMeasures = _e[1];
  // This is to reset all data when language changes
  useEffect(
    function () {
      setSelectedInstrument(null);
      setSelectedMeasures([]);
    },
    [i18n.resolvedLanguage]
  );
  useEffect(
    function () {
      setMinTime(null);
    },
    [selectedInstrument]
  );
  var records = useMemo(
    function () {
      var instrument =
        data === null || data === void 0
          ? void 0
          : data.find(function (_a) {
              var instrument = _a.instrument;
              return instrument === selectedInstrument;
            });
      if (!instrument) {
        return [];
      }
      return instrument.records
        .map(function (record) {
          return record;
        })
        .filter(function (record) {
          return minTime === null || record.time > minTime;
        });
    },
    [data, selectedMeasures, selectedInstrument, minTime]
  );
  var measurements = useMemo(
    function () {
      return records
        .map(function (record) {
          return __assign(
            { time: record.time },
            filterObj(record.computedMeasures, function (_a) {
              var key = _a.key;
              return selectedMeasures.find(function (item) {
                return item.key === key;
              });
            })
          );
        })
        .sort(function (a, b) {
          if (a.time > b.time) {
            return 1;
          } else if (b.time > a.time) {
            return -1;
          }
          return 0;
        });
    },
    [records]
  );
  var instrumentOptions = useMemo(
    function () {
      return data
        ? Object.fromEntries(
            data
              .filter(function (_a) {
                var instrument = _a.instrument;
                return instrumentOptionsFilter(instrument);
              })
              .map(function (_a) {
                var instrument = _a.instrument;
                return [instrument.identifier, instrument.details.title];
              })
          )
        : {};
    },
    [data]
  );
  var measureOptions = useMemo(
    function () {
      var arr = [];
      if (selectedInstrument) {
        for (var measure in selectedInstrument.measures) {
          arr.push({
            key: measure,
            label: selectedInstrument.measures[measure].label
          });
        }
      }
      return arr;
    },
    [selectedInstrument]
  );
  if (!data) {
    return React.createElement(Spinner, null);
  }
  return React.createElement(
    VisualizationContext.Provider,
    {
      value: {
        data: data,
        records: records,
        measurements: measurements,
        measureOptions: measureOptions,
        instrumentOptions: instrumentOptions,
        minTime: minTime,
        setMinTime: setMinTime,
        selectedInstrument: selectedInstrument,
        setSelectedInstrument: setSelectedInstrument,
        selectedMeasures: selectedMeasures,
        setSelectedMeasures: setSelectedMeasures
      }
    },
    children
  );
};
