import React from 'react';

import { Button, Dialog, Label, Switch } from '@douglasneuroinformatics/libui/components';

export type UserSettingsProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UserSettings = ({ isOpen, setIsOpen }: UserSettingsProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>User Settings</Dialog.Title>
          <Dialog.Description>
            The content filter flags text that may violate our content policy. It&apos;s powered by our moderation
            endpoint which is free to use to moderate your OpenAI API traffic. Learn more.
          </Dialog.Description>
        </Dialog.Header>
        <div className="py-6">
          <h4 className="text-muted-foreground text-sm">Playground Warnings</h4>
          <div className="flex items-start justify-between space-x-4 pt-3">
            <Switch defaultChecked={true} id="show" name="show" />
            <Label className="grid gap-1 font-normal" htmlFor="show">
              <span className="font-semibold">Show a warning when content is flagged</span>
              <span className="text-muted-foreground text-sm">
                A warning will be shown when sexual, hateful, violent or self-harm content is detected.
              </span>
            </Label>
          </div>
        </div>
        <Dialog.Footer>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
