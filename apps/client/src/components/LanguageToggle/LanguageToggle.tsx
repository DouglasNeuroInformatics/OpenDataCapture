import React from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/react-components';
import i18next from 'i18next';

const languages = {
  en: {
    nativeName: 'English'
  },
  fr: {
    nativeName: 'Français'
  }
};

interface LanguageToggleProps extends React.ComponentPropsWithoutRef<'button'> {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const LanguageToggle = ({ onClick, ...props }: LanguageToggleProps) => {
  const notifications = useNotificationsStore();

  const inactiveLanguage = Object.keys(languages).find((l) => l !== i18next.resolvedLanguage) as
    | keyof typeof languages
    | undefined;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
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
    <button onClick={handleClick} {...props}>
      {inactiveLanguage ? languages[inactiveLanguage].nativeName : 'ERROR'}
    </button>
  );
};
