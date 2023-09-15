import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
export var NavigationLink = function (_a) {
  var href = _a.href,
    label = _a.label,
    icon = _a.icon,
    access = _a.access,
    onClick = _a.onClick;
  var currentUser = useAuthStore().currentUser;
  // Whether the user has all permissions or access is undefined
  var isAuthorized = useMemo(
    function () {
      if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.ability)) {
        return false;
      }
      if (!access) {
        return true;
      }
      if (Array.isArray(access)) {
        for (var _i = 0, access_1 = access; _i < access_1.length; _i++) {
          var _a = access_1[_i],
            action = _a.action,
            subject = _a.subject;
          if (!currentUser.ability.can(action, subject)) {
            return false;
          }
        }
        return true;
      }
      return currentUser.ability.can(access.action, access.subject);
    },
    [currentUser]
  );
  return isAuthorized
    ? React.createElement(
        NavLink,
        { className: 'flex items-center p-2 text-sm hover:bg-slate-800 md:text-base', to: href, onClick: onClick },
        icon,
        React.createElement('span', { className: 'ml-2' }, label)
      )
    : null;
};
