import React from 'react';

import { Button, Card, Checkbox, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { PanelSection } from '@opendatacapture/schemas/setup';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { BoldToggle } from './BoldToggle';

import type { BrandingEditor } from '../useBrandingForm';

type ToggleConfig = { checked: boolean; id: string; onChange: (checked: boolean) => void };

type SectionHeaderProps = {
  /** Optional bold toggle shown beside the title. */
  bold?: ToggleConfig;
  description: React.ReactNode;
  editor: BrandingEditor;
  section: PanelSection;
  /** Optional "Show" checkbox shown beside the title. */
  show?: ToggleConfig;
  title: string;
};

/** Up/down buttons that reorder a section within the branding panel. */
const OrderButtons = ({ editor, section }: { editor: BrandingEditor; section: PanelSection }) => {
  const { t } = useTranslation();
  const { form, moveSection } = editor;
  const idx = form.sectionsOrder.indexOf(section);
  return (
    <div className="flex shrink-0 gap-0.5">
      <Button
        aria-label={t({ en: 'Move up', fr: 'Haut' })}
        disabled={idx <= 0}
        size="sm"
        type="button"
        variant="ghost"
        onClick={() => moveSection(idx, idx - 1)}
      >
        <ChevronUpIcon className="h-4 w-4" />
      </Button>
      <Button
        aria-label={t({ en: 'Move down', fr: 'Bas' })}
        disabled={idx >= form.sectionsOrder.length - 1}
        size="sm"
        type="button"
        variant="ghost"
        onClick={() => moveSection(idx, idx + 1)}
      >
        <ChevronDownIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

/**
 * Shared header for every orderable section card: the section title, an optional
 * Show checkbox and Bold toggle, a description, and the reorder buttons.
 */
export const SectionHeader = ({ bold, description, editor, section, show, title }: SectionHeaderProps) => {
  const { t } = useTranslation();
  return (
    <Card.Header>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Card.Title>{title}</Card.Title>
            {show && (
              <div className="flex items-center gap-2">
                <Checkbox checked={show.checked} id={show.id} onCheckedChange={(c) => show.onChange(c === true)} />
                <Label className="cursor-pointer text-sm font-normal" htmlFor={show.id}>
                  {t({ en: 'Show', fr: 'Afficher' })}
                </Label>
              </div>
            )}
            {bold && <BoldToggle checked={bold.checked} id={bold.id} onChange={bold.onChange} />}
          </div>
          <Card.Description className="mt-1">{description}</Card.Description>
        </div>
        <OrderButtons editor={editor} section={section} />
      </div>
    </Card.Header>
  );
};
