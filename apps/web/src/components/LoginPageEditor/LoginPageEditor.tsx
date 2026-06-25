import React, { useState } from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { PageHeader } from '@/components/PageHeader';

import { FORM_ID } from './constants';
import { useBrandingForm } from './hooks';
import { FullscreenPreviewDialog } from './preview/FullscreenPreviewDialog';
import { PreviewColumn } from './preview/PreviewColumn';
import { EnableBrandingCard } from './sections/EnableBrandingCard';
import { FooterCard } from './sections/FooterCard';
import { LeftPanelThemeCard } from './sections/LeftPanelThemeCard';
import { RightPanelThemeCard } from './sections/RightPanelThemeCard';
import { SectionCard } from './sections/SectionCards';
import { TextColorCard } from './sections/TextColorCard';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

/**
 * Admin "Customize Login Page" editor. Owns the branding form via `useBrandingForm`
 * and lays out the editor column (orderable section cards + global cards), the live
 * preview column, and the fullscreen / unsaved-changes dialogs. The `form` returned
 * by the hook is the single source of truth, threaded to every child as `editor`.
 */
export const LoginPageEditor = () => {
  const { t } = useTranslation();
  const editor = useBrandingForm();
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'fr'>('en');

  return (
    <React.Fragment>
      {/*
        `overflow-x-clip` prevents any unintended horizontal overflow on this
        page (e.g. from very long URLs in an Input). We use `clip` rather than
        `hidden` because hidden would create a scrolling context that breaks
        the `lg:sticky` preview column inside this wrapper.
      */}
      <div className="w-full overflow-x-clip">
        <PageHeader>
          <Heading className="text-center" variant="h2">
            {t({ en: 'Customize Login Page', fr: 'Personnaliser la page de connexion' })}
          </Heading>
        </PageHeader>

        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Stop Enter in a text input from submitting the whole form (it should
            only submit via the explicit Save button). The key handler lives on
            the <form> deliberately, hence the a11y rule is disabled here. */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <form
            className="flex flex-col gap-6"
            id={FORM_ID}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') e.preventDefault();
            }}
            onSubmit={editor.handleSubmit}
          >
            <EnableBrandingCard editor={editor} />
            {editor.form.sectionsOrder.map((section) => (
              <SectionCard editor={editor} key={section} section={section} />
            ))}
            <FooterCard editor={editor} />
            <LeftPanelThemeCard editor={editor} />
            <TextColorCard editor={editor} />
            <RightPanelThemeCard editor={editor} />
          </form>

          <PreviewColumn
            editor={editor}
            previewLang={previewLang}
            onOpenFullscreen={() => setShowFullscreen(true)}
            onPreviewLangChange={setPreviewLang}
          />
        </div>
      </div>

      <FullscreenPreviewDialog
        editor={editor}
        open={showFullscreen}
        previewLang={previewLang}
        onOpenChange={setShowFullscreen}
      />
      <UnsavedChangesDialog blocker={editor.blocker} />
    </React.Fragment>
  );
};
