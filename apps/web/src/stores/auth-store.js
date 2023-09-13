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
import { createMongoAbility } from '@casl/ability';
import jwtDecode from 'jwt-decode';
import { create } from 'zustand';
import { useActiveSubjectStore } from './active-subject-store';
export var useAuthStore = create(function (set) {
  return {
    accessToken: null,
    setAccessToken: function (accessToken) {
      var _a = jwtDecode(accessToken),
        permissions = _a.permissions,
        groups = _a.groups,
        rest = __rest(_a, ['permissions', 'groups']);
      var ability = createMongoAbility(permissions);
      set({
        accessToken: accessToken,
        currentUser: __assign({ ability: ability, groups: groups }, rest),
        currentGroup: groups[0]
      });
    },
    currentUser: null,
    currentGroup: null,
    setCurrentGroup: function (group) {
      set({ currentGroup: group });
    },
    logout: function () {
      useActiveSubjectStore.setState({ activeSubject: null });
      set({ accessToken: null, currentUser: null });
    }
  };
});
