import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/datahub/instruments/$instrumentId/')({
  beforeLoad: ({ params, search }) => {
    throw redirect({ params, search, to: '/datahub/instruments/$instrumentId/table' });
  }
});
