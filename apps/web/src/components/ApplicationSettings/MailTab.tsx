import { MailSettings } from '@/components/MailSettings';
import { useMailSettingsQuery } from '@/hooks/useMailSettingsQuery';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';

export const MailTab = () => {
  const { data: settings } = useMailSettingsQuery();
  const { data: setupState } = useSetupStateQuery();

  return (
    <div className="flex flex-col gap-6">
      <MailSettings
        activeLanguages={setupState.activeLanguages}
        config={settings.config}
        newUserEmailTemplate={settings.newUserEmailTemplate}
      />
    </div>
  );
};
