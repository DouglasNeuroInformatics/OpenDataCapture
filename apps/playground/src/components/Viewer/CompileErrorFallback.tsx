import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentErrorFallbackProps } from '@opendatacapture/react-core';
import { InstrumentErrorFallback } from '@opendatacapture/react-core';

export const CompileErrorFallback = (props: Omit<InstrumentErrorFallbackProps, 'title'>) => {
  const { t } = useTranslation();
  return <InstrumentErrorFallback title={t({ en: 'Failed to Compile', fr: 'Échec de la compilation' })} {...props} />;
};
