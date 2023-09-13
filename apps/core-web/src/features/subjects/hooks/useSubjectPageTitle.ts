import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function useSubjectPageTitle() {
  const params = useParams();
  const { t } = useTranslation();
  return `${t('subjectPage.pageTitle')}: ${params.subjectIdentifier!.slice(0, 6)}`;
}
