import { Button, Label, Tabs } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { MaximizeIcon } from 'lucide-react';

import { LoginBrandingPanel } from '@/components/LoginBranding';
import { getRightPanelGradient } from '@/utils/branding';

import { FORM_ID } from '../constants';

import type { BrandingEditor } from '../hooks';

type PreviewColumnProps = {
  editor: BrandingEditor;
  onOpenFullscreen: () => void;
  onPreviewLangChange: (lang: 'en' | 'fr') => void;
  previewLang: 'en' | 'fr';
};

/**
 * Right column: a live preview mirroring the actual login layout (two-panel when
 * branding is enabled, centered single-panel when disabled), a language toggle, a
 * fullscreen trigger, and the Save button (wired to the form via `FORM_ID`).
 */
export const PreviewColumn = ({ editor, onOpenFullscreen, onPreviewLangChange, previewLang }: PreviewColumnProps) => {
  const { t } = useTranslation();
  const { form, isSubmitDisabled, previewBranding } = editor;
  const rightGradient = getRightPanelGradient(previewBranding);
  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      {/* Preview header */}
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-muted-foreground">
          {t({ en: 'Live Preview', es: 'Vista previa en vivo', fr: 'Aperçu en direct' })}
        </Label>
        <div className="flex items-center gap-1">
          {/* Language toggle — drives `previewLang` state; no content panes needed */}
          <Tabs value={previewLang} onValueChange={(v) => onPreviewLangChange(v as 'en' | 'fr')}>
            <Tabs.List className="h-7 p-0.5">
              <Tabs.Trigger className="h-6 px-2 text-xs" value="en">
                EN
              </Tabs.Trigger>
              <Tabs.Trigger className="h-6 px-2 text-xs" value="fr">
                FR
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
          <Button
            aria-label={t({
              en: 'Fullscreen preview',
              es: 'Vista previa a pantalla completa',
              fr: 'Aperçu plein écran'
            })}
            size="sm"
            type="button"
            variant="ghost"
            onClick={onOpenFullscreen}
          >
            <MaximizeIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview card — mirrors the actual login page layout: two-panel when
          branding is enabled, centered single-panel when disabled. */}
      <div className="bg-background aspect-4/3 flex w-full overflow-hidden rounded-xl border shadow-sm">
        {form.enableBranding && (
          <LoginBrandingPanel
            preview
            branding={previewBranding}
            className="hidden w-3/5 overflow-hidden sm:flex"
            lang={previewLang}
          />
        )}
        <div
          className={cn(
            'bg-background flex flex-col items-center justify-center gap-3 p-6',
            form.enableBranding ? 'w-full sm:w-2/5' : 'w-full'
          )}
          style={form.enableBranding && rightGradient ? { backgroundImage: rightGradient } : undefined}
        >
          <div className="bg-muted h-8 w-8 rounded-full" />
          <div className="bg-foreground/80 h-2.5 w-20 rounded" />
          <div className={cn('bg-muted h-7 rounded-md', form.enableBranding ? 'w-full' : 'w-2/5')} />
          <div className={cn('bg-muted h-7 rounded-md', form.enableBranding ? 'w-full' : 'w-2/5')} />
          <div className={cn('bg-primary h-7 rounded-md', form.enableBranding ? 'w-full' : 'w-2/5')} />
        </div>
      </div>

      {/* Save button — centered below preview */}
      <div className="mt-10 flex justify-center">
        <Button className="min-w-40" disabled={isSubmitDisabled} form={FORM_ID} type="submit">
          {t('core.save')}
        </Button>
      </div>
    </div>
  );
};
