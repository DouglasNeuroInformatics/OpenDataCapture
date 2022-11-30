import React from 'react';

import { useRouter } from 'next/router';

import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'next-i18next';
import Dropdown from 'react-bootstrap/Dropdown';

// import AuthContext from '@/store/AuthContext';

const UserDropdown = () => {
  // const authContext = useContext(AuthContext);
  const router = useRouter();
  const { t } = useTranslation('common');

  const logoutCurrentUser = () => {
    return;
    // authContext.setAuth((prevAuth) => ({ ...prevAuth, currentUser: null }));
  };

  console.log(router.pathname, router.basePath, router.locale);

  const changeLocale = () => {
    const { pathname, asPath, query } = router;
    void router.push({ pathname, query }, asPath, { locale: router.locale === 'en' ? 'fr' : 'en' });
  };

  return (
    <Dropdown>
      <Dropdown.Toggle className="d-flex align-items-center text-white text-decoration-none" variant="link">
        <UserCircleIcon className="me-2" height="32" width="32" />
        <strong>TBD</strong>
      </Dropdown.Toggle>
      <Dropdown.Menu className="text-small shadow" variant="dark">
        <Dropdown.Item as="button" onClick={changeLocale}>
          {t('changeLanguage')}
        </Dropdown.Item>
        <Dropdown.Item as="button" onClick={logoutCurrentUser}>
          {t('signOut')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserDropdown;
