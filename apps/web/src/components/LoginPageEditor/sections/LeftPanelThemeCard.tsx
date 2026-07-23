import { Card } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { LOGIN_THEMES } from '@opendatacapture/schemas/setup';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';

import { getLoginGradient } from '@/utils/branding';

import { THEME_LABELS } from '../constants';
import { ColorField } from '../fields/ColorField';
import { SwatchButton } from '../fields/SwatchButton';

import type { BrandingEditor } from '../hooks';

/** Left-panel background gradient: a theme swatch grid plus custom hex inputs. */
export const LeftPanelThemeCard = ({ editor }: { editor: BrandingEditor }) => {
  const { t } = useTranslation();
  const { form, update } = editor;
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          {t({
            en: 'Background Theme - Left Panel',
            es: 'Tema de fondo - Panel izquierdo',
            fr: "Thème d'arrière-plan - Panneau gauche"
          })}
        </Card.Title>
        <Card.Description>
          {t({
            en: 'The gradient shown behind the branding panel.',
            es: 'El degradado que se muestra detrás del panel de marca.',
            fr: 'Le dégradé affiché derrière le panneau.'
          })}
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LOGIN_THEMES.map((theme) => {
            const swatchBranding: BrandingConfig =
              theme === 'custom'
                ? {
                    customPrimaryColor: form.customPrimaryColor,
                    customSecondaryColor: form.customSecondaryColor,
                    loginTheme: 'custom'
                  }
                : { loginTheme: theme };
            return (
              <SwatchButton
                isSelected={form.loginTheme === theme}
                key={theme}
                label={t(THEME_LABELS[theme])}
                style={{ backgroundImage: getLoginGradient(swatchBranding) }}
                onClick={() => update('loginTheme', theme)}
              />
            );
          })}
        </div>
        {form.loginTheme === 'custom' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              id="customPrimaryColor"
              label={t({ en: 'Gradient Start', es: 'Inicio del degradado', fr: 'Début du dégradé' })}
              swatchFallback="#000000"
              value={form.customPrimaryColor}
              onChange={(v) => update('customPrimaryColor', v)}
            />
            <ColorField
              id="customSecondaryColor"
              label={t({ en: 'Gradient End', es: 'Fin del degradado', fr: 'Fin du dégradé' })}
              swatchFallback="#000000"
              value={form.customSecondaryColor}
              onChange={(v) => update('customSecondaryColor', v)}
            />
          </div>
        )}
      </Card.Content>
    </Card>
  );
};
