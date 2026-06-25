import { Card } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { DEFAULT_PANEL_TEXT_COLOR } from '../constants';
import { ColorField } from '../fields/ColorField';

import type { BrandingEditor } from '../hooks';

/**
 * A single color applied to every text element on the branding panel. Shown
 * directly (no enable toggle) pre-filled with the default light color, so an
 * admin can just tweak it. An invalid hex disables Save.
 */
export const TextColorCard = ({ editor }: { editor: BrandingEditor }) => {
  const { t } = useTranslation();
  const { form, update } = editor;
  return (
    <Card>
      <Card.Header>
        <Card.Title>{t({ en: 'Text Color - Left Panel', fr: 'Couleur du texte - Panneau gauche' })}</Card.Title>
        <Card.Description>
          {t({
            en: 'The color applied to all text on the branding panel.',
            fr: 'La couleur appliquée à tout le texte du panneau.'
          })}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="sm:max-w-xs">
          <ColorField
            id="panelTextColor"
            label={t({ en: 'Text color', fr: 'Couleur du texte' })}
            placeholder={DEFAULT_PANEL_TEXT_COLOR}
            swatchFallback={DEFAULT_PANEL_TEXT_COLOR}
            value={form.panelTextColor}
            onChange={(v) => update('panelTextColor', v)}
          />
        </div>
      </Card.Content>
    </Card>
  );
};
