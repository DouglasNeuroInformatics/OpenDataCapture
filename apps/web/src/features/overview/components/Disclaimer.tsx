import { Button, Modal } from '@douglasneuroinformatics/ui/legacy';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { useDisclaimerStore } from '../stores/disclaimer-store';

export type DisclaimerProps = {
  isRequired: boolean;
};

export const Disclaimer = ({ isRequired = import.meta.env.PROD }: DisclaimerProps) => {
  const { currentUser, logout } = useAuthStore();
  const { isAccepted, setIsAccepted, username } = useDisclaimerStore();
  const { t } = useTranslation('overview');

  const handleClose = () => {
    setIsAccepted(true, currentUser!.username);
  };

  const show = (!isAccepted || currentUser?.username !== username) && isRequired;

  return (
    <Modal open={show} title={t('disclaimer.title')} onClose={handleClose}>
      <p className="text-sm">{t('disclaimer.message')}</p>
      <div className="mt-3 flex">
        <Button className="mr-2" label={t('disclaimer.accept')} size="sm" onClick={handleClose} />
        <Button
          label={t('disclaimer.decline')}
          size="sm"
          variant="secondary"
          onClick={() => {
            logout();
          }}
        />
      </div>
    </Modal>
  );
};
