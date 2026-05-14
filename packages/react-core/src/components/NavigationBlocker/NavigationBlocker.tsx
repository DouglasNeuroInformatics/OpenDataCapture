import React, { memo } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

let useBlocker: null | typeof import('@tanstack/react-router').useBlocker;

try {
  useBlocker = (await import('@tanstack/react-router')).useBlocker ?? null;
} catch {
  useBlocker = null;
}

type NavigationBlockerProps = {
  active: boolean;
  message: string;
};

export const NavigationBlocker = memo<NavigationBlockerProps>(function NavigationBlocker({ active, message }) {
  const blocker = useBlocker?.({
    enableBeforeUnload: true,
    shouldBlockFn: () => active,
    withResolver: true
  });
  const { t } = useTranslation();

  if (!blocker) {
    return null;
  }

  return (
    <Dialog open={blocker.status === 'blocked'}>
      <Dialog.Content data-testid="blocker-dialog" onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2">{t({ en: 'Warning', fr: 'Avertissement' })}</Dialog.Title>
          <Dialog.Description>{message}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button className="min-w-16" type="button" variant="outline" onClick={blocker.proceed}>
            {t('libui.yes')}
          </Button>
          <Button className="min-w-16" type="button" variant="primary" onClick={blocker.reset}>
            {t('libui.no')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
});
