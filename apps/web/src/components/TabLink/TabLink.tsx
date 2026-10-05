import { cn } from '@douglasneuroinformatics/libui/utils';
import { Link, useLocation } from '@tanstack/react-router';

type TabLinkProps = {
  label: string;
  pathname: string;
  testId?: string;
};

export const TabLink = ({ label, pathname, testId }: TabLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(pathname);
  return (
    <Link
      className={cn(
        'grow border-b px-1 py-3 text-center font-medium',
        isActive ? 'border-sky-500 text-slate-900 dark:text-slate-100' : 'border-slate-300 dark:border-slate-700'
      )}
      data-nav-url={pathname}
      data-spotlight-type="tab-link"
      data-testid={testId}
      // The instrument hub keeps its filters in the search params so both tabs describe one set;
      // navigating without this drops them, and the newly mounted tab silently widens the selection.
      search={true}
      to={pathname}
    >
      {label}
    </Link>
  );
};
