import { useEffect, useState } from 'react';

import { formatByteSize } from '@douglasneuroinformatics/libjs';
import { Heading, Input, Popover, Tooltip } from '@douglasneuroinformatics/libui/components';
import { CopyButton } from '@opendatacapture/react-core';
import { Share2Icon } from 'lucide-react';

import { useFilesRef } from '@/hooks/useFilesRef';
import { useAppStore } from '@/store';
import { encodeShareURL } from '@/utils/encode';

export const ShareButton = () => {
  const label = useAppStore((store) => store.selectedInstrument.label);
  const editorFilesRef = useFilesRef();
  const [shareURL, setShareURL] = useState(encodeShareURL({ files: editorFilesRef.current, label }));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // The user cannot modify the editor without closing the popover
  useEffect(() => {
    if (isPopoverOpen) {
      setShareURL(encodeShareURL({ files: editorFilesRef.current, label }));
    }
  }, [isPopoverOpen, label]);

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
            <Heading variant="h5">Share Instrument</Heading>
            <p className="text-muted-foreground text-sm">
              Anyone with this link can open a snapshot of the current code in your playground. The total size of the
              URL-encoded source files for this instrument is {formatByteSize(shareURL.size)}.
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Input readOnly className="h-9" id="link" value={shareURL.href} />
            <CopyButton size="sm" text={shareURL.href} />
          </div>
        </Popover.Content>
      </Popover>
      <Tooltip.Content side="bottom">
        <p>Share</p>
      </Tooltip.Content>
    </Tooltip>
  );
};
