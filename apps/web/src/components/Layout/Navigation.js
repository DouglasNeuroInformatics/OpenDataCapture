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
import { useTranslation } from 'react-i18next';
import { HiAdjustmentsHorizontal, HiChartBar, HiEye, HiPlus, HiUserPlus } from 'react-icons/hi2';
import { NavigationLink } from './NavigationLink';
export var Navigation = function (props) {
  var t = useTranslation().t;
  return React.createElement(
    'nav',
    null,
    React.createElement(
      NavigationLink,
      __assign(
        { access: null, href: '/overview', icon: React.createElement(HiChartBar, null), label: t('navLinks.overview') },
        props
      )
    ),
    React.createElement(
      NavigationLink,
      __assign(
        {
          access: { action: 'create', subject: 'Subject' },
          href: '/subjects/add-visit',
          icon: React.createElement(HiUserPlus, null),
          label: t('navLinks.addVisit')
        },
        props
      )
    ),
    React.createElement(
      NavigationLink,
      __assign(
        {
          access: [
            {
              action: 'read',
              subject: 'Subject'
            },
            {
              action: 'read',
              subject: 'InstrumentRecord'
            }
          ],
          href: '/subjects/view-subjects',
          icon: React.createElement(HiEye, null),
          label: t('navLinks.viewSubjects')
        },
        props
      )
    ),
    React.createElement(
      NavigationLink,
      __assign(
        {
          access: { action: 'create', subject: 'Instrument' },
          href: '/instruments/create',
          icon: React.createElement(HiPlus, null),
          label: t('navLinks.createInstrument')
        },
        props
      )
    ),
    React.createElement(
      NavigationLink,
      __assign(
        {
          access: { action: 'delete', subject: 'Instrument' },
          href: 'instruments/manage',
          icon: React.createElement(HiAdjustmentsHorizontal, null),
          label: t('navLinks.manageInstruments')
        },
        props
      )
    ),
    React.createElement(
      NavigationLink,
      __assign(
        {
          access: { action: 'create', subject: 'InstrumentRecord' },
          href: '/instruments/available',
          icon: React.createElement(HiEye, null),
          label: t('navLinks.availableInstruments')
        },
        props
      )
    )
  );
};
