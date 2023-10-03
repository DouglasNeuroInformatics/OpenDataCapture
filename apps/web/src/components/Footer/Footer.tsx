import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

const DOC_URL = import.meta.env.VITE_DOCS_URL;
const LICENSE_URL = import.meta.env.VITE_LICENSE_URL;
const GITHUB_REPO_URL = import.meta.env.VITE_GITHUB_REPO_URL;

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="container py-3 text-slate-600 dark:text-slate-300 print:hidden">
      <hr className="my-4 border-slate-200 dark:border-slate-700 print:hidden" />
      <div className="flex items-center justify-center">
        <div className="mb-3 flex flex-row flex-wrap lg:flex-nowrap">
          <div className="flex w-1/2 items-center justify-center lg:w-auto">
            <a
              className="underline-offset-3 p-1 text-center text-sm hover:underline lg:mx-2 xl:text-base"
              href={DOC_URL}
              rel="noreferrer"
              target="_blank"
            >
              {t('footer.documentation')}
            </a>
          </div>
          <div className="flex w-1/2 items-center justify-center lg:w-auto">
            <a
              className="underline-offset-3 p-1 text-center text-sm hover:underline lg:mx-2 xl:text-base"
              href={LICENSE_URL}
              rel="noreferrer"
              target="_blank"
            >
              {t('footer.license')}
            </a>
          </div>
          <div className="flex w-1/2 items-center justify-center lg:w-auto">
            <a
              className="underline-offset-3 p-1 text-center text-sm hover:underline lg:mx-2 xl:text-base"
              href={GITHUB_REPO_URL}
              rel="noreferrer"
              target="_blank"
            >
              {t('footer.sourceCode')}
            </a>
          </div>
          <div className="flex w-1/2 items-center justify-center lg:w-auto">
            <Link
              className="underline-offset-3 p-1 text-center text-sm hover:underline lg:mx-2 xl:text-base"
              to="/contact"
            >
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
      <p className="text-center text-sm">
        &copy; {CURRENT_YEAR} {t('organization.name')}
      </p>
    </footer>
  );
};
