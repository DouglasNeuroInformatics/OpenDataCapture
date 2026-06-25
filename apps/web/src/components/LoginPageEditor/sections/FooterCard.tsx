import { Card, Checkbox, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { BrandingEditor } from '../hooks';

/** Toggles the GitHub / documentation links shown in the login page footer. */
export const FooterCard = ({ editor }: { editor: BrandingEditor }) => {
  const { t } = useTranslation();
  const { form, update } = editor;
  return (
    <Card>
      <Card.Header>
        <Card.Title>{t({ en: 'Footer', fr: 'Pied de page' })}</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={form.showFooterLinks}
            id="showFooterLinks"
            onCheckedChange={(checked) => update('showFooterLinks', checked === true)}
          />
          <Label className="cursor-pointer" htmlFor="showFooterLinks">
            {t({ en: 'Show GitHub and documentation links', fr: 'Afficher les liens GitHub et documentation' })}
          </Label>
        </div>
      </Card.Content>
    </Card>
  );
};
