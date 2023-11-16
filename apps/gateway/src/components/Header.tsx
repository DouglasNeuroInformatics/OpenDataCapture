'use client';

import { Navbar } from '@open-data-capture/react-core/components/Navbar';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { i18n } = useTranslation();
  return <Navbar i18n={i18n} />;
};
