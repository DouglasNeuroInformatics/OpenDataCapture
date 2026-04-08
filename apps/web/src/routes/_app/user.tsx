import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { UserIcon } from '@/components/UserIcon';
import { useAppStore } from '@/store';

const RouteComponent = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();

  let fullName: string;
  if (currentUser?.firstName && currentUser.lastName) {
    fullName = `${currentUser.firstName} ${currentUser.lastName}`;
  } else if (currentUser?.firstName) {
    fullName = currentUser.firstName;
  } else {
    fullName = 'Unnamed User';
  }

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'User Info',
            fr: 'Informations utilisateur'
          })}
        </Heading>
      </PageHeader>
      <div className="mt-4 flex flex-col items-center justify-center">
        <UserIcon className="h-16 w-16" />
        <Heading variant="h2">{fullName}</Heading>
        <p className="text-sm">{currentUser?.username ?? fullName}</p>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/user')({
  component: RouteComponent
});
