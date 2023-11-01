import React from 'react';

import { useFormQuery } from '../../hooks/useFormQuery';

const Editor = React.lazy(() => import('@/components/Editor').then(({ Editor }) => ({ default: Editor })));

export const InstrumentEditor = () => {
  const form = useFormQuery('653ff2291238677770b5a68b');

  if (!form.data) {
    return null;
  }

  return <Editor value={form.data.source} />;
};
