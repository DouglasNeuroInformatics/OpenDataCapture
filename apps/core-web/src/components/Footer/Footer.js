import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LanguageToggle } from '../LanguageToggle';
var CURRENT_YEAR = new Date().getFullYear();
var DOC_URL = import.meta.env.VITE_DOCS_URL;
var LICENSE_URL = import.meta.env.VITE_LICENSE_URL;
var GITHUB_REPO_URL = import.meta.env.VITE_GITHUB_REPO_URL;
export var Footer = function () {
  var t = useTranslation().t;
  return React.createElement(
    'footer',
    { className: 'container py-3 text-slate-600 dark:text-slate-300 print:hidden' },
    React.createElement('hr', { className: 'my-4 border-slate-200 dark:border-slate-700 print:hidden' }),
    React.createElement(
      'div',
      { className: 'mb-3 flex flex-col justify-center gap-4 lg:flex-row' },
      React.createElement(LanguageToggle, { className: 'lg:hidden' }),
      React.createElement(
        'a',
        { className: 'text-center', href: DOC_URL, rel: 'noreferrer', target: '_blank' },
        t('footer.documentation')
      ),
      React.createElement(
        'a',
        { className: 'text-center', href: LICENSE_URL, rel: 'noreferrer', target: '_blank' },
        t('footer.license')
      ),
      React.createElement(
        'a',
        { className: 'text-center', href: GITHUB_REPO_URL, rel: 'noreferrer', target: '_blank' },
        t('footer.sourceCode')
      ),
      React.createElement(Link, { className: 'text-center', to: '/contact' }, t('footer.contact'))
    ),
    React.createElement('p', { className: 'text-center text-sm' }, '\u00A9 ', CURRENT_YEAR, ' ', t('organization.name'))
  );
};
