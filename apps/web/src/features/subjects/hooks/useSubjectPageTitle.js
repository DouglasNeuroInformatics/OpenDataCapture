import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
export function useSubjectPageTitle() {
  var params = useParams();
  var t = useTranslation().t;
  return ''.concat(t('subjectPage.pageTitle'), ': ').concat(params.subjectIdentifier.slice(0, 6));
}
