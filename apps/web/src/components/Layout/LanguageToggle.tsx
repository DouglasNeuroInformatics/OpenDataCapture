import React from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/ui';
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

export const LanguageToggle = ({ onClick, ...props }: LanguageToggleProps) => {
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
    <button onClick={(e) => void handleClick(e)} {...props}>
      {inactiveLanguage ? languages[inactiveLanguage].nativeName : 'ERROR'}
    </button>
  );
};
