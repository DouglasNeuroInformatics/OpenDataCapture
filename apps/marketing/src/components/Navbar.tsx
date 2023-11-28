import { Navbar as CoreNavbar } from '@open-data-capture/react-core/components/Navbar';

import { useTranslations } from '@/i18n';

type NavbarProps = {
  url: URL;
};

const Navbar = ({ url }: NavbarProps) => {
  const { resolvedLanguage, translatePath, t } = useTranslations(url);
  return (
    <CoreNavbar
      i18n={{
        changeLanguage: (lang) => {
          window.location.assign(`/${lang}`);
        },
        resolvedLanguage
      }}
      items={[
        {
          id: translatePath('/'),
          label: t('landing.title')
        },
        {
          id: translatePath('/docs'),
          label: t('docs.title')
        },
        {
          id: translatePath('/team'),
          label: t('team.title')
        },
        {
          id: translatePath('/blog'),
          label: t('blog.title')
        }
      ]}
      onNavigate={(id) => window.location.assign(id)}
    />
  );
};

export default Navbar;
