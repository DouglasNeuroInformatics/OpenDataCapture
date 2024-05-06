import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';

import { UserIcon } from '@/components/UserIcon';
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
    <div className="mt-4 flex flex-col items-center justify-center">
      <UserIcon className="h-16 w-16" />
      <Heading variant="h2">{fullName}</Heading>
      <p className="text-sm">{fullName}</p>
    </div>
  );
};
