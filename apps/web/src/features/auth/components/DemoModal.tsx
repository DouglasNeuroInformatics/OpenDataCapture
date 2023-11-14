import { Modal } from '@douglasneuroinformatics/ui';
import { snakeToCamelCase } from '@douglasneuroinformatics/utils';
import type { LoginCredentials } from '@open-data-capture/common/auth';
import { demoUsers } from '@open-data-capture/demo';
import { useTranslation } from 'react-i18next';

import { LoginButton } from './LoginButton';

export type DemoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: LoginCredentials) => void;
};

export const DemoModal = ({ isOpen, onClose, onLogin }: DemoModalProps) => {
  const { t } = useTranslation(['auth', 'common']);
  return (
    <Modal showCloseButton open={isOpen} title={t('demo.info')} width="xl" onClose={onClose}>
      <div className="my-3">
        <p className="text-sm leading-tight">{t('demo.summary')}</p>
        <h5 className="my-3 text-lg font-semibold">{t('demo.loginCredentials')}</h5>
        {demoUsers.map((user) => {
          const role = t(`basePermissionLevel.${snakeToCamelCase(user.basePermissionLevel!)}`, { ns: 'common' });
          return (
            <div className="my-3 leading-tight" key={user.username}>
              <div className="mb-1 flex items-center gap-2">
                <h5 className="font-medium">{`${user.firstName} ${user.lastName}`}</h5>
                <LoginButton
                  onClick={() => {
                    onLogin({ password: user.password, username: user.username });
                  }}
                />
              </div>
              <div className="text-sm">
                <p>{t('demo.username', { value: user.username })}</p>
                <p>{t('demo.password', { value: user.password })}</p>
                <p>{t('demo.role', { value: role })}</p>
                <p>{t('demo.groups', { value: user.groupNames.join(', ') })}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
