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
import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
export var SetupContext = createContext(null);
export var SetupContextProvider = function (_a) {
  var children = _a.children;
  var _b = useState(function () {
      var savedSetup = window.localStorage.getItem('setup');
      if (!savedSetup) {
        return { isSetup: null };
      }
      return JSON.parse(savedSetup);
    }),
    state = _b[0],
    setState = _b[1];
  useEffect(function () {
    if (state.isSetup === null) {
      axios
        .get('/v1/setup')
        .then(function (response) {
          window.localStorage.setItem('setup', JSON.stringify(response.data));
          setState(response.data);
        })
        .catch(console.error);
    }
  }, []);
  return React.createElement(
    SetupContext.Provider,
    {
      value: {
        setup: state,
        updateSetup: function (data) {
          setState(function (prevState) {
            var updatedState = __assign(__assign({}, prevState), data);
            window.localStorage.setItem('setup', JSON.stringify(data));
            return updatedState;
          });
        }
      }
    },
    children
  );
};
