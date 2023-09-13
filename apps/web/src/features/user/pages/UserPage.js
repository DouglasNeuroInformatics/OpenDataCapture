import React from 'react';
import { HiUserCircle } from 'react-icons/hi2';
import { useAuthStore } from '@/stores/auth-store';
export var UserPage = function () {
  var currentUser = useAuthStore().currentUser;
  var fullName;
  if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName) && currentUser.lastName) {
    fullName = ''.concat(currentUser.firstName, ' ').concat(currentUser.lastName);
  } else if (currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName) {
    fullName = currentUser.firstName;
  } else {
    fullName = 'Unnamed User';
  }
  return React.createElement(
    'div',
    { className: 'flex flex-col items-center justify-center' },
    React.createElement(HiUserCircle, { className: 'h-20 w-20' }),
    React.createElement('h1', { className: 'mt-2 text-3xl font-bold' }, fullName),
    React.createElement('h3', null, currentUser === null || currentUser === void 0 ? void 0 : currentUser.username)
  );
};
export default UserPage;
