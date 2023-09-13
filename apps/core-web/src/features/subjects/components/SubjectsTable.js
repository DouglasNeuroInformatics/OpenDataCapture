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
import React, { useState } from 'react';
import { ClientTable, Dropdown, SearchBar } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SubjectLookup } from './SubjectLookup';
import { useDownload } from '@/hooks/useDownload';
import { useAuthStore } from '@/stores/auth-store';
export var SubjectsTable = function (_a) {
  var data = _a.data;
  var download = useDownload();
  var navigate = useNavigate();
  var _b = useAuthStore(),
    currentUser = _b.currentUser,
    currentGroup = _b.currentGroup;
  var t = useTranslation().t;
  var _c = useState(false),
    showLookup = _c[0],
    setShowLookup = _c[1];
  var getExportRecords = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var url, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            url = '/v1/instruments/records/forms/export' + (currentGroup ? '?group='.concat(currentGroup.name) : '');
            return [4 /*yield*/, axios.get(url)];
          case 1:
            response = _a.sent();
            return [2 /*return*/, response.data];
        }
      });
    });
  };
  var handleExportSelection = function (option) {
    var baseFilename = ''.concat(currentUser.username, '_').concat(new Date().toISOString());
    switch (option) {
      case 'JSON':
        download(''.concat(baseFilename, '.json'), function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4 /*yield*/, getExportRecords()];
                case 1:
                  data = _a.sent();
                  return [2 /*return*/, JSON.stringify(data, null, 2)];
              }
            });
          });
        });
        break;
      case 'CSV':
        download('README.txt', function () {
          return Promise.resolve(t('viewSubjects.table.exportHelpText'));
        });
        download(''.concat(baseFilename, '.csv'), function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var data, columnNames, rows;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4 /*yield*/, getExportRecords()];
                case 1:
                  data = _a.sent();
                  columnNames = Object.keys(data[0]);
                  rows = data
                    .map(function (record) {
                      return Object.values(record).join(',');
                    })
                    .join('\n');
                  return [2 /*return*/, columnNames + '\n' + rows];
              }
            });
          });
        });
        break;
    }
  };
  /** Called when the user clicks outside the modal */
  var handleLookupClose = function () {
    setShowLookup(false);
  };
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(SubjectLookup, { show: showLookup, onClose: handleLookupClose }),
    React.createElement(
      'div',
      { className: 'my-3 flex flex-col justify-between gap-3 lg:flex-row' },
      React.createElement(SearchBar, {
        className: 'px-4 py-2.5 pl-2',
        size: 'md',
        onClick: function () {
          setShowLookup(true);
        }
      }),
      React.createElement(
        'div',
        { className: 'flex flex-grow gap-2 lg:flex-shrink' },
        React.createElement(Dropdown, {
          options: [],
          size: 'sm',
          title: t('viewSubjects.table.filters'),
          onSelection: function () {
            return null;
          }
        }),
        React.createElement(Dropdown, {
          options: ['CSV', 'JSON'],
          size: 'sm',
          title: t('viewSubjects.table.export'),
          onSelection: handleExportSelection
        })
      )
    ),
    React.createElement(ClientTable, {
      columns: [
        {
          label: t('viewSubjects.table.columns.subject'),
          field: function (subject) {
            return subject.identifier.slice(0, 6);
          }
        },
        {
          label: t('viewSubjects.table.columns.dateOfBirth'),
          field: function (subject) {
            return toBasicISOString(new Date(subject.dateOfBirth));
          }
        },
        {
          label: t('viewSubjects.table.columns.sex'),
          field: function (subject) {
            return subject.sex === 'female' ? t('sex.female') : t('sex.male');
          }
        }
      ],
      data: data,
      onEntryClick: function (subject) {
        navigate(subject.identifier);
      }
    })
  );
};
