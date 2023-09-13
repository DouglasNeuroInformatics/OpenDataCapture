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
import React, { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useTranslation } from 'react-i18next';
import { IoMdCloseCircle, IoMdRemoveCircle } from 'react-icons/io';
import { useActiveSubjectStore } from '@/stores/active-subject-store';
export var ActiveSubject = function () {
  var _a = useActiveSubjectStore(),
    activeSubject = _a.activeSubject,
    setActiveSubject = _a.setActiveSubject;
  var _b = useState(false),
    isHidden = _b[0],
    setIsHidden = _b[1];
  var t = useTranslation().t;
  var _c = useSpring(function () {
      return { x: 0, y: 0 };
    }),
    _d = _c[0],
    x = _d.x,
    y = _d.y,
    api = _c[1];
  var bind = useDrag(
    function (_a) {
      var down = _a.down,
        _b = _a.offset,
        ox = _b[0],
        oy = _b[1];
      api.start({ x: ox, y: oy, immediate: down });
    },
    {
      bounds: document.body,
      rubberband: true
    }
  );
  if (!activeSubject) {
    return null;
  }
  return React.createElement(
    animated.div,
    __assign(
      {
        className:
          'absolute z-50 flex cursor-pointer touch-none flex-col rounded-lg bg-slate-900/75 p-3 text-slate-300 backdrop-blur-sm print:hidden'
      },
      bind(),
      { style: { x: x, y: y } }
    ),
    React.createElement(
      'div',
      { className: 'pointer-events-auto mb-1 flex justify-end' },
      React.createElement(
        'button',
        {
          onClick: function () {
            setIsHidden(!isHidden);
          }
        },
        React.createElement(IoMdRemoveCircle, null)
      ),
      React.createElement(
        'button',
        {
          onClick: function () {
            setActiveSubject(null);
          }
        },
        React.createElement(IoMdCloseCircle, null)
      )
    ),
    isHidden &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement('h3', { className: 'mb-2 text-xl font-medium text-inherit' }, t('activeSubject.header')),
        React.createElement('hr', { className: 'mb-2' }),
        React.createElement('span', null, t('identificationForm.firstName.label'), ': ', activeSubject.firstName),
        React.createElement('span', null, t('identificationForm.lastName.label'), ': ', activeSubject.lastName),
        React.createElement('span', null, t('identificationForm.dateOfBirth.label'), ': ', activeSubject.dateOfBirth),
        React.createElement('span', null, t('identificationForm.sex.label'), ': ', t('sex.'.concat(activeSubject.sex)))
      )
  );
};
