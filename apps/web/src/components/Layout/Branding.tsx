import { useTranslation } from 'react-i18next';

import logo from '@/assets/logo.png';

export type BrandingProps = {
  showText?: boolean;
};

export const Branding = ({ showText = true }: BrandingProps) => {
  const { t } = useTranslation('layout');

  return (
    <div className="flex items-center p-1 md:p-2">
      <img alt="logo" className="mr-3 w-14 md:w-16" src={logo} />
      {showText && (
        <span className="font-bold leading-tight tracking-tight subpixel-antialiased">{t('branding.title')}</span>
      )}
    </div>
  );
};
