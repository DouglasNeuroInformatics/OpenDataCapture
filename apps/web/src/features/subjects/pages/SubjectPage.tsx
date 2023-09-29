import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';

const TabLink = ({ label, pathname }: { label: string; pathname: string }) => (
  <NavLink
    end
    className={({ isActive }) =>
      clsx(
        'flex-grow border-b px-1 py-4 text-center font-medium',
        isActive ? 'border-sky-500 text-slate-900 dark:text-slate-100' : 'border-slate-300'
      )
    }
    to={pathname}
  >
    {label}
  </NavLink>
);

export const SubjectPage = () => {
  const params = useParams();
  const { t } = useTranslation();

  const subjectIdentifier = params.subjectIdentifier!;
  const basePathname = `/subjects/view-subjects/${subjectIdentifier}`;

  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${subjectIdentifier.slice(0, 7)}`} />
      <div className="mb-5 flex">
        <TabLink label="Overview" pathname={basePathname} />
        <TabLink label="Records Table" pathname={`${basePathname}/table`} />
        <TabLink label="Records Graph" pathname={`${basePathname}/graph`} />
      </div>
      <Outlet />
    </div>
  );
};

export default SubjectPage;
