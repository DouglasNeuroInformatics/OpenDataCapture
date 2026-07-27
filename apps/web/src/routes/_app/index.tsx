import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  const { t } = useTranslation();
  return <div>{t({ en: 'Index', fr: 'Index' })}</div>;
};

export const Route = createFileRoute('/_app/')({
  component: RouteComponent
});
