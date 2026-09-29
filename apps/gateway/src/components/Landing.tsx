import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

const Landing: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex grow flex-col items-center justify-center gap-4 text-center" data-testid="gateway-landing">
      <Heading variant="h2">
        {t({
          en: 'Welcome',
          es: 'Bienvenido',
          fr: 'Bienvenue'
        })}
      </Heading>
      <p className="text-muted-foreground max-w-prose">
        {t({
          en: 'This site is where you complete questionnaires assigned to you on Open Data Capture. To begin, open the secure link you were sent.',
          es: 'En este sitio puede completar los cuestionarios que se le han asignado en Open Data Capture. Para comenzar, abra el enlace seguro que se le envió.',
          fr: 'Ce site vous permet de compléter les questionnaires qui vous ont été assignés sur Open Data Capture. Pour commencer, ouvrez le lien sécurisé qui vous a été envoyé.'
        })}
      </p>
    </div>
  );
};

export default Landing;
