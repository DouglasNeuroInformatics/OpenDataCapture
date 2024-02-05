import { Modal } from '@douglasneuroinformatics/ui';
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
        <p className="text-sm leading-tight">{t('demo.summary')}</p>
        <h5 className="my-3 text-lg font-semibold">{t('demo.availableUsers')}</h5>
        <ul className="-my-5 divide-y divide-slate-200">
          <li className="py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  alt=""
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">Leonard Krasner</p>
                <p className="truncate text-sm text-slate-700">@leonardkrasner</p>
              </div>
              <div>
                <a
                  className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50"
                  href="#"
                >
                  {' '}
                  View{' '}
                </a>
              </div>
            </div>
          </li>
        </ul>
        {/* {DEMO_USERS.map((user) => {
          const role = t(`basePermissionLevel.${snakeToCamelCase(user.basePermissionLevel!)}`, { ns: 'common' });
          return (
            <div className="my-5 leading-tight" key={user.username}>
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
        })} */}
      </div>
    </Modal>
  );
};
