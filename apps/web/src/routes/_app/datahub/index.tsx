import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/datahub/')({
  beforeLoad: () => {
    throw redirect({ to: '/datahub/subjects' });
  }
});
