import React from 'react';

import { Button, Input, Label, Popover } from '@douglasneuroinformatics/libui/components';
import { CopyIcon } from 'lucide-react';

export const ShareButton = () => {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="secondary">Share</Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-[520px]">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold">Share preset</h3>
          <p className="text-muted-foreground text-sm">
            Anyone who has this link and an OpenAI account will be able to view this.
          </p>
        </div>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Label className="sr-only" htmlFor="link">
              Link
            </Label>
            <Input
              readOnly
              className="h-9"
              defaultValue="https://platform.openai.com/playground/p/7bbKYQvsVkNmVb8NGcdUOLae?model=text-davinci-003"
              id="link"
            />
          </div>
          <Button className="px-3" size="sm" type="submit">
            <span className="sr-only">Copy</span>
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
};
