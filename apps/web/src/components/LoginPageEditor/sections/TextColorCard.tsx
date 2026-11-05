import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { InstanceCard } from '@/components/InstanceCard';

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
    <InstanceCard>
      <InstanceCard.Header>
        <InstanceCard.Title>
          {t({
            en: 'Text Color - Left Panel',
            es: 'Color del texto: panel izquierdo',
            fr: 'Couleur du texte - Panneau gauche'
          })}
        </InstanceCard.Title>
        <InstanceCard.Description>
          {t({
            en: 'The color applied to all text on the branding panel.',
            es: 'El color aplicado a todo el texto del panel de marca.',
            fr: 'La couleur appliquée à tout le texte du panneau.'
          })}
        </InstanceCard.Description>
      </InstanceCard.Header>
      <InstanceCard.Content>
        <div className="sm:max-w-xs">
          <ColorField
            id="panelTextColor"
            label={t({ en: 'Text color', es: 'Color del texto', fr: 'Couleur du texte' })}
            placeholder={DEFAULT_PANEL_TEXT_COLOR}
            swatchFallback={DEFAULT_PANEL_TEXT_COLOR}
            value={form.panelTextColor}
            onChange={(v) => update('panelTextColor', v)}
          />
        </div>
      </InstanceCard.Content>
    </InstanceCard>
  );
};
