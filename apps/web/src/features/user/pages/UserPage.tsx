import React from 'react';

import { UserCircleIcon } from '@heroicons/react/24/solid';

import { useAppStore } from '@/store';

export const UserPage = () => {
  const currentUser = useAppStore((store) => store.currentUser);

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
      <UserCircleIcon className="h-20 w-20" />
      <h1 className="mt-2 text-3xl font-bold">{fullName}</h1>
      <h3>{currentUser?.username}</h3>
    </div>
  );
};
