import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { RefreshCwIcon } from 'lucide-react';

import { useAppStore } from '@/store';

import { ActionButton } from '../ActionButton';

export const RefreshButton = () => {
  const onClick = useAppStore((store) => store.viewer.forceRefresh);
  const { t } = useTranslation();
  return <ActionButton icon={<RefreshCwIcon />} tooltip={t({ en: 'Refresh', fr: 'Actualiser' })} onClick={onClick} />;
};
