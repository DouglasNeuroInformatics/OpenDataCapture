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
import { Stepper, useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineDocumentCheck,
  HiOutlineIdentification,
  HiOutlinePrinter,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi2';
import { useParams } from 'react-router-dom';
import { FormIdentification } from '../components/FormIdentification';
import { FormOverview } from '../components/FormOverview';
import { FormQuestions } from '../components/FormQuestions';
import { FormSummary } from '../components/FormSummary';
import { useFetchInstrument } from '../hooks/useFetchInstrument';
import { PageHeader } from '@/components/PageHeader';
import { Spinner } from '@/components/Spinner';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
import { useAuthStore } from '@/stores/auth-store';
export var FormPage = function () {
  var params = useParams();
  var notifications = useNotificationsStore();
  var t = useTranslation().t;
  var activeSubject = useActiveSubjectStore().activeSubject;
  var currentGroup = useAuthStore().currentGroup;
  var instrument = useFetchInstrument(params.id);
  var _a = useState(),
    result = _a[0],
    setResult = _a[1];
  var _b = useState(0),
    timeCollected = _b[0],
    setTimeCollected = _b[1];
  if (!instrument) {
    return React.createElement(Spinner, null);
  }
  var handleSubmit = function (data) {
    return __awaiter(void 0, void 0, void 0, function () {
      var now;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            now = Date.now();
            return [
              4 /*yield*/,
              axios.post('/v1/instruments/records/forms', {
                kind: 'form',
                time: Date.now(),
                instrumentName: instrument.name,
                instrumentVersion: instrument.version,
                groupName: currentGroup === null || currentGroup === void 0 ? void 0 : currentGroup.name,
                subjectInfo: activeSubject,
                data: data
              })
            ];
          case 1:
            _a.sent();
            setTimeCollected(now);
            setResult(data);
            notifications.addNotification({ message: t('instruments.formPage.uploadSuccessful'), type: 'success' });
            return [2 /*return*/];
        }
      });
    });
  };
  return React.createElement(
    'div',
    null,
    React.createElement(PageHeader, { title: instrument.details.title }),
    React.createElement(Stepper, {
      steps: [
        {
          element: React.createElement(FormOverview, { details: instrument.details }),
          label: t('instruments.formPage.overview.label'),
          icon: React.createElement(HiOutlineDocumentCheck, null)
        },
        {
          element: React.createElement(FormIdentification, null),
          label: t('instruments.formPage.identification.label'),
          icon: React.createElement(HiOutlineIdentification, null)
        },
        {
          element: React.createElement(FormQuestions, {
            instrument: instrument,
            onSubmit: function (data) {
              return void handleSubmit(data);
            }
          }),
          label: t('instruments.formPage.questions.label'),
          icon: React.createElement(HiOutlineQuestionMarkCircle, null)
        },
        {
          element: React.createElement(FormSummary, {
            instrument: instrument,
            result: result,
            timeCollected: timeCollected
          }),
          label: t('instruments.formPage.summary.label'),
          icon: React.createElement(HiOutlinePrinter, null)
        }
      ]
    })
  );
};
export default FormPage;
