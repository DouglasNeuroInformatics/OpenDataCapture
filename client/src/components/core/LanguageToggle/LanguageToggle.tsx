import React from 'react';

import i18next from 'i18next';

const languages = {
  en: {
    nativeName: 'English'
  },
  fr: {
    nativeName: 'Français'
  }
};

export const LanguageToggle = ({ onClick, ...props }: React.ComponentPropsWithoutRef<'button'>) => {
  const inactiveLanguage = Object.keys(languages).find((l) => l !== i18next.resolvedLanguage) as
    | keyof typeof languages
    | undefined;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
    try {
      await i18next.changeLanguage(inactiveLanguage);
    } catch (error) {
      console.error(error);
      alert('An error occurred while attempting to change languages!');
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

