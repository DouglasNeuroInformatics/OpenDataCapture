import React from 'react';

import { HiUserCircle } from 'react-icons/hi2';

import { useAuthStore } from '@/stores/auth-store';

export const UserPage = () => {
  const { currentUser } = useAuthStore();

  let fullName: string;
  if (currentUser?.firstName && currentUser.lastName) {
    fullName = `${currentUser.firstName} ${currentUser.lastName}`;
  } else if (currentUser?.firstName) {
    fullName = currentUser.firstName;
  } else {
    fullName = 'Unnamed User';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <HiUserCircle className="h-20 w-20" />
      <h1 className="mt-2 text-3xl font-bold">{fullName}</h1>
      <h3>{currentUser?.username}</h3>
    </div>
  );
};

export default UserPage;
