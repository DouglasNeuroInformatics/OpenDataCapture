import React from 'react';

import { cn, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { LanguageIcon } from '@heroicons/react/24/solid';
import type { Language } from '@open-data-capture/common/core';
import { useTranslation } from 'react-i18next';

const languages = {
  en: {
    nativeName: 'English'
  },
  fr: {
    nativeName: 'Français'
  }
};

type LanguageToggleProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & React.ComponentPropsWithoutRef<'button'>;

export const LanguageToggle = ({ className, onClick, ...props }: LanguageToggleProps) => {
  const notifications = useNotificationsStore();
  const { i18n, t } = useTranslation('common');

  const inactiveLanguage = Object.keys(languages).find((l) => l !== i18n.resolvedLanguage) as Language | undefined;

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await i18n.changeLanguage(inactiveLanguage);
    } catch (error) {
      console.error(error);
      notifications.addNotification({ message: t('errors.failedToChangeLanguage'), type: 'error' });
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button className={cn('flex items-center', className)} onClick={(e) => void handleClick(e)} {...props}>
      <LanguageIcon className="mr-2" height={16} width={16} />
      {inactiveLanguage ? languages[inactiveLanguage].nativeName : 'ERROR'}
    </button>
  );
};
