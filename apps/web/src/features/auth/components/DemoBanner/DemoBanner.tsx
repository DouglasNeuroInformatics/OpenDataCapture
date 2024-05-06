import React from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Card, Dialog, Table, Tooltip } from '@douglasneuroinformatics/libui/components';
import { DEMO_USERS } from '@opendatacapture/demo';
import type { LoginCredentials } from '@opendatacapture/schemas/auth';
import { InfoIcon, LogInIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type DemoBannerProps = {
  onLogin: (credentials: LoginCredentials) => void;
};

export const DemoBanner = ({ onLogin }: DemoBannerProps) => {
  const { t } = useTranslation(['auth', 'common']);
  return (
    <Dialog>
      <div className="flex w-full items-center justify-center bg-sky-700 leading-tight text-white">
        <div className="container py-1.5">
          <div className="flex flex-col items-center justify-between lg:flex-row">
            <div className="my-1 flex items-center gap-3">
              <InfoIcon className="hidden h-5 w-5 lg:block" />
              <p className="text-center text-sm font-medium lg:text-left">{t('demo.welcome')}</p>
            </div>
            <Dialog.Trigger asChild>
              <button
                className="my-1.5 w-full max-w-md rounded-md border border-sky-400 px-2.5 py-1.5 text-sm font-medium hover:bg-sky-600 hover:shadow-lg lg:w-auto"
                type="button"
              >
                {t('demo.learnMore')}
              </button>
            </Dialog.Trigger>
          </div>
        </div>
      </div>
      <Dialog.Content
        className="w-full max-w-[600px] px-2.5 sm:px-6"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <Dialog.Header className="w-full whitespace-break-spaces px-1">
          <Dialog.Title className="mb-2">{t('demo.info')}</Dialog.Title>
          <Dialog.Description className="text-pretty text-left text-xs sm:text-sm">
            {t('demo.summary')}
          </Dialog.Description>
        </Dialog.Header>
        <Card className="text-muted-foreground w-full overflow-hidden rounded-md text-xs tracking-tighter sm:tracking-tight">
          <Table className="overflow-x-scroll">
            <Table.Header>
              <Table.Row>
                <Table.Head className="text-foreground p-3 px-2.5 text-xs sm:px-3.5 sm:text-sm">
                  {t('auth:demo.username')}
                </Table.Head>
                <Table.Head className="text-foreground p-3 px-2.5 text-xs sm:px-3.5 sm:text-sm">
                  {t('auth:demo.groups')}
                </Table.Head>
                <Table.Head className="text-foreground p-3 px-2.5 text-xs sm:px-3.5 sm:text-sm">
                  {t('auth:demo.role')}
                </Table.Head>
                <Table.Head className="text-foreground p-3 px-2.5 text-xs sm:px-3.5 sm:text-sm"></Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {DEMO_USERS.map((user) => (
                <Table.Row key={user.username}>
                  <Table.Cell className="p-3 px-2.5 text-xs sm:px-3.5 sm:text-sm">{user.username}</Table.Cell>
                  <Table.Cell className="p-3 px-2.5 text-xs sm:px-3.5 sm:text-sm">
                    {user.groupNames.map((name) => (
                      <p className="whitespace-nowrap" key={name}>
                        {name}
                      </p>
                    ))}
                  </Table.Cell>
                  <Table.Cell className="p-3 px-2.5 text-xs sm:px-3.5 sm:text-sm">
                    {t(`common:basePermissionLevel.${snakeToCamelCase(user.basePermissionLevel!)}`)}
                  </Table.Cell>
                  <Table.Cell className="p-3 px-2.5 sm:px-3.5">
                    <Tooltip delayDuration={500}>
                      <Tooltip.Trigger
                        className="h-9 w-9"
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => onLogin({ password: user.password, username: user.username })}
                      >
                        <LogInIcon />
                      </Tooltip.Trigger>
                      <Tooltip.Content side="bottom">
                        <p>{t('demo.useCredentials')}</p>
                      </Tooltip.Content>
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </Dialog.Content>
    </Dialog>
  );
};
