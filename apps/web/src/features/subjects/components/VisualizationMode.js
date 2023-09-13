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
import { Link } from 'react-router-dom';
export var VisualizationMode = function (_a) {
  var title = _a.title,
    icon = _a.icon,
    className = _a.className,
    props = __rest(_a, ['title', 'icon', 'className']);
  return React.createElement(
    Link,
    __assign(
      {
        className: clsx(
          'flex flex-col items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105 [&>svg]:h-24 [&>svg]:w-24',
          className
        )
      },
      props
    ),
    icon,
    title
  );
};
