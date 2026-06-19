import { Button, Card, Dialog, Heading, Input, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { Logo } from '@opendatacapture/react-core';

import { LoginBrandingPanel } from '@/components/LoginBranding';
import { getRightPanelGradient } from '@/utils/branding';

import type { BrandingEditor } from '../hooks';

type FullscreenPreviewDialogProps = {
  editor: BrandingEditor;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  previewLang: 'en' | 'fr';
};

/**
 * Fullscreen preview. libui's `Dialog` handles the portal, overlay, focus trap,
 * ESC-to-close, click-outside dismiss, and close button. The className overrides
 * stretch the default centered modal to fill the viewport so the two-panel mock
 * fits edge to edge.
 */
export const FullscreenPreviewDialog = ({ editor, onOpenChange, open, previewLang }: FullscreenPreviewDialogProps) => {
  const { t } = useTranslation();
  const { form, previewBranding } = editor;
  const rightGradient = getRightPanelGradient(previewBranding);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        className="inset-0 flex h-full max-h-screen w-full max-w-full translate-x-0 translate-y-0 gap-0 overflow-hidden border-0 p-0 shadow-none sm:max-w-full sm:rounded-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Dialog.Title className="sr-only">
          {t({ en: 'Login page fullscreen preview', fr: 'Aperçu plein écran de la page de connexion' })}
        </Dialog.Title>
        <Dialog.Description className="sr-only">
          {t({
            en: 'A full-screen preview of how the login page will appear to users with the current branding settings.',
            fr: 'Un aperçu plein écran de la page de connexion telle que les utilisateurs la verront avec les paramètres de personnalisation actuels.'
          })}
        </Dialog.Description>
        {/* Left — branding panel */}
        {form.enableBranding && (
          <LoginBrandingPanel
            branding={previewBranding}
            className="flex w-1/2 overflow-y-auto xl:w-3/5"
            lang={previewLang}
          />
        )}
        {/* Right — actual login form mockup */}
        <div
          className={cn(
            'bg-background relative flex flex-col items-center justify-center overflow-y-auto p-8',
            form.enableBranding ? 'w-1/2 xl:w-2/5' : 'w-full'
          )}
          style={form.enableBranding && rightGradient ? { backgroundImage: rightGradient } : undefined}
        >
          <Card className="w-full max-w-sm border-none shadow-none">
            <Card.Header className="flex flex-col items-center justify-center pb-2">
              <Logo className="m-1.5 h-auto w-14" variant="auto" />
              <Heading variant="h2">{previewLang === 'fr' ? 'Se connecter' : 'Login'}</Heading>
            </Card.Header>
            <Card.Content className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>{previewLang === 'fr' ? "Nom d'utilisateur" : 'Username'}</Label>
                <Input disabled placeholder={previewLang === 'fr' ? "Nom d'utilisateur" : 'Username'} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{previewLang === 'fr' ? 'Mot de passe' : 'Password'}</Label>
                <Input disabled placeholder="••••••••" type="password" />
              </div>
              <Button disabled className="mt-1 w-full">
                {previewLang === 'fr' ? 'Se connecter' : 'Login'}
              </Button>
            </Card.Content>
          </Card>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
