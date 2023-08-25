import React from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import i18next from 'i18next';

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
} & React.ComponentPropsWithoutRef<'button'>

export const LanguageToggle = ({ onClick, ...props }: LanguageToggleProps) => {
  const notifications = useNotificationsStore();

  const inactiveLanguage = Object.keys(languages).find((l) => l !== i18next.resolvedLanguage) as
    | keyof typeof languages
    | undefined;

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await i18next.changeLanguage(inactiveLanguage);
    } catch (error) {
      console.error(error);
      notifications.addNotification({ type: 'error', message: 'Failed to change languages' });
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
