import { useEffect, useState } from 'react';

import { formatByteSize } from '@douglasneuroinformatics/libjs';
import { Heading, Input, Label, Popover, Tooltip } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CopyButton } from '@opendatacapture/react-core';
import { CircleHelpIcon, Share2Icon } from 'lucide-react';

import { useFilesRef } from '@/hooks/useFilesRef';
import { useAppStore } from '@/store';
import { encodeShareURL } from '@/utils/encode';

export const ShareButton = () => {
  const label = useAppStore((store) => store.selectedInstrument.label);
  const editorFilesRef = useFilesRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareURL, setShareURL] = useState(encodeShareURL({ files: editorFilesRef.current, label }));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const { t } = useTranslation();

  // The user cannot modify the editor without closing the popover
  useEffect(() => {
    if (isPopoverOpen) {
      setShareURL(encodeShareURL({ files: editorFilesRef.current, fullscreen: isFullscreen, label }));
    }
  }, [isFullscreen, isPopoverOpen, label]);

  return (
    <Tooltip
      open={isTooltipOpen}
      onOpenChange={(open) => {
        if (!isPopoverOpen) {
          setIsTooltipOpen(open);
        }
      }}
    >
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Popover.Trigger asChild>
          <Tooltip.Trigger className="h-9 w-9" size="icon" variant="outline">
            <Share2Icon />
          </Tooltip.Trigger>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-[520px] p-4">
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <Heading variant="h5">{t({ en: 'Share Instrument', fr: "Partager l'instrument" })}</Heading>
            <p className="text-muted-foreground text-sm">
              {t({
                en: 'Anyone with this link can open a snapshot of the current code in your playground. The total size of the URL-encoded source files for this instrument is ',
                fr: "Toute personne disposant de ce lien peut ouvrir un aperçu du code actuel dans votre terrain de jeu. La taille totale des fichiers sources encodés dans l'URL pour cet instrument est de "
              })}
              {formatByteSize(shareURL.size)}.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-normal" htmlFor="readonly-fullscreen">
                {t({ en: 'Preview Mode', fr: 'Mode aperçu' })}
              </Label>
              <Tooltip>
                <Tooltip.Trigger
                  className="text-muted-foreground h-auto w-auto cursor-help p-0"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <CircleHelpIcon className="h-4 w-4" />
                </Tooltip.Trigger>
                <Tooltip.Content className="max-w-60" side="top">
                  <p>
                    {t({
                      en: 'Anyone with the link opens the instrument fullscreen as a preview they can try, with no editor and no ability to make changes.',
                      fr: "Toute personne disposant du lien ouvre l'instrument en plein écran comme un aperçu qu'elle peut essayer, sans éditeur ni possibilité de le modifier."
                    })}
                  </p>
                </Tooltip.Content>
              </Tooltip>
            </div>
            <button
              aria-checked={isFullscreen}
              className="focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-hidden peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              data-state={isFullscreen ? 'checked' : 'unchecked'}
              id="readonly-fullscreen"
              role="switch"
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
            >
              <span
                className="bg-background pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                data-state={isFullscreen ? 'checked' : 'unchecked'}
              />
            </button>
          </div>
          <div className="flex gap-2 pt-4">
            <Input readOnly className="h-9" id="link" value={shareURL.href} />
            <CopyButton size="sm" text={shareURL.href} />
          </div>
        </Popover.Content>
      </Popover>
      <Tooltip.Content side="bottom">
        <p>{t({ en: 'Share', fr: 'Partager' })}</p>
      </Tooltip.Content>
    </Tooltip>
  );
};
