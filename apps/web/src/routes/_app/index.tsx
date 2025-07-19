import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>Index</div>;
};

export const Route = createFileRoute('/_app/')({
  component: RouteComponent
});
