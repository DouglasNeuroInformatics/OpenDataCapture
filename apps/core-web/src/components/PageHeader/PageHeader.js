import React from 'react';
export var PageHeader = function (_a) {
  var title = _a.title;
  return React.createElement(
    'div',
    { className: 'my-3 w-full' },
    React.createElement(
      'h2',
      { className: 'my-4 text-center text-2xl font-bold text-slate-900 dark:text-slate-100 md:mb-6 lg:text-3xl' },
      title
    ),
    React.createElement('hr', { className: 'my-5 w-full border-slate-200 dark:border-slate-700' })
  );
};
