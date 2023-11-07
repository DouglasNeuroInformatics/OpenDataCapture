import { useTranslation } from 'react-i18next';

export const EditorEmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-grow flex-col items-center justify-center text-center">
      <h3 className="font-medium text-slate-900 dark:text-slate-100">{t('editor.noFileSelected')}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t('editor.pleaseSelectFile')}</p>
    </div>
  );
};
