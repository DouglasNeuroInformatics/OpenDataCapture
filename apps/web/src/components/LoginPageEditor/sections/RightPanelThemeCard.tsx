import { Card } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { getRightPanelGradient } from '@/utils/branding';

import { RIGHT_PANEL_LABELS, RIGHT_PANEL_OPTIONS } from '../constants';
import { ColorField } from '../fields/ColorField';
import { SwatchButton } from '../fields/SwatchButton';

import type { BrandingEditor } from '../useBrandingForm';

/** Right-panel background gradient: a theme swatch grid plus custom hex inputs. */
export const RightPanelThemeCard = ({ editor }: { editor: BrandingEditor }) => {
  const { t } = useTranslation();
  const { form, update } = editor;
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          {t({ en: 'Background Theme - Right Panel', fr: "Thème d'arrière-plan - Panneau droit" })}
        </Card.Title>
        <Card.Description>
          {t({
            en: 'The gradient applied behind the login form.',
            fr: 'Le dégradé appliqué derrière le formulaire de connexion.'
          })}
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RIGHT_PANEL_OPTIONS.map((option) => {
            const swatchStyle =
              option === 'none'
                ? { backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0 0 8px, #cbd5e1 8px 16px)' }
                : {
                    backgroundImage: getRightPanelGradient({
                      rightPanelTheme: option,
                      ...(option === 'custom'
                        ? {
                            rightPanelPrimaryColor: form.rightPanelPrimaryColor,
                            rightPanelSecondaryColor: form.rightPanelSecondaryColor
                          }
                        : {})
                    })!
                  };
            return (
              <SwatchButton
                isSelected={form.rightPanelOption === option}
                key={option}
                label={t(RIGHT_PANEL_LABELS[option])}
                style={swatchStyle}
                onClick={() => update('rightPanelOption', option)}
              />
            );
          })}
        </div>
        {form.rightPanelOption === 'custom' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              id="rightPanelPrimaryColor"
              label={t({ en: 'Gradient Start', fr: 'Début du dégradé' })}
              swatchFallback="#ffffff"
              value={form.rightPanelPrimaryColor}
              onChange={(v) => update('rightPanelPrimaryColor', v)}
            />
            <ColorField
              id="rightPanelSecondaryColor"
              label={t({ en: 'Gradient End', fr: 'Fin du dégradé' })}
              swatchFallback="#ffffff"
              value={form.rightPanelSecondaryColor}
              onChange={(v) => update('rightPanelSecondaryColor', v)}
            />
          </div>
        )}
      </Card.Content>
    </Card>
  );
};
