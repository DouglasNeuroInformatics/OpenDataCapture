import React, { useEffect, useState } from 'react';

import { Button, Heading, Input, Popover } from '@douglasneuroinformatics/libui/components';
import { CopyButton } from '@opendatacapture/react-core';
import { ShareIcon } from 'lucide-react';

import { useEditorValueRef } from '@/hooks/useEditorValueRef';
import { generateShareLink } from '@/utils/share';

export const ShareButton = () => {
  const editorValueRef = useEditorValueRef();
  const [shareLink, setShareLink] = useState(generateShareLink(editorValueRef.current));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // The user cannot modify the editor without closing the popover
  useEffect(() => {
    if (isPopoverOpen) {
      setShareLink(generateShareLink(editorValueRef.current));
    }
  }, [isPopoverOpen]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Popover.Trigger asChild>
        <Button className="h-9 w-9" size="icon" variant="outline">
          <ShareIcon />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-[520px] p-4">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <Heading variant="h4">Share Instrument (Experimental)</Heading>
          <p className="text-muted-foreground text-sm">
            Anyone with this link can open a snapshot of the current code in your playground.
          </p>
        </div>
        <div className="flex gap-2 pt-4">
          <Input readOnly className="h-9" id="link" value={shareLink.href} />
          <CopyButton size="sm" text={shareLink.href} />
        </div>
      </Popover.Content>
    </Popover>
  );
};
