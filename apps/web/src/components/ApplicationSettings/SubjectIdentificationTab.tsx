import { SubjectIdentificationSettingsForm } from '@/components/SubjectIdentificationSettingsForm';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useSubjectIdentificationSettingsQuery } from '@/hooks/useSubjectIdentificationSettingsQuery';

export const SubjectIdentificationTab = () => {
  const { data: settings } = useSubjectIdentificationSettingsQuery();
  const { data: setupState } = useSetupStateQuery();

  return <SubjectIdentificationSettingsForm activeLanguages={setupState.activeLanguages} settings={settings} />;
};
