import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { BrandingEditor } from './hooks';

/**
 * Unsaved-changes confirmation — shown when the user tries to navigate away while
 * dirty. "No" is auto-focused so Enter keeps them on the page.
 */
export const UnsavedChangesDialog = ({ blocker }: { blocker: BrandingEditor['blocker'] }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={blocker.status === 'blocked'} onOpenChange={() => blocker.reset?.()}>
      <Dialog.Content>
        <Dialog.Title>
          {t({ en: 'Unsaved Changes', es: 'Cambios sin guardar', fr: 'Modifications non enregistrées' })}
        </Dialog.Title>
        <Dialog.Description>
          {t({
            en: 'You have unsaved changes. Are you sure you want to leave? Your changes will be lost. Select "No" and click the X in the top-right corner to keep your changes.',
            es: 'Tiene cambios sin guardar. ¿Está seguro de que desea salir? Sus cambios se perderán. Seleccione "No" y haga clic en la X en la esquina superior derecha para conservar sus cambios.',
            fr: 'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ? Vos modifications seront perdues. Sélectionnez « Non » et cliquez sur le X en haut à droite pour conserver vos modifications.'
          })}
        </Dialog.Description>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => blocker.proceed?.()}>
            {t({ en: 'Yes', es: 'Sí', fr: 'Oui' })}
          </Button>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <Button autoFocus type="button" onClick={() => blocker.reset?.()}>
            {t({ en: 'No', es: 'No', fr: 'Non' })}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
