import { Card, Checkbox, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { BrandingEditor } from '../hooks';

/** Top-level toggle: when off, the classic (unbranded) login page is shown. */
export const EnableBrandingCard = ({ editor }: { editor: BrandingEditor }) => {
  const { t } = useTranslation();
  const { form, update } = editor;
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          {t({ en: 'Enable Custom Login Page', fr: 'Activer la page de connexion personnalisée' })}
        </Card.Title>
        <Card.Description>
          {t({
            en: 'When disabled, the classic Open Data Capture login page is shown instead.',
            fr: "Lorsque désactivé, la page de connexion classique d'Open Data Capture est affichée."
          })}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={form.enableBranding}
            id="enableBranding"
            onCheckedChange={(checked) => update('enableBranding', checked === true)}
          />
          <Label className="cursor-pointer" htmlFor="enableBranding">
            {t({ en: 'Enable', fr: 'Activer' })}
          </Label>
        </div>
      </Card.Content>
    </Card>
  );
};
