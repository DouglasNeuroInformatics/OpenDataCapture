import React from 'react';

import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle } from 'react-icons/hi';

import { type Notification as NotificationInterface } from '@/stores/notifications-store';

export interface NotificationIconProps {
  type: NotificationInterface['type'];
}

export const NotificationIcon = ({ type }: NotificationIconProps) => {
  switch (type) {
    case 'info':
      return <HiInformationCircle aria-hidden="true" className="h-6 w-6 text-blue-500" />;
    case 'success':
      return <HiCheckCircle aria-hidden="true" className="h-6 w-6 text-green-500" />;
    case 'warning':
      return <HiExclamationCircle aria-hidden="true" className="h-6 w-6 text-yellow-500" />;
    case 'error':
      return <HiXCircle aria-hidden="true" className="h-6 w-6 text-red-500" />;
  }
};
