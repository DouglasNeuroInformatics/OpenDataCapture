import React from 'react';

import { Modal } from '@douglasneuroinformatics/ui';
import { snakeToCamelCase } from '@douglasneuroinformatics/utils';
import { demoUsers } from '@open-data-capture/demo';
import { useTranslation } from 'react-i18next';

export type DemoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal showCloseButton open={isOpen} title={t('demo.info')} width="xl" onClose={onClose}>
      <div className="my-3">
        <p className="leading-tight">{t('demo.summary')}</p>
        <h5 className="my-3 text-lg font-semibold">{t('demo.loginCredentials')}</h5>
        {demoUsers.map((user) => {
          const role = t(`basePermissionLevel.${snakeToCamelCase(user.basePermissionLevel!)}`);
          return (
            <div className="my-3 leading-tight" key={user.username}>
              <p>{t('demo.username', { value: user.username })}</p>
              <p>{t('demo.password', { value: user.password })}</p>
              <p>{t('demo.role', { value: role })}</p>
              <p>{t('demo.groups', { value: user.groupNames.join(', ') })}</p>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
