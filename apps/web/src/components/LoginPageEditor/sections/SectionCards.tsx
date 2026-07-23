import React from 'react';

import { Button, Card, Input, Label, RadioGroup, Select, TextArea } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { LOGO_ALIGNMENTS, LOGO_SIZES } from '@opendatacapture/schemas/setup';
import type { LogoAlignment, LogoSize, LogoSource, PanelSection } from '@opendatacapture/schemas/setup';
import { PlusIcon, TrashIcon, UploadIcon, XIcon } from 'lucide-react';

import {
  ACCEPTED_LOGO_MIME_TYPES,
  LOGO_ALIGNMENT_LABELS,
  LOGO_SIZE_LABELS,
  SECTION_TITLES,
  URL_PATTERN
} from '../constants';
import { FontSizeField } from '../fields/FontSizeField';
import { SectionHeader } from '../fields/SectionHeader';

import type { BrandingEditor } from '../hooks';

type CardProps = { editor: BrandingEditor };

/**
 * Checkerboard backdrop used behind the uploaded-logo preview so genuine
 * transparency is visible (rather than appearing as a solid square). If a logo
 * still looks like an opaque rectangle over this pattern, the image file itself
 * has a baked-in background and needs to be re-exported with an alpha channel.
 */
const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #c7c7c7 25%, transparent 25%), linear-gradient(-45deg, #c7c7c7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #c7c7c7 75%), linear-gradient(-45deg, transparent 75%, #c7c7c7 75%)',
  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
  backgroundSize: '12px 12px'
};

const DetailsCard = ({ editor }: CardProps) => {
  const { t } = useTranslation();
  const { form, update, updateText } = editor;
  return (
    <Card key="details">
      <SectionHeader
        bold={{ checked: form.boldDetails, id: 'boldDetails', onChange: (b) => update('boldDetails', b) }}
        description={t({
          en: 'Additional notes shown on the branding panel',
          fr: 'Remarques supplémentaires figurant sur le panneau de marque.'
        })}
        editor={editor}
        section="details"
        show={{ checked: form.showDetails, id: 'showDetails', onChange: (b) => update('showDetails', b) }}
        title={t(SECTION_TITLES.details)}
      />
      {form.showDetails && (
        <Card.Content className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="instanceDetails-en">{t({ en: 'English', fr: 'Anglais' })}</Label>
              <TextArea
                id="instanceDetails-en"
                maxLength={300}
                rows={3}
                value={form.instanceDetails.en}
                onChange={(e) => updateText('instanceDetails', 'en', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="instanceDetails-fr">{t({ en: 'French', fr: 'Français' })}</Label>
              <TextArea
                id="instanceDetails-fr"
                maxLength={300}
                rows={3}
                value={form.instanceDetails.fr}
                onChange={(e) => updateText('instanceDetails', 'fr', e.target.value)}
              />
            </div>
          </div>
          <FontSizeField
            id="detailsFontSize"
            value={form.detailsFontSize}
            onChange={(v) => update('detailsFontSize', v)}
          />
        </Card.Content>
      )}
    </Card>
  );
};

const LogoCard = ({ editor }: CardProps) => {
  const { t } = useTranslation();
  const { fileInputRef, form, handleLogoFile, isCustomSizeInvalid, update } = editor;
  return (
    <Card key="logo">
      <SectionHeader
        description={t({
          en: 'Upload an image up to 2 MB (SVG, PNG, JPEG, WebP) or link to one. PNG and JPEG uploads are converted to WebP to save space.',
          fr: "Téléversez une image jusqu'à 2 Mo (SVG, PNG, JPEG, WebP) ou indiquez un lien. Les téléversements PNG et JPEG sont convertis en WebP pour économiser de l'espace."
        })}
        editor={editor}
        section="logo"
        show={{ checked: form.showLogo, id: 'showLogo', onChange: (b) => update('showLogo', b) }}
        title={t(SECTION_TITLES.logo)}
      />
      {form.showLogo && (
        <Card.Content className="flex flex-col gap-4">
          {/*
            An uploaded image and a URL can both be saved at once; the radio
            selects which one the login page actually renders. The inactive
            option is dimmed (but still editable) to signal it isn't in use.
          */}
          <RadioGroup
            className="gap-5"
            value={form.logoSource}
            onValueChange={(v) => update('logoSource', v as LogoSource)}
          >
            {/* Uploaded image slot */}
            <div className={cn('flex flex-col gap-3', form.logoSource !== 'upload' && 'opacity-60')}>
              <div className="flex items-center gap-2">
                <RadioGroup.Item id="logoSource-upload" value="upload" />
                <Label className="cursor-pointer font-medium" htmlFor="logoSource-upload">
                  {t({ en: 'Uploaded image', fr: 'Image téléversée' })}
                </Label>
              </div>
              <div className="pl-6">
                <input
                  accept={ACCEPTED_LOGO_MIME_TYPES.join(',')}
                  className="hidden"
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    handleLogoFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <div className="relative w-full max-w-xs">
                  {/* The box itself is the upload target: click anywhere to pick a file. */}
                  <button
                    className="bg-muted hover:border-primary/50 flex h-24 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed p-2 text-center transition-colors"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {form.customLogoSrc ? (
                      <React.Fragment>
                        <img
                          alt="Logo preview"
                          className="max-h-12 w-auto rounded object-contain"
                          src={form.customLogoSrc}
                          style={CHECKERBOARD_STYLE}
                        />
                        <span className="text-muted-foreground text-xs">
                          {t({ en: 'Click to replace', fr: 'Cliquez pour remplacer' })}
                        </span>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <UploadIcon className="text-muted-foreground h-5 w-5" />
                        <span className="text-muted-foreground text-xs">
                          {t({ en: 'Click to upload', fr: 'Cliquez pour téléverser' })}
                        </span>
                      </React.Fragment>
                    )}
                  </button>
                  {/* Clears only the uploaded image; the saved URL is left intact. */}
                  {form.customLogoSrc && (
                    <Button
                      aria-label={t({ en: 'Remove', fr: 'Retirer' })}
                      className="bg-background/80 hover:bg-background absolute right-1.5 top-1.5 h-7 w-7 rounded-full border p-0 shadow-sm backdrop-blur-sm"
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => update('customLogoSrc', '')}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Image URL slot */}
            <div className={cn('flex flex-col gap-3', form.logoSource !== 'url' && 'opacity-60')}>
              <div className="flex items-center gap-2">
                <RadioGroup.Item id="logoSource-url" value="url" />
                <Label className="cursor-pointer font-medium" htmlFor="logoSource-url">
                  {t({ en: 'Image URL', fr: "URL de l'image" })}
                </Label>
              </div>
              <div className="pl-6">
                <Input
                  aria-label={t({ en: 'Image URL', fr: "URL de l'image" })}
                  maxLength={2000}
                  placeholder="https://example.org/logo.png"
                  value={form.customLogoUrl}
                  onChange={(e) => update('customLogoUrl', e.target.value)}
                />
              </div>
            </div>
          </RadioGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="logoSize">{t({ en: 'Size', fr: 'Taille' })}</Label>
              <Select value={form.logoSize} onValueChange={(v) => update('logoSize', v as LogoSize)}>
                <Select.Trigger id="logoSize">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    {LOGO_SIZES.map((s) => (
                      <Select.Item key={s} value={s}>
                        {t(LOGO_SIZE_LABELS[s])}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="logoAlignment">{t({ en: 'Alignment', fr: 'Alignement' })}</Label>
              <Select value={form.logoAlignment} onValueChange={(v) => update('logoAlignment', v as LogoAlignment)}>
                <Select.Trigger id="logoAlignment">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    {LOGO_ALIGNMENTS.map((a) => (
                      <Select.Item key={a} value={a}>
                        {t(LOGO_ALIGNMENT_LABELS[a])}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select>
            </div>
          </div>
          {form.logoSize === 'custom' && (
            <div className="flex flex-col gap-2">
              <Label>{t({ en: 'Custom dimensions (pixels)', fr: 'Dimensions personnalisées (pixels)' })}</Label>
              <div className="flex items-center gap-2">
                <Input
                  aria-label={t({ en: 'Width', fr: 'Largeur' })}
                  inputMode="numeric"
                  placeholder={t({ en: 'Width', fr: 'Largeur' })}
                  value={form.customLogoWidth}
                  onChange={(e) => update('customLogoWidth', e.target.value.replace(/[^0-9]/g, ''))}
                />
                <span className="text-muted-foreground text-sm">×</span>
                <Input
                  aria-label={t({ en: 'Height', fr: 'Hauteur' })}
                  inputMode="numeric"
                  placeholder={t({ en: 'Height', fr: 'Hauteur' })}
                  value={form.customLogoHeight}
                  onChange={(e) => update('customLogoHeight', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              {isCustomSizeInvalid && (
                <p className="text-destructive text-xs">
                  {t({
                    en: 'Enter at least one positive value (1–5000).',
                    fr: 'Entrez au moins une valeur positive (1–5000).'
                  })}
                </p>
              )}
            </div>
          )}
        </Card.Content>
      )}
    </Card>
  );
};

const NameCard = ({ editor }: CardProps) => {
  const { t } = useTranslation();
  const { form, update, updateText } = editor;
  return (
    <Card key="name">
      <SectionHeader
        bold={{ checked: form.boldName, id: 'boldName', onChange: (b) => update('boldName', b) }}
        description={t({
          en: 'The primary name shown on the login page.',
          fr: 'Le nom principal affiché sur la page de connexion.'
        })}
        editor={editor}
        section="name"
        title={t(SECTION_TITLES.name)}
      />
      <Card.Content className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="instanceName-en">{t({ en: 'English', fr: 'Anglais' })}</Label>
            <Input
              id="instanceName-en"
              maxLength={60}
              placeholder="Open Data Capture"
              value={form.instanceName.en}
              onChange={(e) => updateText('instanceName', 'en', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="instanceName-fr">{t({ en: 'French', fr: 'Français' })}</Label>
            <Input
              id="instanceName-fr"
              maxLength={60}
              placeholder="Open Data Capture"
              value={form.instanceName.fr}
              onChange={(e) => updateText('instanceName', 'fr', e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nameAlignment">{t({ en: 'Alignment', fr: 'Alignement' })}</Label>
            <Select value={form.nameAlignment} onValueChange={(v) => update('nameAlignment', v as LogoAlignment)}>
              <Select.Trigger id="nameAlignment">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  {LOGO_ALIGNMENTS.map((a) => (
                    <Select.Item key={a} value={a}>
                      {t(LOGO_ALIGNMENT_LABELS[a])}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select>
          </div>
          <FontSizeField id="nameFontSize" value={form.nameFontSize} onChange={(v) => update('nameFontSize', v)} />
        </div>
      </Card.Content>
    </Card>
  );
};

const ResourcesCard = ({ editor }: CardProps) => {
  const { t } = useTranslation();
  const { addResourceLink, form, removeResourceLink, update, updateResourceLinkHref, updateResourceLinkLabel } = editor;
  return (
    <Card key="resources">
      <SectionHeader
        bold={{
          checked: form.boldResourceLinks,
          id: 'boldResourceLinks',
          onChange: (b) => update('boldResourceLinks', b)
        }}
        description={t({ en: 'Optional links shown on the branding panel.', fr: 'Liens optionnels sur le panneau.' })}
        editor={editor}
        section="resources"
        show={{
          checked: form.showResourceLinks,
          id: 'showResourceLinks',
          onChange: (b) => update('showResourceLinks', b)
        }}
        title={t(SECTION_TITLES.resources)}
      />
      {form.showResourceLinks && (
        <Card.Content className="flex flex-col gap-3">
          {form.resourceLinks.length === 0 && (
            <p className="text-muted-foreground text-sm">
              {t({ en: 'No links yet. Add one to get started.', fr: "Aucun lien pour l'instant." })}
            </p>
          )}
          {form.resourceLinks.map((link, index) => {
            const hrefInvalid = link.href.trim() !== '' && !URL_PATTERN.test(link.href.trim());
            return (
              <div className="flex flex-col gap-2 rounded-md border p-3" key={index}>
                <div className="flex items-start justify-between gap-2">
                  <Label className="text-sm font-medium">
                    {t({ en: `Link ${index + 1}`, fr: `Lien ${index + 1}` })}
                  </Label>
                  <Button
                    aria-label={t({ en: 'Remove', fr: 'Retirer' })}
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => removeResourceLink(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    aria-label={t({ en: 'Label (English)', fr: 'Libellé (anglais)' })}
                    maxLength={120}
                    placeholder={t({ en: 'Label (English)', fr: 'Libellé (anglais)' })}
                    value={link.label.en}
                    onChange={(e) => updateResourceLinkLabel(index, 'en', e.target.value)}
                  />
                  <Input
                    aria-label={t({ en: 'Label (French)', fr: 'Libellé (français)' })}
                    maxLength={120}
                    placeholder={t({ en: 'Label (French)', fr: 'Libellé (français)' })}
                    value={link.label.fr}
                    onChange={(e) => updateResourceLinkLabel(index, 'fr', e.target.value)}
                  />
                </div>
                <Input
                  aria-invalid={hrefInvalid}
                  aria-label="URL"
                  maxLength={2000}
                  placeholder="https://example.org"
                  value={link.href}
                  onChange={(e) => updateResourceLinkHref(index, e.target.value)}
                />
                {hrefInvalid && (
                  <p className="text-destructive text-xs">
                    {t({
                      en: 'URL must start with http:// or https:// and include a domain (e.g. example.com).',
                      fr: "L'URL doit commencer par http:// ou https:// et inclure un domaine (ex. example.com)."
                    })}
                  </p>
                )}
              </div>
            );
          })}
          <Button className="self-start" size="sm" type="button" variant="outline" onClick={addResourceLink}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            {t({ en: 'Add link', fr: 'Ajouter un lien' })}
          </Button>
          <FontSizeField
            id="resourceLinksFontSize"
            value={form.resourceLinksFontSize}
            onChange={(v) => update('resourceLinksFontSize', v)}
          />
        </Card.Content>
      )}
    </Card>
  );
};

const TaglineCard = ({ editor }: CardProps) => {
  const { t } = useTranslation();
  const { form, update, updateText } = editor;
  return (
    <Card key="tagline">
      <SectionHeader
        bold={{ checked: form.boldTagline, id: 'boldTagline', onChange: (b) => update('boldTagline', b) }}
        description={t({
          en: 'A short description shown on the branding panel',
          fr: 'Une courte description figurant sur le panneau de marque.'
        })}
        editor={editor}
        section="tagline"
        show={{ checked: form.showTagline, id: 'showTagline', onChange: (b) => update('showTagline', b) }}
        title={t(SECTION_TITLES.tagline)}
      />
      {form.showTagline && (
        <Card.Content className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="instanceTagline-en">{t({ en: 'English', fr: 'Anglais' })}</Label>
              <TextArea
                id="instanceTagline-en"
                maxLength={300}
                rows={2}
                value={form.instanceTagline.en}
                onChange={(e) => updateText('instanceTagline', 'en', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="instanceTagline-fr">{t({ en: 'French', fr: 'Français' })}</Label>
              <TextArea
                id="instanceTagline-fr"
                maxLength={300}
                rows={2}
                value={form.instanceTagline.fr}
                onChange={(e) => updateText('instanceTagline', 'fr', e.target.value)}
              />
            </div>
          </div>
          <FontSizeField
            id="taglineFontSize"
            value={form.taglineFontSize}
            onChange={(v) => update('taglineFontSize', v)}
          />
        </Card.Content>
      )}
    </Card>
  );
};

/** Dispatches to the matching card for an orderable panel section. */
export const SectionCard = ({ editor, section }: { editor: BrandingEditor; section: PanelSection }) => {
  switch (section) {
    case 'details':
      return <DetailsCard editor={editor} />;
    case 'logo':
      return <LogoCard editor={editor} />;
    case 'name':
      return <NameCard editor={editor} />;
    case 'resources':
      return <ResourcesCard editor={editor} />;
    case 'tagline':
      return <TaglineCard editor={editor} />;
    default:
      return null;
  }
};
