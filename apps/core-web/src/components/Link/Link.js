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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
import React from 'react';
import { clsx } from 'clsx';
import { Link as RouterLink } from 'react-router-dom';
export var Link = function (_a) {
  var className = _a.className,
    children = _a.children,
    _b = _a.variant,
    variant = _b === void 0 ? 'default' : _b,
    props = __rest(_a, ['className', 'children', 'variant']);
  return React.createElement(
    RouterLink,
    __assign(
      {
        className: clsx(
          'px-6 py-2',
          {
            'text-slate-600 hover:text-slate-900': variant === 'default',
            'btn btn-primary': variant === 'btn-primary',
            'btn btn-secondary': variant === 'btn-secondary'
          },
          className
        )
      },
      props
    ),
    children
  );
};
