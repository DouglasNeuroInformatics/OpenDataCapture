import { useTranslation } from 'react-i18next';

import { Editor, type EditorFile } from '@/components/Editor';
import { PageHeader } from '@/components/PageHeader';

import { useFormsQuery } from '../hooks/useFormsQuery';

export const ManageInstrumentsPage = () => {
  const { t } = useTranslation('instruments');
  const query = useFormsQuery();

  const files: EditorFile[] | null =
    query.data?.map((form) => ({
      content: form.source,
      path: `${form.name}.ts`
    })) ?? null;

  return (
    <div className="flex flex-grow flex-col">
      <PageHeader title={t('manage.title')} />
      {files && <Editor files={files} />}
    </div>
  );
};
