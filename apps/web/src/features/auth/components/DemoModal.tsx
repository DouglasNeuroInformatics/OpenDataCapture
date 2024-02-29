import { Card, Modal } from '@douglasneuroinformatics/ui/legacy';
import { snakeToCamelCase } from '@douglasneuroinformatics/utils';
import type { LoginCredentials } from '@open-data-capture/common/auth';
import { DEMO_USERS } from '@open-data-capture/demo';
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
      <div className="my-1">
        <p className="text-sm leading-tight text-slate-700 dark:text-slate-300">{t('demo.summary')}</p>
        <div className="my-3">
          <h5 className="font-semibold">{t('demo.availableUsers')}</h5>
          <p className="text-sm leading-tight text-slate-700 dark:text-slate-300">{t('demo.pleaseSelectUser')}</p>
        </div>
        <Card className="-mx-1 divide-y divide-slate-200 dark:divide-slate-600">
          {DEMO_USERS.map((user) => (
            <div className="flex items-center space-x-4 px-2 py-3" key={user.username}>
              <div className="min-w-0 flex-1 text-slate-700 dark:text-slate-300">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{`${user.firstName} ${user.lastName}`}</p>
                <p className="text-sm">
                  {t('demo.role', {
                    value: t(`basePermissionLevel.${snakeToCamelCase(user.basePermissionLevel!)}`, { ns: 'common' })
                  })}
                </p>
                <p className="text-sm">{t('demo.groups', { value: user.groupNames.join(', ') })}</p>
              </div>
              <div>
                <LoginButton onClick={() => onLogin({ password: user.password, username: user.username })} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </Modal>
  );
};
